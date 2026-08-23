# Test Payment Agent — bench.bizlegal-ai.com

Authorized test-payment executor with password+keyword authentication.

## Security model

This agent refuses to act unless BOTH are correct:

1. **Password** — proves the caller (Moses) is authorized.
2. **Keyword** — proves the agent is the legit agent, not a compromised/attacker copy.

Both are hashed (SHA-256) in a local config file that Moses owns and keeps
outside git. Neither value is stored in the repo.

## Setup (one-time)

1. Choose a password and keyword (long, random, memorable to you only).
2. Hash them:

   ```bash
   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
   node -e "console.log(require('crypto').createHash('sha256').update('YOUR_KEYWORD').digest('hex'))"
   ```

3. Create the config file at the monorepo root:

   ```json
   {
     "auth": {
       "password_hash": "<hash from step 2>",
       "keyword_hash": "<hash from step 2>"
     },
     "max_amount_cents": 250000,
     "enabled": true
   }
   ```

   Save it as `.payment-agent.json` (note the dot prefix).

4. Keep it out of git — it is gitignored.

## Usage

### Dry run (safe — validates auth + shows what would happen)

```bash
node apps/bench/scripts/test-payment-agent.mjs \
  --product bench_audit_2500 \
  --email moses@example.com \
  --password "$PASSWORD" \
  --keyword "$KEYWORD" \
  --dry-run
```

### Real run (creates a PayPal checkout order)

```bash
node apps/bench/scripts/test-payment-agent.mjs \
  --product bench_audit_2500 \
  --email moses@example.com \
  --password "$PASSWORD" \
  --keyword "$KEYWORD" \
  --confirm
```

The agent will:
1. Verify password + keyword
2. Verify the product is allowed and under the amount ceiling
3. Call the bench checkout API to create a PayPal order
4. Verify the PayPal order exists (requires sandbox PayPal credentials in env)
5. Print the checkout URL for you to complete in your browser

## Safety rails

| Rail | What it prevents |
|---|---|
| Password + keyword | Unauthorized or attacker-triggered payments |
| `--dry-run` default | Accidental real orders |
| `--confirm` required | Unintentional execution |
| Allowed-products allowlist | Only bench products |
| Amount ceiling | Prevents oversize orders |
| Execution log | Every call is logged to `apps/bench/scripts/.logs/test-payment-agent.log` |
| No credentials in git | Password/keyword hashes only in local `.payment-agent.json` |
