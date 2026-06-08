---
name: thank-you-agent
description: Post-purchase onboarding sequences — welcome email, setup guide, day-3 check-in, day-7 value email, upsell at day-14
schedule: Triggered on payment.confirmed event
model: claude-haiku-4-5-20251001
tools:
  - resend
  - supabase
  - event-log
  - telegram
---

# Thank-You / Onboarding Agent

Triggered by `payment.confirmed` ops event. Converts one-time buyers into repeat customers.

## Sequence by Product

### DocAI / Conductor ($29-$999/mo)
```
T+0 (immediate): Welcome + magic link to dashboard
  Subject: "Welcome to DocAI — your dashboard is ready"
  Body: Magic link + top 3 things to do first + link to /sqa

T+3 days: "How's it going?" check-in
  Subject: "Did your first SQA draft save time?"
  Body: Ask 1 question + offer to answer via email or Calendly
  Trigger: only if user has NOT completed first SQA (check supabase usage table)

T+7 days: Value proof email
  Subject: "Here's what DocAI users saved this week"
  Body: 1 specific use case + link to /methodology + subtle upsell nudge

T+14 days: Upgrade/referral prompt
  Subject: "Ready for 50 SQAs/month?"
  Body: Upgrade CTA if on free/starter OR referral ask if on team+
```

### Forge ($97-$299 one-time)
```
T+0: Delivery confirmation + download link
T+1: "Got questions about your report?" personal email from Moses
T+7: "Here's what others do with their {product} report" → upsell to monitor ($99/mo)
```

### Tracr / Brai (one-time reports)
```
T+0: "Your report is being generated" (if async) or "Your report is ready" (if sync)
T+3: "Want us to monitor for changes?" → LexAudit upsell
```

## Personalization Rules
- Use first name from `payment_orders.customer_name` or email prefix
- Reference the exact product they bought
- If email includes company domain → Google it via Firecrawl for personalization

## Output
Every email logged to `ops_events` with type `email.welcome | email.checkin | email.value | email.upsell`
Alert Moses on Telegram for each new subscriber: "🎉 New {product} subscriber: {email} (${amount}/mo)"
