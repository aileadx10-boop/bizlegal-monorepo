import Link from "next/link";
import { ArrowLeft, Coins, Landmark, ScanSearch, ShieldCheck } from "lucide-react";
import { ChatBot } from "@/components/ChatBot";
import { PIPEFORGE_FUNDS_SIGNALS } from "@/lib/apify/actors";

const statCards = [
  { label: "Signal types", value: "3", accent: "text-[color:var(--pipe-gold)]" },
  { label: "Shared API", value: "1", accent: "text-[color:var(--pipe-azure)]" },
  { label: "Buyer handoff", value: "Instant", accent: "text-emerald-300" },
];

export function PipeforgeUpsell() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#05070b_0%,#0a0e15_100%)] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 backdrop-blur">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--pipe-gold)]/15 text-[color:var(--pipe-gold)]">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl">Pipeforge</p>
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Upsell funnel for unclaimed funds
                </p>
              </div>
            </div>

            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
              href="/"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to LeadForge
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(202,161,69,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-6 py-8 shadow-shell sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              Pipe Route
            </span>
            <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
              Find dormant balances, tax overages, and claimable funds before they stay buried.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/70">
              Pipeforge is the upsell step in the merged app. It uses the same `/api/generate-report`
              endpoint, but switches the funnel type to `pipeforge` so visitors can run a second,
              funds-focused report without leaving the product.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-5">
                  <p className={`font-display text-3xl ${card.accent}`}>{card.value}</p>
                  <p className="mt-2 text-sm text-white/60">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {PIPEFORGE_FUNDS_SIGNALS.map((signal, index) => {
                const icons = [Landmark, ScanSearch, ShieldCheck] as const;
                const Icon = icons[index] ?? Coins;

                return (
                  <article key={signal.title} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                    <Icon className="h-5 w-5 text-[color:var(--pipe-gold)]" />
                    <h2 className="mt-4 font-display text-2xl">{signal.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-white/65">{signal.detail}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div>
            <ChatBot mode="pipeforge" />
          </div>
        </section>
      </div>
    </main>
  );
}
