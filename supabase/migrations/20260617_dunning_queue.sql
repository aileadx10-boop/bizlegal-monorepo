-- Agent S2: staged dunning queue for incomplete checkouts / lapsed subscriptions
CREATE TABLE IF NOT EXISTS dunning_queue (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email                TEXT          NOT NULL,
    name                 TEXT,
    product              TEXT          NOT NULL,   -- 'docai' | 'lexaudit' | 'forge' | 'hub'
    amount_usd           NUMERIC(10,2),
    payment_initiated_at TIMESTAMPTZ   NOT NULL,
    last_stage_sent      INTEGER       DEFAULT 0,  -- 0=none, 3=day3, 7=day7, 14=day14
    last_sent_at         TIMESTAMPTZ,
    converted_at         TIMESTAMPTZ,              -- set when payment confirmed
    opted_out_at         TIMESTAMPTZ,
    created_at           TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dunning_queue_email ON dunning_queue(email);
CREATE INDEX IF NOT EXISTS idx_dunning_queue_active ON dunning_queue(converted_at, opted_out_at)
    WHERE converted_at IS NULL AND opted_out_at IS NULL;
