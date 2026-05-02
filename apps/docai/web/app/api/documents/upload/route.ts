import { NextRequest, NextResponse } from "next/server";

import { extractDocumentText, inferContractType } from "@/lib/document-upload";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file upload is required." }, { status: 400 });
    }

    const documentText = await extractDocumentText(file);
    const contractType = inferContractType(file.name, documentText);

    return NextResponse.json({
      filename: file.name,
      size: file.size,
      document_text: documentText,
      contract_type: contractType,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract document text." },
      { status: 500 },
    );
  }
}
