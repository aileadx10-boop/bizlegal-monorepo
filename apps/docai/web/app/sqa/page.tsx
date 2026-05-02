import type { Metadata } from "next";
import { SqaClient } from "./SqaClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SQA Auto-fill — DocAI",
  description:
    "Drop a SOC 2 / CAIQ / SIG-Lite / NIST question and get a citation-grounded draft answer in under a minute. Free first draft, no card required.",
  alternates: { canonical: "https://docai.bizlegal-ai.com/sqa" },
};

export default function SqaPage() {
  return <SqaClient />;
}
