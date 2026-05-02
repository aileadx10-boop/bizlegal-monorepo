import type { Metadata } from "next"
import { SqaKbClient } from "./SqaKbClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "SQA Firm KB — DocAI",
  description:
    "Firm-tier knowledge base management. Upload your firm's playbook clauses for blended retrieval inside SQA drafts. Active Firm subscription required.",
  alternates: { canonical: "https://docai.bizlegal-ai.com/sqa/kb" },
  robots: { index: false, follow: false },
}

export default function SqaKbPage() {
  return <SqaKbClient />
}
