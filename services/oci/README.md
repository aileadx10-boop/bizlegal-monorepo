# BizLegal-AI OCI Deal Router

High-ticket referral funnel for UAE real-estate / SG family-office / US Reg D
leads. Single Haiku 4.5 call per lead, escalates to Sonnet 4.6 on
revenue-affecting low-confidence outputs. Routes to placeholder partner
during dev; real partners replace the placeholder before go-live.

Stream B of the BizLegal-AI workspace. Stream A (compliance products) is
unaffected — this lives at `oci-deal-router/` only.

## Layout

```
oci-deal-router/
  Caddyfile                  TLS reverse-proxy (B6 default; lighter than nginx)
  docker-compose.yml         router + redis (mem-capped 256m + 96m)
  .env.example               canonical env vars
  nginx/router.conf          fallback if Caddy isn't picked
  router/
    Dockerfile               python:3.12-slim + uvicorn
    requirements.txt
    main.py                  FastAPI: /lead /health /partners /feedback /payouts
    llm.py                   Haiku→Sonnet escalation + Gemini/OpenAI fallback
    partners.py              jurisdiction match + tier round-robin + weekly cap
    storage.py               Supabase REST + Redis dedupe
    notify.py                TG (HOT only) + Resend (terse + disclosure, CC Moses)
    hmac_verify.py           inbound HMAC verify
    eval.py                  regression harness
    payout_report.py         nightly summary + 90-day PII anonymizer
    prompts/router.txt       WAT-aligned XML prompt with 4 few-shots
    examples/leads.jsonl     50-case regression set
    tests/                   pytest: HMAC, partner-pick, prompt-shape
  supabase/
    migration-deal-router.sql   B2 schema (3 tables + 2 views + RLS)
    seeds/partners.sql          B3 placeholder seed
  systemd/
    deal-router.service         docker-compose up at boot
    payout-report.service       nightly summary
    payout-report.timer         OnCalendar=*-*-* 03:00:00
  scripts/b1-verify.sh          OCI host health check
```

## Local dev

```bash
cd router/
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env  # then fill in secrets
export $(grep -v '^#' ../.env | xargs)

# Smoke
python -c "import llm; print(llm.classify('test')['output']['classification'])"

# Eval
python eval.py examples/leads.jsonl

# Tests
pytest tests/
```

## Deploy to OCI

Prereqs: `ssh -i ~/.ssh/oci_id_rsa ubuntu@151.145.81.139` works; Docker
already installed (verified at B1).

```bash
# On laptop
rsync -avz --exclude='.venv' --exclude='__pycache__' \
  oci-deal-router/ ubuntu@151.145.81.139:/opt/oci-deal-router/

ssh -i ~/.ssh/oci_id_rsa ubuntu@151.145.81.139 << 'EOF'
cd /opt/oci-deal-router
# Edit .env with real values from canonical-env-clean.env
sudo cp systemd/deal-router.service /etc/systemd/system/
sudo cp systemd/payout-report.* /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now deal-router.service payout-report.timer
sudo iptables -I INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp -m tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
# TLS via Caddy
sudo apt install -y caddy
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl restart caddy
EOF

curl https://router.bizlegal-ai.com/health
```

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/lead` | HMAC `x-bizlegal-signature: <raw-hex>` (matches EA Worker + product `/api/inbound-lead` protocol) | Inbound from EA Worker / hub form |
| GET | `/health` | none | Liveness + Redis + Supabase status |
| GET | `/partners` | `X-Admin-Secret` | List active partners |
| POST | `/feedback` | `X-Admin-Secret` | Update lead.outcome |
| GET | `/payouts` | `X-Admin-Secret` | List open payouts |

## Hard rules (from briefing)

- Anti-hallucination: never invent buyer names, dollar amounts, properties.
- Bar-ethics disclosure paragraph in EVERY routed email (v1.0.0-p1).
- Telegram alerts: HOT priority only.
- Resend always CCs `mdmdmd63@gmail.com` while routing volume is small.
- USD-only payouts; 90-day PII anonymization via nightly RPC.
- Memory budget: router 256MB, redis 96MB (OCI free tier is 956MB total).
