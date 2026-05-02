"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { GenerateResult, ReviewResult } from "@/lib/contract-analysis";
import {
  BUNDLES,
  DOCS_BY_VERTICAL,
  VERTICALS,
  type DocumentTemplate,
  type VerticalKey,
  findTemplateByKey,
} from "@/lib/document-catalog";
import { ThreeBackdrop } from "@/components/three-backdrop";

type UploadResponse = {
  filename: string;
  contract_type: string;
  document_text: string;
};

type ScanResponse = {
  scan_id: string;
};

const HERO_TICKERS = [
  "Joint Venture Agreement",
  "Non-Circumvention NDA",
  "Letter of Intent",
  "Capital Call Agreement",
  "Payment Processing Agreement",
  "Warehouse & 3PL Agreement",
  "Shareholders Agreement",
  "B2B Service Agreement",
];

const FAQ_ITEMS = [
  {
    question: "What lives inside the unified DocAI app now?",
    answer:
      "The homepage, contract generation UI, AI contract review flows, upload-and-scan pipeline, and the payment-gated report experience all now point to one Next.js surface.",
  },
  {
    question: "Do you store my contracts permanently?",
    answer:
      "Risk scans are stored in the BizLegal Supabase project so the gated report page and payment unlock can work reliably. The frontend does not keep extra client-side copies beyond the current session.",
  },
  {
    question: "Which legal systems are supported?",
    answer:
      "The generator and review prompts are tuned for cross-border commercial work, with the UI currently centered on New York plus a generic commercial fallback for other jurisdictions.",
  },
  {
    question: "How do I unlock the full due diligence report?",
    answer:
      "The free scan shows the filename, risk score, and a limited preview. The paid report unlocks every red flag, missing clause, compliance issue, and the recommended document fix path.",
  },
];

function initialValues(template: DocumentTemplate | null) {
  if (!template) {
    return {};
  }

  return Object.fromEntries(template.fields.map((field) => [field.id, ""]));
}

