"use client"
import { useState, useRef, useEffect, useTransition } from "react"

type Msg = { role: "user" | "assistant"; text: string }
type QualResult = {
  score: number
  deal_room_token?: string
  deal_room_url?: string
  product_suggestion?: string
}

export function QualifierChat({ productHint }: { productHint?: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I'm BizLegal's compliance AI. Tell me a bit about your company and what compliance problem you're trying to solve. 60 seconds of context, then I'll point you to the right product." },
  ])
  const [input, setInput] = useState("")
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<QualResult | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }) }, [messages, result])

  async function send() {
    if (!input.trim()) return
    setError(null)
    const next: Msg[] = [...messages, { role: "user", text: input }]
    setMessages(next)
    setInput("")
    startTransition(async () => {
      try {
        const r = await fetch("/api/qualify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.map(m => ({ role: m.role, content: m.text })),
            email: email || undefined,
            product_hint: productHint,
          }),
        })
        if (!r.ok) throw new Error(await r.text())
        const j = await r.json()
        setMessages((prev) => [...prev, { role: "assistant", text: j.reply }])
        if (j.score) setResult({ score: j.score, deal_room_token: j.deal_room_token, deal_room_url: j.deal_room_url, product_suggestion: j.product_suggestion })
      } catch (e: any) { setError(e.message) }
    })
  }

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col" style={{ height: 520 }}>
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
        <span className="text-sm font-semibold text-slate-700">BizLegal Compliance AI</span>
        <span className="text-xs text-slate-500 ml-auto">60-second qualifier</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
            }`}>{m.text}</div>
          </div>
        ))}
        {result && result.deal_room_url && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-emerald-900">Score: {result.score}/100</p>
            {result.product_suggestion && <p className="text-emerald-800 mt-1">Recommended: {result.product_suggestion}</p>}
            <a href={result.deal_room_url} className="mt-2 inline-block px-4 py-2 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">
              Open your private deal room
            </a>
          </div>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      {!result?.deal_room_url && (
        <div className="border-t border-slate-200 p-3 space-y-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (required to save your deal room)" className="w-full rounded-md border-slate-300 text-sm" />
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send() }}
              placeholder="What's your compliance pain?"
              className="flex-1 rounded-md border-slate-300 text-sm" />
            <button onClick={send} disabled={pending}
              className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm font-semibold disabled:opacity-50">
              {pending ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
