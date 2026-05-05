# @bizlegal/turnstile-widget

Conditional Cloudflare Turnstile React widget. Mounts only when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, so dev + pre-launch deploys stay green.

Phase AA D11 lift from 6 byte-identical vendor copies (forge / tracr / docai / lexaudit / brai / leadforge).

## Install

```jsonc
// apps/<subdomain>/package.json
{
  "dependencies": {
    "@bizlegal/turnstile-widget": "workspace:*"
  }
}
```

The 6 subdomains keep `apps/<sub>/components/TurnstileWidget.tsx` as a thin re-export so the existing `./TurnstileWidget` import path still works.

## Use

```tsx
'use client'
import { useState } from 'react'
import { TurnstileWidget } from '@bizlegal/turnstile-widget'

export function LeadForm() {
  const [token, setToken] = useState<string | null>(null)
  const required = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  const submit = async () => {
    await fetch('/api/decision-tree/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ /* …, */ turnstile_token: token }),
    })
  }
  return (
    <form onSubmit={submit}>
      <TurnstileWidget onToken={setToken} theme="dark" />
      <button disabled={required && !token}>Submit</button>
    </form>
  )
}
```

## Skip-if-not-configured

If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset, the widget renders nothing — `null`. Forms that gate submission on `turnstileRequired && !token` should also read the env var so the button stays enabled without a token in dev.

## Companion package

Server-side verification: `@bizlegal/turnstile-verify`.
