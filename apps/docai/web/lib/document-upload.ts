import mammoth from "mammoth";

import { inferDocStackTemplateKey } from "@/lib/document-catalog";

export async function extractDocumentText(file: File) {
  const filename = file.name || "uploaded-contract";
  const buffer = Buffer.from(await file.arrayBuffer());
  const lower = filename.toLowerCase();

  if (lower.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (lower.endsWith(".pdf")) {
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  return buffer.toString("utf8").trim();
}

export function inferContractType(filename: string, text: string) {
  const corpus = `${filename} ${text}`.toLowerCase();
  const templateKey = inferDocStackTemplateKey(corpus);

  switch (templateKey) {
    case "jv":
      return "Joint Venture Agreement";
    case "nda":
      return "Non-Disclosure Agreement";
    case "loi":
      return "Letter of Intent";
    case "commission":
      return "Commission Agreement";
    case "capital_call":
      return "Capital Call Agreement";
    case "property_mgmt":
      return "Property Management Agreement";
    case "subscription":
      return "Investor Subscription Agreement";
    case "guarantee":
      return "Guarantee Agreement";
    default:
      return "Commercial Contract";
  }
}
