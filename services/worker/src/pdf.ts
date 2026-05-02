import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { JurisdictionSnapshot } from "./reports";

// Produces a compact 1-2 page PDF snapshot for email attachment.
// pdf-lib runs on Cloudflare Workers (pure JS, no Node deps).

export async function renderSnapshotPdf(snap: JurisdictionSnapshot): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  // US Letter portrait
  const pageW = 612;
  const pageH = 792;
  const margin = 48;
  const contentW = pageW - margin * 2;

  const purple = rgb(91 / 255, 33 / 255, 182 / 255);
  const purpleLt = rgb(237 / 255, 233 / 255, 254 / 255);
  const text = rgb(14 / 255, 11 / 255, 26 / 255);
  const muted = rgb(107 / 255, 101 / 255, 128 / 255);
  const white = rgb(1, 1, 1);

  let page = doc.addPage([pageW, pageH]);
  let cursorY = pageH - margin;

  // ---- Header bar ----
  page.drawRectangle({ x: 0, y: pageH - 12, width: pageW, height: 12, color: purple });

  // ---- Brand + date ----
  cursorY -= 16;
  page.drawText("BizLegal-AI", { x: margin, y: cursorY, size: 12, font: helveticaBold, color: text });
  page.drawText(`Jurisdiction Risk Snapshot · ${snap.requested_at.slice(0, 10)}`, {
    x: margin + 110,
    y: cursorY,
    size: 10,
    font: helvetica,
    color: muted
  });
  cursorY -= 28;

  // ---- Headline ----
  const a = snap.jurisdictions[0];
  const b = snap.jurisdictions[1];
  const headline = `${a?.display_name ?? "?"} vs ${b?.display_name ?? "?"}`;
  page.drawText(headline, { x: margin, y: cursorY, size: 22, font: helveticaBold, color: text });
  cursorY -= 20;

  const activity = clip(snap.request.activity, 110);
  page.drawText(activity, { x: margin, y: cursorY, size: 11, font: helveticaOblique, color: muted });
  cursorY -= 18;

  // ---- Verdict panel ----
  const verdict = snap.side_by_side?.verdict ?? "No verdict generated.";
  const verdictLines = wrap(verdict, contentW - 24, helvetica, 12);
  const panelH = 18 + verdictLines.length * 16 + 12;
  page.drawRectangle({
    x: margin,
    y: cursorY - panelH + 10,
    width: contentW,
    height: panelH,
    color: purple
  });
  page.drawText("VERDICT", {
    x: margin + 12,
    y: cursorY - 4,
    size: 8,
    font: helveticaBold,
    color: purpleLt
  });
  let vy = cursorY - 22;
  for (const line of verdictLines) {
    page.drawText(line, { x: margin + 12, y: vy, size: 12, font: helveticaBold, color: white });
    vy -= 16;
  }
  cursorY -= panelH + 14;

  // ---- Key tradeoffs ----
  const trades = (snap.side_by_side?.key_tradeoffs ?? []).slice(0, 5);
  if (trades.length > 0) {
    page.drawText("Key tradeoffs", { x: margin, y: cursorY, size: 11, font: helveticaBold, color: text });
    cursorY -= 16;
    for (const t of trades) {
      const lines = wrap("• " + t, contentW - 16, helvetica, 10);
      for (let i = 0; i < lines.length; i++) {
        const xOff = i === 0 ? 0 : 10;
        const line = lines[i]!;
        page.drawText(line, { x: margin + xOff, y: cursorY, size: 10, font: helvetica, color: text });
        cursorY -= 13;
      }
      cursorY -= 2;
    }
    cursorY -= 6;
  }

  // ---- Side-by-side table (dimensions) ----
  page = ensureSpace(doc, page, cursorY, 160, pageH, margin, pageW);
  if (page !== (doc.getPage(doc.getPageCount() - 1))) {
    cursorY = pageH - margin;
  }
  const colA = margin + 110;
  const colB = margin + 110 + (contentW - 110) / 2;
  const rowH = 28;

  page.drawText("Side-by-side", { x: margin, y: cursorY, size: 11, font: helveticaBold, color: text });
  cursorY -= 16;
  // header row
  page.drawText(a?.code ?? "A", { x: colA, y: cursorY, size: 9, font: helveticaBold, color: purple });
  page.drawText(b?.code ?? "B", { x: colB, y: cursorY, size: 9, font: helveticaBold, color: purple });
  cursorY -= 14;

  const dims: ReadonlyArray<[string, string, string]> = [
    [
      "Posture",
      `${a?.posture.label ?? "-"}`,
      `${b?.posture.label ?? "-"}`
    ],
    [
      "Licensing",
      clip((a?.licensing.required_licenses ?? []).join(", "), 42),
      clip((b?.licensing.required_licenses ?? []).join(", "), 42)
    ],
    [
      "Regulator",
      clip(a?.licensing.regulator ?? "-", 42),
      clip(b?.licensing.regulator ?? "-", 42)
    ],
    [
      "Timeline",
      clip(a?.licensing.typical_timeline ?? "-", 42),
      clip(b?.licensing.typical_timeline ?? "-", 42)
    ],
    [
      "Cost (USD)",
      clip(a?.licensing.typical_cost_usd ?? "-", 42),
      clip(b?.licensing.typical_cost_usd ?? "-", 42)
    ],
    [
      "Corp tax",
      clip(a?.tax_summary.corporate_rate ?? "-", 42),
      clip(b?.tax_summary.corporate_rate ?? "-", 42)
    ],
    [
      "Banking",
      `${a?.banking_accessibility.rating ?? "-"}`,
      `${b?.banking_accessibility.rating ?? "-"}`
    ]
  ];

  for (const [label, va, vb] of dims) {
    page = ensureSpace(doc, page, cursorY, rowH, pageH, margin, pageW);
    if (cursorY < margin + rowH) cursorY = pageH - margin;
    page.drawText(label, { x: margin, y: cursorY, size: 9, font: helveticaBold, color: muted });
    const laLines = wrap(va, (contentW - 110) / 2 - 8, helvetica, 9);
    const lbLines = wrap(vb, (contentW - 110) / 2 - 8, helvetica, 9);
    let lineY = cursorY;
    for (let i = 0; i < Math.max(laLines.length, lbLines.length); i++) {
      if (laLines[i]) page.drawText(laLines[i]!, { x: colA, y: lineY, size: 9, font: helvetica, color: text });
      if (lbLines[i]) page.drawText(lbLines[i]!, { x: colB, y: lineY, size: 9, font: helvetica, color: text });
      lineY -= 11;
    }
    cursorY = lineY - 4;
  }

  cursorY -= 8;

  // ---- Footer on last page ----
  page = doc.getPage(doc.getPageCount() - 1);
  const footerY = 60;
  page.drawLine({
    start: { x: margin, y: footerY + 22 },
    end: { x: pageW - margin, y: footerY + 22 },
    thickness: 0.5,
    color: rgb(0.88, 0.86, 0.93)
  });
  page.drawText(
    "This snapshot is general guidance. Not legal, financial, or tax advice.",
    { x: margin, y: footerY + 8, size: 8, font: helveticaOblique, color: muted }
  );
  page.drawText(
    `Snapshot ID: ${snap.snapshot_id} · BizLegal-AI FZE, DMCC Crypto Centre, Dubai`,
    { x: margin, y: footerY - 4, size: 7, font: helvetica, color: muted }
  );

  const bytes = await doc.save();
  return bytes;
}

// --- helpers --------------------------------------------------------------

function ensureSpace(
  doc: PDFDocument,
  page: PDFPage,
  cursorY: number,
  needed: number,
  pageH: number,
  margin: number,
  pageW: number
): PDFPage {
  if (cursorY - needed > margin) return page;
  return doc.addPage([pageW, pageH]);
}

function wrap(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? current + " " + w : w;
    const width = font.widthOfTextAtSize(candidate, size);
    if (width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function clip(s: string, maxChars: number): string {
  if (!s) return "-";
  if (s.length <= maxChars) return s;
  return s.slice(0, maxChars - 1) + "…";
}
