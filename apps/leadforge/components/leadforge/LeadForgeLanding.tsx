import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Gavel,
  House,
  MoveRight,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { ChatBot } from "@/components/ChatBot";
import { TemplateShowcase } from "@/components/templates";
import { APIFY_ACTORS } from "@/lib/apify/actors";
import {
  HERO_METRICS,
  LEADFORGE_BENEFITS,
  PIPELINE_STEPS,
  TESTIMONIALS,
} from "./content";

const actorIcons = {
  commercial_lawyer: Gavel,
  employment_lawyer: BriefcaseBusiness,
  real_estate_agent: House,
};

export function LeadForgeLanding() {
  return (
    <main className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="section-shell flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--lead-ink)] text-[color:var(--lead-accent-soft)]">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl text-[color:var(--lead-ink)]">LeadForge</p>
              <p className="text-xs uppercase tracking-[0.2em] text-navy-500">
                Deals first, funds second
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-5 text-sm font-medium text-navy-600">
            <a href="#verticals">Signals</a>
            <a href="#pipeline">Pipeline</a>
            <a href="#templates">Templates</a>
            <Link className="text-[color:var(--lead-ink)]" href="/pipe">
              Pipeforge
            </Link>
          </nav>
        </header>

        <section className="section-shell overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <span className="eyebrow">Main Funnel</span>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-display text-4xl leading-tight text-[color:var(--lead-ink)] sm:text-5xl lg:text-6xl">
                  Turn raw public-record signals into deal-ready previews, then upsell qualified
                  buyers into unclaimed funds.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-navy-600 sm:text-lg">
                  LeadForge now owns the front door. Pipeforge lives inside the same app as the
                  second act, powered by one report route, one bot, and one deployment surface.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {HERO_METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[1.6rem] border border-[color:var(--lead-line)] bg-white px-5 py-5"
                  >
                    <p className="font-display text-3xl text-[color:var(--lead-ink)]">
                      {metric.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-navy-600">{metric.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--lead-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-900"
                  href="#report-bot"
                >
                  Run the report bot
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--lead-line)] px-5 py-3 text-sm font-semibold text-[color:var(--lead-ink)] transition hover:bg-white"
                  href="/pipe"
                >
                  Explore Pipeforge
                  <MoveRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div id="report-bot" className="animate-fade-in">
              <ChatBot mode="leadforge" />
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {LEADFORGE_BENEFITS.map((benefit) => (
            <article
              key={benefit.title}
              className="section-shell px-6 py-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-2xl text-[color:var(--lead-ink)]">
                {benefit.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-navy-600">{benefit.description}</p>
            </article>
          ))}
        </section>

        <section id="verticals" className="section-shell px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">Lead Signals</span>
              <h2 className="mt-4 font-display text-3xl text-[color:var(--lead-ink)] sm:text-4xl">
                LeadForge keeps the original source intelligence, but now it lives inside one app.
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-navy-600 sm:text-base">
              The Apify assets were distilled into a single catalog so the landing experience can
              explain what data powers each vertical without duplicating routing or backend logic.
            </p>
          </div>

          <div className="mt-8 grid gap-5 xl:grid-cols-3">
            {APIFY_ACTORS.map((actor) => {
              const Icon = actorIcons[actor.vertical];

              return (
                <article
                  key={actor.id}
                  className="rounded-[1.8rem] border border-[color:var(--lead-line)] bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--lead-ink)] text-[color:var(--lead-accent-soft)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {actor.shortLabel}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-[color:var(--lead-ink)]">
                    {actor.name}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-navy-600">{actor.description}</p>

                  <div className="mt-5 rounded-[1.4rem] bg-navy-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-400">
                      Sources
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-navy-700">
                      {actor.sourceHighlights.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 text-sm text-navy-500">
                    <span>{actor.cadence}</span>
                    <span className="text-right font-medium text-[color:var(--lead-ink)]">
                      {actor.funnelUse}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="pipeline" className="section-shell px-6 py-8 sm:px-10 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <span className="eyebrow">Unified Journey</span>
              <h2 className="mt-4 font-display text-3xl text-[color:var(--lead-ink)] sm:text-4xl">
                One bot. One route. One commercial path.
              </h2>
              <p className="mt-4 text-sm leading-7 text-navy-600 sm:text-base">
                The homepage pulls in the LeadForge offer, while the `/pipe` route carries the same
                visitor into the unclaimed-funds upsell without requalifying them in another app.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {PIPELINE_STEPS.map((step) => (
                <article
                  key={step.number}
                  className="rounded-[1.7rem] border border-[color:var(--lead-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(236,253,245,0.9))] p-6"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {step.number}
                  </p>
                  <h3 className="mt-4 font-display text-2xl text-[color:var(--lead-ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-navy-600">{step.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <TemplateShowcase />

        <section className="section-shell grid gap-6 overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <span className="eyebrow">Pipeforge Upsell</span>
            <h2 className="mt-4 max-w-2xl font-display text-3xl text-[color:var(--lead-ink)] sm:text-4xl">
              When a buyer wants more value, send them straight into dormant money recovery.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-navy-600 sm:text-base">
              Pipeforge now sits inside the same codebase and the same deployment, ready to convert
              curiosity into a second paid outcome with a single redirect.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--lead-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-900"
                href="/pipe"
              >
                Check funds
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--lead-line)] px-5 py-3 text-sm font-semibold text-[color:var(--lead-ink)]"
                href="#report-bot"
              >
                Return to deals bot
              </a>
            </div>
          </div>

          <div className="pipe-panel rounded-[2rem] px-6 py-6 shadow-shell">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--pipe-gold)]/15 text-[color:var(--pipe-gold)]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl">Pipeforge</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Unclaimed funds engine
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Estate-linked surplus proceeds",
                "Dormant escrow and utility balances",
                "Property tax and title overages",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <span>{item}</span>
                  <ShieldCheck className="h-4 w-4 text-[color:var(--pipe-gold)]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {TESTIMONIALS.map((testimonial) => (
            <article key={testimonial.author} className="section-shell px-6 py-6">
              <p className="text-lg leading-8 text-[color:var(--lead-ink)]">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="mt-5 font-semibold text-navy-900">{testimonial.author}</p>
              <p className="text-sm text-navy-500">{testimonial.role}</p>
            </article>
          ))}
        </section>

        <footer className="section-shell flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl text-[color:var(--lead-ink)]">LeadForge</p>
            <p className="mt-1 text-sm text-navy-500">
              Unified landing, unified API, unified upsell path.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-navy-600">
            <a href="#report-bot">Run bot</a>
            <Link href="/pipe">Pipeforge</Link>
            <span className="inline-flex items-center gap-2 text-[color:var(--lead-ink)]">
              Ready for Vercel
              <MoveRight className="h-4 w-4" />
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
