"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Loader2, Lock, MapPin, Search } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type FunnelMode = "leadforge" | "pipeforge";

type LeadforgeResponse = {
  previewDeals: Array<{
    id: string;
    title: string;
    estimatedValue: number;
    urgency: string;
    source: string;
    buyerIntent: string;
  }>;
  lockedCount: number;
  location: string;
};

type PipeforgeResponse = {
  funds: Array<{
    id: string;
    claimant: string;
    amount: number;
    status: string;
    source: string;
  }>;
  message: string;
  location: string;
};

interface ChatBotProps {
  mode?: FunnelMode;
}

const modeCopy: Record<
  FunnelMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    placeholder: string;
    submitLabel: string;
    cardClassName: string;
  }
> = {
  leadforge: {
    eyebrow: "Shared Bot",
    title: "Ask for a location. Get deal previews instantly.",
    description:
      "This is the single bot for the merged app. It sends one JSON payload to the unified report route and renders either deals or funds based on the funnel type.",
    placeholder: "Enter a city, county, or state",
    submitLabel: "Generate deal report",
    cardClassName: "section-shell px-6 py-6 sm:px-7",
  },
  pipeforge: {
    eyebrow: "Pipeforge Mode",
    title: "Check the same location for unclaimed funds.",
    description:
      "The exact same bot now hits the same report route with `type=\"pipeforge\"` so buyers can evaluate dormant balances without another integration.",
    placeholder: "Enter the same location or a new one",
    submitLabel: "Check funds",
    cardClassName: "pipe-panel rounded-[2rem] px-6 py-6 shadow-shell",
  },
};

export function ChatBot({ mode = "leadforge" }: ChatBotProps) {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadResult, setLeadResult] = useState<LeadforgeResponse | null>(null);
  const [pipeResult, setPipeResult] = useState<PipeforgeResponse | null>(null);

  const copy = modeCopy[mode];

  const helperLabel = useMemo(() => {
    return mode === "leadforge"
      ? "Try: Miami, FL or Cook County, IL"
      : "Try: Los Angeles County or Brooklyn, NY";
  }, [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = location.trim();
    if (!value) {
      setError("Please enter a location first.");
      return;
    }

    setLoading(true);
    setError(null);
    setLeadResult(null);
    setPipeResult(null);

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: value,
          type: mode,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to generate report");
      }

      if (mode === "leadforge") {
        setLeadResult(payload as LeadforgeResponse);
      } else {
        setPipeResult(payload as PipeforgeResponse);
      }
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to reach the report service";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={copy.cardClassName}>
      <div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
            mode === "leadforge"
              ? "bg-emerald-500/10 text-emerald-700"
              : "border border-white/10 bg-white/5 text-white/70"
          )}
        >
          {copy.eyebrow}
        </span>
        <h2
          className={cn(
            "mt-4 font-display text-3xl",
            mode === "leadforge" ? "text-[color:var(--lead-ink)]" : "text-white"
          )}
        >
          {copy.title}
        </h2>
        <p
          className={cn(
            "mt-3 text-sm leading-7",
            mode === "leadforge" ? "text-navy-600" : "text-white/65"
          )}
        >
          {copy.description}
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.2em]",
              mode === "leadforge" ? "text-navy-500" : "text-white/50"
            )}
          >
            Location
          </span>
          <div
            className={cn(
              "mt-2 flex items-center gap-3 rounded-[1.35rem] border px-4 py-3",
              mode === "leadforge"
                ? "border-[color:var(--lead-line)] bg-white"
                : "border-white/10 bg-black/20"
            )}
          >
            <MapPin
              className={cn(
                "h-4 w-4",
                mode === "leadforge" ? "text-emerald-600" : "text-[color:var(--pipe-gold)]"
              )}
            />
            <input
              className={cn(
                "w-full bg-transparent text-sm outline-none placeholder:text-current/40",
                mode === "leadforge" ? "text-[color:var(--lead-ink)]" : "text-white"
              )}
              onChange={(event) => setLocation(event.target.value)}
              placeholder={copy.placeholder}
              value={location}
            />
          </div>
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className={cn(
              "text-xs uppercase tracking-[0.18em]",
              mode === "leadforge" ? "text-navy-400" : "text-white/40"
            )}
          >
            {helperLabel}
          </p>
          <button
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition",
              mode === "leadforge"
                ? "bg-[color:var(--lead-ink)] text-white hover:bg-navy-900"
                : "bg-[color:var(--pipe-gold)] text-[color:var(--pipe-smoke)] hover:brightness-110"
            )}
            disabled={loading}
            type="submit"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {copy.submitLabel}
          </button>
        </div>
      </form>

      {error ? (
        <div
          className={cn(
            "mt-4 rounded-[1.2rem] border px-4 py-3 text-sm",
            mode === "leadforge"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-red-400/30 bg-red-500/10 text-red-200"
          )}
        >
          {error}
        </div>
      ) : null}

      {leadResult ? (
        <div className="mt-6 space-y-4 animate-fade-in">
          <div className="rounded-[1.45rem] bg-navy-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-400">
              LeadForge preview
            </p>
            <p className="mt-2 text-sm text-navy-600">
              Top opportunities in <span className="font-semibold text-navy-900">{leadResult.location}</span>
            </p>
          </div>

          <div className="grid gap-4">
            {leadResult.previewDeals.map((deal) => (
              <article
                key={deal.id}
                className="rounded-[1.5rem] border border-[color:var(--lead-line)] bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[color:var(--lead-ink)]">{deal.title}</p>
                    <p className="mt-2 text-sm leading-7 text-navy-600">{deal.buyerIntent}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      Est. value
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-700">
                      {formatCurrency(deal.estimatedValue)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-navy-500">
                  <span className="rounded-full bg-navy-50 px-3 py-1.5">Urgency: {deal.urgency}</span>
                  <span className="rounded-full bg-navy-50 px-3 py-1.5">Source: {deal.source}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-[color:var(--lead-line)] bg-[linear-gradient(135deg,rgba(25,195,125,0.08),rgba(255,255,255,1))] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--lead-ink)] text-white">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-[color:var(--lead-ink)]">
                    {leadResult.lockedCount} more deals are ready behind the full report.
                  </p>
                  <p className="text-sm text-navy-600">
                    Keep them in the same funnel or send them into Pipeforge for a second monetizable path.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--lead-ink)] px-4 py-2.5 text-sm font-semibold text-white"
                  href="#templates"
                >
                  Unlock report
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--lead-line)] px-4 py-2.5 text-sm font-semibold text-[color:var(--lead-ink)]"
                  href="/pipe"
                >
                  Check funds
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {pipeResult ? (
        <div className="mt-6 space-y-4 animate-fade-in">
          <div className="rounded-[1.45rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Pipeforge result
            </p>
            <p className="mt-2 text-sm text-white/70">
              {pipeResult.message} in{" "}
              <span className="font-semibold text-white">{pipeResult.location}</span>
            </p>
          </div>

          {pipeResult.funds.map((fund) => (
            <article key={fund.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{fund.claimant}</p>
                  <p className="mt-2 text-sm leading-7 text-white/65">{fund.source}</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--pipe-gold)]/15 px-4 py-3 text-right text-[color:var(--pipe-gold)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Possible amount</p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(fund.amount)}</p>
                </div>
              </div>
              <div className="mt-4 inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/70">
                {fund.status}
              </div>
            </article>
          ))}

          <Link
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-white"
            href="/"
          >
            Return to LeadForge deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