export function HomeExperience({
  initialTemplateKey,
}: {
  initialTemplateKey?: string;
}) {
  const router = useRouter();
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const [activeVertical, setActiveVertical] = useState<VerticalKey>("realestate");
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [jurisdiction, setJurisdiction] = useState("New York");
  const [generatorEmail, setGeneratorEmail] = useState("");
  const [generatedContract, setGeneratedContract] = useState<GenerateResult | null>(null);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [generatorError, setGeneratorError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [scanEmail, setScanEmail] = useState("");
  const [scanContractType, setScanContractType] = useState("Auto-detect");
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanStatus, setScanStatus] = useState("");
  const [scanError, setScanError] = useState("");
  const [isSubmittingScan, setIsSubmittingScan] = useState(false);

  const templates = useMemo(() => DOCS_BY_VERTICAL[activeVertical], [activeVertical]);
  const bundle = useMemo(() => BUNDLES[activeVertical], [activeVertical]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.14 },
    );

    const nodes = document.querySelectorAll("[data-reveal]");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const dot = dotRef.current;
    const outline = outlineRef.current;

    if (!dot || !outline) {
      return;
    }

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let frame = 0;

    const handleMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      outline.style.transform = `translate(${ringX}px, ${ringY}px)`;
      frame = window.requestAnimationFrame(loop);
    };

    const activate = () => outline.classList.add("cursor-ring-active");
    const deactivate = () => outline.classList.remove("cursor-ring-active");

    document.addEventListener("mousemove", handleMove);
    document.querySelectorAll("a, button, .doc-card, .action-card").forEach((node) => {
      node.addEventListener("mouseenter", activate);
      node.addEventListener("mouseleave", deactivate);
    });
    frame = window.requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.querySelectorAll("a, button, .doc-card, .action-card").forEach((node) => {
        node.removeEventListener("mouseenter", activate);
        node.removeEventListener("mouseleave", deactivate);
      });
      window.cancelAnimationFrame(frame);
    };
  }, [templates]);

  useEffect(() => {
    if (!initialTemplateKey || selectedTemplate) {
      return;
    }

    const template = findTemplateByKey(initialTemplateKey);
    if (template) {
      setActiveVertical(template.vertical);
      setSelectedTemplate(template);
      setFormValues(initialValues(template));
    }
  }, [initialTemplateKey, selectedTemplate]);

  const openTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormValues(initialValues(template));
    setGeneratedContract(null);
    setReviewResult(null);
    setGeneratorError("");
  };

  const closeTemplate = () => {
    setSelectedTemplate(null);
    setGeneratedContract(null);
    setReviewResult(null);
    setGeneratorError("");
  };

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTemplate) {
      return;
    }

    if (!generatorEmail.includes("@")) {
      setGeneratorError("A delivery email is required before generating a contract.");
      return;
    }

    const emptyField = selectedTemplate.fields.find((field) => !formValues[field.id]?.trim());
    if (emptyField) {
      setGeneratorError(`Please complete ${emptyField.label}.`);
      return;
    }

    setIsGenerating(true);
    setReviewResult(null);
    setGeneratedContract(null);
    setGeneratorError("");

    try {
      const response = await fetch("/api/agents/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          template_key: selectedTemplate.key,
          jurisdiction,
          key_terms: formValues,
        }),
      });

      const payload = (await response.json()) as GenerateResult | { error?: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Generation failed.");
      }

      setGeneratedContract(payload as GenerateResult);
    } catch (error) {
      setGeneratorError(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReview = async () => {
    if (!generatedContract) {
      return;
    }

    setIsReviewing(true);
    setGeneratorError("");

    try {
      const response = await fetch("/api/agents/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contract_text: generatedContract.contract_text,
          jurisdiction,
        }),
      });

      const payload = (await response.json()) as ReviewResult | { error?: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Review failed.");
      }

      setReviewResult(payload as ReviewResult);
    } catch (error) {
      setGeneratorError(error instanceof Error ? error.message : "Review failed.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleScanSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!scanFile) {
      setScanError("Upload a PDF or DOCX contract before starting the scan.");
      return;
    }

    if (!scanEmail.includes("@")) {
      setScanError("A valid email is required to create the report.");
      return;
    }

    setIsSubmittingScan(true);
    setScanStatus("Uploading contract...");
    setScanError("");

    try {
      const formData = new FormData();
      formData.append("file", scanFile);

      const uploadResponse = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const uploadPayload = (await uploadResponse.json()) as UploadResponse | { error?: string };
      if (!uploadResponse.ok || "error" in uploadPayload) {
        throw new Error("error" in uploadPayload ? uploadPayload.error : "Upload failed.");
      }

      const uploadData = uploadPayload as UploadResponse;

      setScanStatus("Analyzing clauses and scoring risk...");

      const scanResponse = await fetch("/api/documents/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: scanEmail,
          filename: uploadData.filename,
          document_text: uploadData.document_text,
          contract_type: scanContractType === "Auto-detect" ? uploadData.contract_type : scanContractType,
        }),
      });

      const scanPayload = (await scanResponse.json()) as ScanResponse | { error?: string };
      if (!scanResponse.ok || "error" in scanPayload) {
        throw new Error("error" in scanPayload ? scanPayload.error : "Scan failed.");
      }

      setScanStatus("Opening your gated report...");
      const scanData = scanPayload as ScanResponse;
        startTransition(() => router.push(`/report?scan_id=${scanData.scan_id}`));
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Scan failed.");
      setScanStatus("");
    } finally {
      setIsSubmittingScan(false);
    }
  };

  return (
    <main className="page-shell">
      <ThreeBackdrop />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={outlineRef} className="cursor-ring" aria-hidden="true" />

      <nav className={`site-nav ${isScrolled ? "site-nav-scrolled" : ""}`}>
        <div className="site-nav-inner">
          <a href="#home" className="brand-mark">
            <span className="brand-box">BL</span>
            <span>DocAI</span>
          </a>
          <div className="site-nav-links">
            <a href="#documents">Documents</a>
            <a href="#agents">Agents</a>
            <a href="#scan">Risk Scan</a>
            <a href="#faq">FAQ</a>
          </div>
          <a href="#scan" className="nav-cta">
            Analyze A Contract
          </a>
        </div>
      </nav>

      <section id="home" className="hero-section">
        <div className="hero-status" data-reveal>
          <span className="status-ping" />
          Unified BizLegal AI workspace
        </div>
        <div className="hero-copy">
          <p className="eyebrow" data-reveal>
            Institutional legal documents + AI contract agents
          </p>
          <h1 data-reveal>
            One Next.js app for <span>generation, review, and gated contract intelligence.</span>
          </h1>
          <p className="hero-description" data-reveal>
            DocAI now combines the contract generator, the BizLegal agent routes, Supabase-backed scans, and the
            report payment wall at <strong>docai.bizlegal-ai.com</strong>.
          </p>
          <div className="hero-actions" data-reveal>
            <a className="button-primary" href="#documents">
              Generate A Contract
            </a>
            <a className="button-secondary" href="#scan">
              Scan A Counterparty Draft
            </a>
          </div>
        </div>
        <div className="hero-metrics" data-reveal>
          <div className="metric-card">
            <span className="metric-value">20+</span>
            <span className="metric-label">Core legal templates</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">4</span>
            <span className="metric-label">Agent endpoints live in-app</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">24</span>
            <span className="metric-label">USD gated full report</span>
          </div>
        </div>
      </section>

      <div className="ticker-band">
        <div className="ticker-track">
          {[...HERO_TICKERS, ...HERO_TICKERS].map((label, index) => (
            <span key={`${label}-${index}`} className="ticker-item">
              {label}
            </span>
          ))}
        </div>
      </div>

      <section className="section-block" data-reveal>
        <div className="section-header">
          <p className="eyebrow">How It Works</p>
          <h2>From template pick to gated report unlock in one surface.</h2>
        </div>
        <div className="process-grid">
          <article className="action-card">
            <span className="step-number">01</span>
            <h3>Choose a template</h3>
            <p>Select the document family, fill the business facts, and generate a full draft with Claude.</p>
          </article>
          <article className="action-card">
            <span className="step-number">02</span>
            <h3>Review the draft</h3>
            <p>Run an instant AI review to surface weak clauses, improvement ideas, and approval-ready language.</p>
          </article>
          <article className="action-card">
            <span className="step-number">03</span>
            <h3>Upload third-party paper</h3>
            <p>PDF and DOCX uploads get extracted, analyzed, scored, and stored in the BizLegal Supabase project.</p>
          </article>
          <article className="action-card">
            <span className="step-number">04</span>
            <h3>Unlock the full report</h3>
            <p>Preview the top issues for free, then open the paid report with NOWPayments crypto or a Payoneer card link.</p>
          </article>
        </div>
      </section>

      <section id="documents" className="section-block">
        <div className="section-header" data-reveal>
          <p className="eyebrow">Document Library</p>
          <h2>Keep the DocAI generator, but run it from a real Next.js stack.</h2>
          <p className="section-subtitle">
            Switch verticals, open a template, and generate a full contract draft without leaving the unified app.
          </p>
        </div>

        <div className="vertical-tabs" data-reveal>
          {VERTICALS.map((vertical) => (
            <button
              key={vertical.key}
              type="button"
              className={`vertical-tab ${activeVertical === vertical.key ? "vertical-tab-active" : ""}`}
              onClick={() => setActiveVertical(vertical.key)}
            >
              <span>{vertical.icon}</span>
              <span>{vertical.label}</span>
            </button>
          ))}
        </div>

        <div className="bundle-banner" data-reveal>
          <div>
            <p className="eyebrow">Library Bundle</p>
            <h3>{bundle.label}</h3>
            <p>{VERTICALS.find((vertical) => vertical.key === activeVertical)?.marketLabel}</p>
          </div>
          <div className="bundle-price">${bundle.price}</div>
        </div>

        <div className="docs-grid">
          {templates.map((template) => (
            <button
              key={template.key}
              type="button"
              className="doc-card"
              data-reveal
              onClick={() => openTemplate(template)}
            >
              <span className="doc-price">${template.price}</span>
              <h3>{template.label}</h3>
              <p>{template.desc}</p>
              <span className="doc-card-link">Generate with AI</span>
            </button>
          ))}
        </div>
      </section>

      <section id="agents" className="section-block" data-reveal>
        <div className="section-header">
          <p className="eyebrow">Agent Endpoints</p>
          <h2>The old split backend is now wired into one App Router surface.</h2>
        </div>
        <div className="process-grid">
          <article className="action-card">
            <h3>/api/agents/generate</h3>
            <p>Template-driven contract generation with jurisdiction context, parties, and key business terms.</p>
          </article>
          <article className="action-card">
            <h3>/api/agents/review</h3>
            <p>Structured clause issues, approved terms, and next-step suggestions for draft tightening.</p>
          </article>
          <article className="action-card">
            <h3>/api/agents/draft</h3>
            <p>Natural-language drafting for greenfield deals that start from a plain-English commercial brief.</p>
          </article>
          <article className="action-card">
            <h3>/api/agents/analyze</h3>
            <p>Risk scoring, missing clause detection, compliance checks, and red-flag extraction for uploaded contracts.</p>
          </article>
        </div>
      </section>

      <section id="scan" className="section-block">
        <div className="scan-grid">
          <div className="scan-copy" data-reveal>
            <p className="eyebrow">AI Contract Scan</p>
            <h2>Upload a counterparty draft and route straight into the payment-gated report.</h2>
            <p className="section-subtitle">
              The free preview shows the risk score and limited issues. The paid report unlocks every flagged clause,
              every missing protection, and the best-fit DocAI template for remediation.
            </p>
          </div>

          <form className="scan-form" onSubmit={handleScanSubmit} data-reveal>
            <label className="field-group">
              <span>Email for the report</span>
              <input
                type="email"
                value={scanEmail}
                onChange={(event) => setScanEmail(event.target.value)}
                placeholder="you@company.com"
              />
            </label>
            <label className="field-group">
              <span>Declared contract type</span>
              <select value={scanContractType} onChange={(event) => setScanContractType(event.target.value)}>
                <option>Auto-detect</option>
                <option>Joint Venture Agreement</option>
                <option>Non-Disclosure Agreement</option>
                <option>Letter of Intent</option>
                <option>Service Agreement</option>
                <option>Commercial Contract</option>
              </select>
            </label>
            <label className="field-group file-drop">
              <span>PDF or DOCX upload</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(event) => setScanFile(event.target.files?.[0] ?? null)}
              />
              <strong>{scanFile ? scanFile.name : "Choose a contract file"}</strong>
            </label>

            {scanStatus ? <p className="status-line">{scanStatus}</p> : null}
            {scanError ? <p className="error-line">{scanError}</p> : null}

            <button className="button-primary scan-button" type="submit" disabled={isSubmittingScan}>
              {isSubmittingScan ? "Scanning..." : "Create Risk Report"}
            </button>
          </form>
        </div>
      </section>

      <section id="faq" className="section-block" data-reveal>
        <div className="section-header">
          <p className="eyebrow">FAQ</p>
          <h2>What changed in this unified build?</h2>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {selectedTemplate ? (
        <div className="modal-shell" role="dialog" aria-modal="true">
          <div className="modal-card">
            <button type="button" className="modal-close" onClick={closeTemplate}>
              Close
            </button>
            <p className="eyebrow">{VERTICALS.find((vertical) => vertical.key === selectedTemplate.vertical)?.label}</p>
            <h2>{selectedTemplate.label}</h2>
            <p className="section-subtitle">{selectedTemplate.desc}</p>

            <form className="generator-form" onSubmit={handleGenerate}>
              <div className="field-grid">
                {selectedTemplate.fields.map((field) => (
                  <label key={field.id} className="field-group">
                    <span>{field.label}</span>
                    <input
                      type="text"
                      value={formValues[field.id] ?? ""}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [field.id]: event.target.value,
                        }))
                      }
                      placeholder={field.ph}
                    />
                  </label>
                ))}
                <label className="field-group">
                  <span>Jurisdiction</span>
                  <input value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value)} />
                </label>
                <label className="field-group">
                  <span>Delivery email</span>
                  <input
                    type="email"
                    value={generatorEmail}
                    onChange={(event) => setGeneratorEmail(event.target.value)}
                    placeholder="reply@bizlegal-ai.com"
                  />
                </label>
              </div>

              {generatorError ? <p className="error-line">{generatorError}</p> : null}

              <div className="modal-actions">
                <button className="button-primary" type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Full Contract"}
                </button>
                {generatedContract ? (
                  <button className="button-secondary" type="button" onClick={handleReview} disabled={isReviewing}>
                    {isReviewing ? "Reviewing..." : "Run AI Review"}
                  </button>
                ) : null}
              </div>
            </form>

            {generatedContract ? (
              <div className="result-panel">
                <div className="result-meta">
                  <span>{generatedContract.estimated_review_time}</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigator.clipboard.writeText(generatedContract.contract_text)}
                  >
                    Copy text
                  </button>
                </div>
                <pre>{generatedContract.contract_text}</pre>

                {generatedContract.warnings.length ? (
                  <div className="pill-list">
                    {generatedContract.warnings.map((warning) => (
                      <span key={warning} className="pill warning-pill">
                        {warning}
                      </span>
                    ))}
                  </div>
                ) : null}

                {reviewResult ? (
                  <div className="review-box">
                    <h3>{reviewResult.overall_rating}</h3>
                    <ul>
                      {reviewResult.issues.map((issue) => (
                        <li key={`${issue.clause}-${issue.detail}`}>
                          <strong>{issue.clause}</strong>: {issue.detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
