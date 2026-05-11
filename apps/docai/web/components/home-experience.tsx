"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
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

/**
 * DocAI home experience — the functional scan + generate UI rendered
 * directly below <DocAILandingPreExperience />.
 *
 * 2026-05-11 pivot — the previous version stacked a SECOND complete
 * landing page below the new pre-experience: duplicate <nav>, dev-
 * speak hero ("One Next.js app for generation..."), an "Agent
 * Endpoints" section that exposed internal API routes to visitors,
 * ticker band, custom cursor effects, Three.js backdrop, and a dev-
 * audience FAQ. All deleted. What's left is what visitors actually
 * NEED: the contract-scan upload flow and the template-driven
 * generator (modal).
 *
 * Sections after the pivot:
 *   1. #scan      — Upload a contract → /report/[scan_id] flow
 *   2. #generate  — Vertical tabs + template grid → generator modal
 *
 * Both anchor IDs match the pre-experience's CTA hrefs and the
 * SiteShell nav.
 */

type UploadResponse = {
  filename: string;
  contract_type: string;
  document_text: string;
};

type ScanResponse = {
  scan_id: string;
};

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
  const [activeVertical, setActiveVertical] = useState<VerticalKey>("realestate");
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
    if (!selectedTemplate) return;
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
    if (!generatedContract) return;
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
          contract_type:
            scanContractType === "Auto-detect" ? uploadData.contract_type : scanContractType,
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
    <div className="docai-tools">
      {/* ─── SCAN A CONTRACT ─────────────────────────────────── */}
      <section id="scan" className="docai-tool" aria-label="Scan a contract">
        <div className="docai-tool__inner">
          <header className="docai-tool__header">
            <span className="docai-tool__pill">Scan</span>
            <h2 className="docai-tool__title">Drop a contract. Get a risk report.</h2>
            <p className="docai-tool__sub">
              PDF or DOCX. Free preview shows the score and top issues; the gated report opens
              every red flag, missing clause, and the best-fit fix path.
            </p>
          </header>

          <form className="docai-form" onSubmit={handleScanSubmit}>
            <div className="docai-form__row">
              <label className="docai-field">
                <span>Email for the report</span>
                <input
                  type="email"
                  value={scanEmail}
                  onChange={(event) => setScanEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </label>
              <label className="docai-field">
                <span>Contract type</span>
                <select
                  value={scanContractType}
                  onChange={(event) => setScanContractType(event.target.value)}
                >
                  <option>Auto-detect</option>
                  <option>Joint Venture Agreement</option>
                  <option>Non-Disclosure Agreement</option>
                  <option>Letter of Intent</option>
                  <option>Service Agreement</option>
                  <option>Commercial Contract</option>
                </select>
              </label>
            </div>
            <label className="docai-field docai-field--file">
              <span>PDF or DOCX upload</span>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(event) => setScanFile(event.target.files?.[0] ?? null)}
              />
              <strong>{scanFile ? scanFile.name : "Choose a contract file"}</strong>
            </label>
            {scanStatus ? <p className="docai-status">{scanStatus}</p> : null}
            {scanError ? <p className="docai-error">{scanError}</p> : null}
            <button className="docai-submit" type="submit" disabled={isSubmittingScan}>
              {isSubmittingScan ? "Scanning…" : "Run free preview →"}
            </button>
          </form>
        </div>
      </section>

      {/* ─── GENERATE FROM TEMPLATE ──────────────────────────── */}
      <section id="generate" className="docai-tool docai-tool--alt" aria-label="Generate from template">
        <div className="docai-tool__inner">
          <header className="docai-tool__header">
            <span className="docai-tool__pill">Generate</span>
            <h2 className="docai-tool__title">Or start from a template.</h2>
            <p className="docai-tool__sub">
              Pick a vertical, fill the business facts, and get a citation-grounded draft in
              minutes. Bundles available for full libraries.
            </p>
          </header>

          <div className="docai-verticals" role="tablist">
            {VERTICALS.map((vertical) => (
              <button
                key={vertical.key}
                type="button"
                role="tab"
                aria-selected={activeVertical === vertical.key}
                className={
                  activeVertical === vertical.key
                    ? "docai-vertical docai-vertical--active"
                    : "docai-vertical"
                }
                onClick={() => setActiveVertical(vertical.key)}
              >
                <span aria-hidden>{vertical.icon}</span>
                <span>{vertical.label}</span>
              </button>
            ))}
          </div>

          <div className="docai-bundle">
            <div>
              <p className="docai-bundle__eyebrow">Bundle</p>
              <p className="docai-bundle__label">{bundle.label}</p>
              <p className="docai-bundle__sub">
                {VERTICALS.find((v) => v.key === activeVertical)?.marketLabel}
              </p>
            </div>
            <div className="docai-bundle__price">${bundle.price}</div>
          </div>

          <div className="docai-templates">
            {templates.map((template) => (
              <button
                key={template.key}
                type="button"
                className="docai-template"
                onClick={() => openTemplate(template)}
              >
                <span className="docai-template__price">${template.price}</span>
                <h3 className="docai-template__title">{template.label}</h3>
                <p className="docai-template__body">{template.desc}</p>
                <span className="docai-template__cta">Generate with AI →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MODAL: GENERATOR ───────────────────────────────── */}
      {selectedTemplate ? (
        <div
          className="docai-modal-shell"
          role="dialog"
          aria-modal="true"
          aria-label={`Generate ${selectedTemplate.label}`}
        >
          <div className="docai-modal">
            <button type="button" className="docai-modal__close" onClick={closeTemplate}>
              Close
            </button>
            <p className="docai-tool__pill" style={{ marginBottom: 8 }}>
              {VERTICALS.find((v) => v.key === selectedTemplate.vertical)?.label}
            </p>
            <h2 className="docai-tool__title" style={{ marginBottom: 4 }}>
              {selectedTemplate.label}
            </h2>
            <p className="docai-tool__sub">{selectedTemplate.desc}</p>

            <form className="docai-form" onSubmit={handleGenerate} style={{ marginTop: 20 }}>
              <div className="docai-form__row">
                {selectedTemplate.fields.map((field) => (
                  <label key={field.id} className="docai-field">
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
                <label className="docai-field">
                  <span>Jurisdiction</span>
                  <input
                    value={jurisdiction}
                    onChange={(event) => setJurisdiction(event.target.value)}
                  />
                </label>
                <label className="docai-field">
                  <span>Delivery email</span>
                  <input
                    type="email"
                    value={generatorEmail}
                    onChange={(event) => setGeneratorEmail(event.target.value)}
                    placeholder="you@company.com"
                  />
                </label>
              </div>

              {generatorError ? <p className="docai-error">{generatorError}</p> : null}

              <div className="docai-modal__actions">
                <button className="docai-submit" type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating…" : "Generate draft"}
                </button>
                {generatedContract ? (
                  <button
                    className="docai-submit docai-submit--ghost"
                    type="button"
                    onClick={handleReview}
                    disabled={isReviewing}
                  >
                    {isReviewing ? "Reviewing…" : "Run AI review"}
                  </button>
                ) : null}
              </div>
            </form>

            {generatedContract ? (
              <div className="docai-result">
                <div className="docai-result__meta">
                  <span>{generatedContract.estimated_review_time}</span>
                  <button
                    type="button"
                    className="docai-link"
                    onClick={() =>
                      navigator.clipboard.writeText(generatedContract.contract_text)
                    }
                  >
                    Copy text
                  </button>
                </div>
                <pre className="docai-result__body">{generatedContract.contract_text}</pre>

                {generatedContract.warnings.length ? (
                  <div className="docai-warnings">
                    {generatedContract.warnings.map((warning) => (
                      <span key={warning} className="docai-warning">
                        {warning}
                      </span>
                    ))}
                  </div>
                ) : null}

                {reviewResult ? (
                  <div className="docai-review">
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

      <style jsx>{`
        .docai-tools {
          background: var(--bg, #FBF9F4);
          color: var(--on-surface, #1A1530);
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
        }

        /* Each tool section */
        .docai-tool {
          padding: clamp(32px, 4vw, 64px) clamp(16px, 4vw, 32px);
        }
        .docai-tool--alt {
          background: var(--bg-low, #F2EEE5);
          border-top: 1px solid var(--outline-var, rgba(26, 21, 48, 0.06));
        }
        .docai-tool__inner {
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: clamp(20px, 2.5vw, 28px);
        }
        .docai-tool__header {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 72ch;
        }
        .docai-tool__pill {
          align-self: flex-start;
          padding: 3px 10px;
          border-radius: 999px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--primary, #5B49E0);
          background: color-mix(in srgb, var(--primary, #5B49E0) 10%, transparent);
          text-transform: uppercase;
        }
        .docai-tool__title {
          margin: 4px 0 0;
          font-family: var(--font-display, 'Fraunces', serif);
          font-weight: 400;
          font-size: clamp(22px, 3vw, 32px);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--on-surface, #1A1530);
        }
        .docai-tool__sub {
          margin: 0;
          color: var(--on-surface-var, #5C5670);
          font-size: clamp(14px, 1.4vw, 16px);
          line-height: 1.55;
        }

        /* Forms */
        .docai-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: clamp(18px, 2vw, 24px);
          background: var(--bg-high, #FFFDF7);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.10));
          border-radius: 14px;
          max-width: 640px;
        }
        .docai-form__row {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
        }
        .docai-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
        }
        .docai-field > span {
          color: var(--on-surface-var, #5C5670);
          font-weight: 500;
        }
        .docai-field input,
        .docai-field select {
          padding: 10px 12px;
          background: var(--bg-highest, #FFFFFF);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.12));
          border-radius: 8px;
          color: var(--on-surface, #1A1530);
          font-family: inherit;
          font-size: 14px;
          min-height: 40px;
        }
        .docai-field input:focus,
        .docai-field select:focus {
          outline: 2px solid var(--primary, #5B49E0);
          outline-offset: 1px;
        }
        .docai-field--file input[type="file"] {
          padding: 8px;
        }
        .docai-field--file strong {
          margin-top: 4px;
          font-size: 12.5px;
          color: var(--on-surface-var, #5C5670);
          font-weight: 500;
        }
        .docai-status {
          margin: 0;
          padding: 8px 12px;
          background: color-mix(in srgb, var(--primary, #5B49E0) 6%, transparent);
          border-radius: 6px;
          font-size: 13px;
          color: var(--primary, #5B49E0);
        }
        .docai-error {
          margin: 0;
          padding: 8px 12px;
          background: color-mix(in srgb, var(--cta, #E14B16) 8%, transparent);
          border-radius: 6px;
          font-size: 13px;
          color: var(--cta, #E14B16);
        }
        .docai-submit {
          align-self: flex-start;
          padding: 12px 22px;
          background: var(--primary, #5B49E0);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          transition: filter 0.15s, transform 0.15s;
        }
        .docai-submit:hover:not(:disabled) {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }
        .docai-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .docai-submit--ghost {
          background: transparent;
          color: var(--on-surface, #1A1530);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.18));
        }
        .docai-submit--ghost:hover:not(:disabled) {
          background: var(--bg-low, #F2EEE5);
        }

        /* Vertical tabs */
        .docai-verticals {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .docai-vertical {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: var(--bg-high, #FFFDF7);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.10));
          border-radius: 999px;
          color: var(--on-surface, #1A1530);
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .docai-vertical:hover {
          background: var(--bg-mid, #EAE4D5);
        }
        .docai-vertical--active {
          background: var(--primary, #5B49E0);
          color: #fff;
          border-color: var(--primary, #5B49E0);
        }
        .docai-vertical--active:hover {
          background: var(--primary, #5B49E0);
          filter: brightness(1.06);
        }

        /* Bundle banner */
        .docai-bundle {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: clamp(14px, 1.6vw, 18px) clamp(16px, 1.8vw, 22px);
          background: var(--bg-high, #FFFDF7);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.10));
          border-radius: 12px;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .docai-bundle__eyebrow {
          margin: 0 0 2px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--on-surface-var, #5C5670);
        }
        .docai-bundle__label {
          margin: 0;
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 18px;
          color: var(--on-surface, #1A1530);
        }
        .docai-bundle__sub {
          margin: 2px 0 0;
          font-size: 12.5px;
          color: var(--on-surface-var, #5C5670);
        }
        .docai-bundle__price {
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: clamp(22px, 2.4vw, 28px);
          font-weight: 500;
          color: var(--gold, #B8852D);
        }

        /* Template grid */
        .docai-templates {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
        }
        .docai-template {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: clamp(14px, 1.6vw, 18px);
          background: var(--bg-high, #FFFDF7);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.10));
          border-radius: 12px;
          text-align: left;
          font-family: inherit;
          cursor: pointer;
          transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
        }
        .docai-template:hover {
          transform: translateY(-2px);
          border-color: var(--primary, #5B49E0);
          box-shadow: 0 10px 24px -16px rgba(91, 73, 224, 0.35);
        }
        .docai-template__price {
          position: absolute;
          top: 14px;
          right: 14px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 12px;
          font-weight: 600;
          color: var(--gold, #B8852D);
        }
        .docai-template__title {
          margin: 0;
          font-family: var(--font-display, 'Fraunces', serif);
          font-weight: 500;
          font-size: 16px;
          letter-spacing: -0.01em;
          color: var(--on-surface, #1A1530);
          padding-right: 56px; /* leave room for price */
        }
        .docai-template__body {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--on-surface-var, #5C5670);
        }
        .docai-template__cta {
          margin-top: auto;
          padding-top: 8px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 11px;
          letter-spacing: 0.06em;
          color: var(--primary, #5B49E0);
        }

        /* Modal */
        .docai-modal-shell {
          position: fixed;
          inset: 0;
          background: rgba(26, 21, 48, 0.55);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: clamp(16px, 4vw, 48px);
          z-index: 1000;
          overflow-y: auto;
          backdrop-filter: blur(6px);
        }
        .docai-modal {
          width: 100%;
          max-width: 760px;
          background: var(--bg-highest, #FFFFFF);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.10));
          border-radius: 16px;
          padding: clamp(20px, 3vw, 32px);
          position: relative;
        }
        .docai-modal__close {
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.18));
          border-radius: 8px;
          color: var(--on-surface, #1A1530);
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
        }
        .docai-modal__close:hover {
          background: var(--bg-low, #F2EEE5);
        }
        .docai-modal__actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        /* Result panel inside modal */
        .docai-result {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--outline-var, rgba(26, 21, 48, 0.08));
        }
        .docai-result__meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 12px;
          color: var(--on-surface-var, #5C5670);
        }
        .docai-result__body {
          margin: 0;
          padding: 14px;
          background: var(--bg-low, #F2EEE5);
          border-radius: 10px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 12px;
          line-height: 1.6;
          color: var(--on-surface, #1A1530);
          white-space: pre-wrap;
          word-break: break-word;
          max-height: 360px;
          overflow-y: auto;
        }
        .docai-link {
          background: transparent;
          border: none;
          color: var(--primary, #5B49E0);
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .docai-link:hover {
          background: color-mix(in srgb, var(--primary, #5B49E0) 8%, transparent);
        }
        .docai-warnings {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .docai-warning {
          padding: 4px 10px;
          background: color-mix(in srgb, var(--cta, #E14B16) 10%, transparent);
          border-radius: 999px;
          font-size: 11px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          color: var(--cta, #E14B16);
        }
        .docai-review {
          margin-top: 16px;
          padding: 14px;
          background: color-mix(in srgb, var(--primary, #5B49E0) 6%, transparent);
          border-radius: 10px;
        }
        .docai-review h3 {
          margin: 0 0 8px;
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 16px;
          color: var(--on-surface, #1A1530);
        }
        .docai-review ul {
          margin: 0;
          padding-left: 18px;
          font-size: 13px;
          line-height: 1.55;
          color: var(--on-surface, #1A1530);
        }
        .docai-review li {
          margin-bottom: 6px;
        }
      `}</style>
    </div>
  );
}
