import PDFDocument from "pdfkit";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import { reportDesignTheme } from "../utils/design-theme.js";
import { DisclaimerText } from "../utils/disclaimer.js";
import type { FullAnalysisOutput, ReportArtifact } from "../types/domain.js";

export class DocumentTextExtractor {
  async extractText(input: { mimeType: string; content: Buffer }) {
    if (input.mimeType === "application/pdf") {
      const result = await pdfParse(input.content);
      return result.text;
    }

    if (
      input.mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: input.content });
      return result.value;
    }

    return input.content.toString("utf8");
  }
}

export class ReportService {
  async createArtifact(input: {
    sessionLabel: string;
    analysis: FullAnalysisOutput;
    evidenceBasis: string[];
  }): Promise<ReportArtifact> {
    const html = this.buildHtml(input);
    const pdfBuffer = await this.buildPdf(input);

    return {
      html,
      pdfBuffer
    };
  }

  private buildHtml(input: {
    sessionLabel: string;
    analysis: FullAnalysisOutput;
    evidenceBasis: string[];
  }) {
    const risks = input.analysis.topRisks
      .map(
        (risk) => `
          <li><strong>${risk.title}</strong><br/>${risk.summary}</li>
        `
      )
      .join("");
    const evidence = input.evidenceBasis.map((item) => `<li>${item}</li>`).join("");

    return `
      <html>
        <head>
          <style>
            body { font-family: ${reportDesignTheme.bodyFont}; background: ${reportDesignTheme.background}; color: ${reportDesignTheme.text}; padding: 48px; }
            .card { background: ${reportDesignTheme.surface}; border: 1px solid ${reportDesignTheme.border}; border-radius: 24px; box-shadow: ${reportDesignTheme.shadow}; padding: 32px; }
            h1, h2 { font-family: ${reportDesignTheme.titleFont}; margin-bottom: 12px; }
            .eyebrow { font-family: ${reportDesignTheme.monoFont}; color: ${reportDesignTheme.accent}; text-transform: uppercase; letter-spacing: 0.14em; font-size: 12px; }
            .section { margin-top: 28px; }
            .risk-score { font-size: 48px; color: ${reportDesignTheme.accent}; font-family: ${reportDesignTheme.titleFont}; }
            .muted { color: ${reportDesignTheme.muted}; }
            ul { padding-left: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="eyebrow">Forge White Report</div>
            <h1>${input.sessionLabel}</h1>
            <p class="muted">${DisclaimerText}</p>
            <div class="section">
              <h2>Overview</h2>
              <p>${input.analysis.overview}</p>
            </div>
            <div class="section">
              <h2>Risk Score</h2>
              <div class="risk-score">${input.analysis.riskScore}</div>
            </div>
            <div class="section">
              <h2>Top Risks</h2>
              <ul>${risks}</ul>
            </div>
            <div class="section">
              <h2>Hidden Risk</h2>
              <p>${input.analysis.hiddenRisk}</p>
            </div>
            <div class="section">
              <h2>Action Plan</h2>
              <ul>${input.analysis.actionPlan.map((step) => `<li>${step}</li>`).join("")}</ul>
            </div>
            <div class="section">
              <h2>Decision</h2>
              <p>${input.analysis.decision}</p>
            </div>
            <div class="section">
              <h2>Evidence Basis</h2>
              <ul>${evidence}</ul>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private async buildPdf(input: {
    sessionLabel: string;
    analysis: FullAnalysisOutput;
    evidenceBasis: string[];
  }) {
    const doc = new PDFDocument({ margin: 48 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => undefined);

    doc.fontSize(12).fillColor(reportDesignTheme.accent).text("FORGE WHITE REPORT");
    doc.moveDown(0.6);
    doc.fontSize(24).fillColor(reportDesignTheme.text).text(input.sessionLabel);
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor(reportDesignTheme.muted).text(DisclaimerText);
    doc.moveDown();
    doc.fontSize(18).fillColor(reportDesignTheme.text).text("Overview");
    doc.fontSize(12).text(input.analysis.overview);
    doc.moveDown();
    doc.fontSize(18).text("Risk Score");
    doc.fontSize(28).fillColor(reportDesignTheme.accent).text(String(input.analysis.riskScore));
    doc.moveDown();
    doc.fontSize(18).fillColor(reportDesignTheme.text).text("Top Risks");
    for (const risk of input.analysis.topRisks) {
      doc.fontSize(12).text(`• ${risk.title}: ${risk.summary}`);
    }
    doc.moveDown();
    doc.fontSize(18).text("Hidden Risk");
    doc.fontSize(12).text(input.analysis.hiddenRisk);
    doc.moveDown();
    doc.fontSize(18).text("Action Plan");
    for (const step of input.analysis.actionPlan) {
      doc.fontSize(12).text(`• ${step}`);
    }
    doc.moveDown();
    doc.fontSize(18).text("Decision");
    doc.fontSize(12).text(input.analysis.decision);
    doc.moveDown();
    doc.fontSize(18).text("Evidence Basis");
    for (const item of input.evidenceBasis) {
      doc.fontSize(12).text(`• ${item}`);
    }
    doc.moveDown();
    doc.fontSize(10).fillColor(reportDesignTheme.muted).text(DisclaimerText);
    doc.end();

    await new Promise<void>((resolve) => {
      doc.on("end", () => resolve());
    });

    return Buffer.concat(chunks);
  }
}
