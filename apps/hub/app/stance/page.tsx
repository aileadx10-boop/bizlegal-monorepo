import type { Metadata } from "next"
import LegalShield from "@/components/layout/LegalShield"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"

export const metadata: Metadata = {
  title: "Stance — BizLegal AI",
  description:
    "Where BizLegal AI stands on what it is, what it is not, and how it behaves under pressure.",
  alternates: { canonical: "/stance" },
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "BizLegal AI — Stance",
  description:
    "The liability-reduction stance that governs every BizLegal AI product: intelligence not services, human review not automation, preservation not deletion.",
  url: "https://bizlegal-ai.com/stance",
  creator: { "@type": "Organization", name: "BizLegal AI" },
  license: "https://bizlegal-ai.com/terms",
  version: DISCLAIMER_VERSION,
}

export default function StancePage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "64px 24px", fontSize: 16, lineHeight: 1.75 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <header style={{ marginBottom: 32 }}>
        <p
          style={{
            fontFamily: "var(--font-mono, ui-monospace)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--gold, var(--accent-mid))",
            margin: 0,
          }}
        >
          Disclosure {DISCLAIMER_VERSION}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display, ui-serif)",
            fontSize: 44,
            margin: "10px 0 0",
          }}
        >
          Stance.
        </h1>
        <p style={{ marginTop: 16, color: "var(--on-surface-var, var(--muted))" }}>
          Plainly-stated, versioned, and linked from every product surface.
          The seven-clause disclosure on every page controls; this page is
          the prose account of why those clauses read the way they do.
        </p>
      </header>

      <section style={{ display: "grid", gap: 28 }}>
        <div>
          <h2 style={sectionH}>We publish intelligence.</h2>
          <p>
            Our outputs — scans, scores, reports, drafts, ranked leads —
            are intelligence artefacts. They are structured, cited, and
            versioned summaries of publicly available regulatory
            information plus our analysis of it. They are not legal
            advice. They are not a substitute for counsel in your
            jurisdiction. They are not a finding of compliance or
            non-compliance against any framework.
          </p>
        </div>

        <div>
          <h2 style={sectionH}>We are not your lawyer.</h2>
          <p>
            No employee or contractor of BizLegal AI represents you.
            Accessing the platform, purchasing a report, or corresponding
            with our analysts does not create an attorney-client
            relationship. The disclaimer stamp on every output pins the
            version of this position that was in force at issue time.
          </p>
        </div>

        <div>
          <h2 style={sectionH}>We do not file on your behalf.</h2>
          <p>
            We do not submit filings to FinCEN, the SEC, a court, a
            registry, or any other regulator for you. Where an output of
            ours references a filing, you remain the filer of record and
            are responsible for submission, timing, accuracy, and
            consequences. The only exception in the roadmap is the
            LexAudit Safe audit log, which is customer-owned and
            customer-exported — we never file it anywhere on a
            customer&apos;s behalf.
          </p>
        </div>

        <div>
          <h2 style={sectionH}>Human reviewers sign off.</h2>
          <p>
            Every intelligence output ships only after a named human
            reviewer signs off. The signoff is a record: the reviewer
            identity, the timestamp, and (on request) the reviewer&apos;s
            note. This is a liability firewall, not a performance step.
            The operational details live in{" "}
            <a href="/methodology">/methodology</a> and the incident
            procedure in{" "}
            <a href="/trust">Trust</a>.
          </p>
        </div>

        <div>
          <h2 style={sectionH}>We preserve before we respond.</h2>
          <p>
            When an output is challenged — by a customer, opposing
            counsel, or a regulator — our first move is preservation, not
            rebuttal. The output artefact, the reviewer signoff, the
            disclosure version, and the knowledge-base revision in force
            at issue time are all snapshotted before any substantive
            response. We do not admit fault prior to counsel review. We
            do not edit challenged outputs in place. The full procedure
            is published as{" "}
            <a href="/methodology#incident-response">WAT-INC-001</a>.
          </p>
        </div>

        <div>
          <h2 style={sectionH}>The disclosure version is the anchor.</h2>
          <p>
            Every output we publish carries a disclosure version stamp —
            currently {DISCLAIMER_VERSION} — and an issued_at timestamp.
            When we change a signal weight, a scoring threshold, a
            methodology section, or any part of this stance, the version
            bumps. Prior outputs remain reproducible against the version
            that was in force when they were produced. This is how we
            keep what we published yesterday from being rewritten by what
            we publish tomorrow.
          </p>
        </div>

        <div>
          <h2 style={sectionH}>Where this stance is enforced.</h2>
          <p>
            The stance is enforced at the engine layer, not by
            convention. DocAI&apos;s SQA engine refuses to generate when
            retrieval is below threshold. LexAudit&apos;s health-score
            report throws without a reviewer signoff. TRACR&apos;s
            composite scorer throws without a reviewer. LeadForge&apos;s
            ranker cannot emit a lead without an outbound-compliance
            notice. The code, not the marketing, is what a plaintiff&apos;s
            expert in discovery reads.
          </p>
        </div>
      </section>

      <LegalShield variant="full" />
    </main>
  )
}

const sectionH: React.CSSProperties = {
  fontFamily: "var(--font-display, ui-serif)",
  fontSize: 22,
  margin: "0 0 8px",
  color: "var(--on-surface, var(--text))",
}
