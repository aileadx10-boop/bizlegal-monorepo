import type { Metadata } from "next";
import { FreeKbClient } from "./FreeKbClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Security Knowledge Base Q&A — DocAI",
  description:
    "Ask up to 3 free questions against DocAI's security-compliance knowledge base (SOC 2, CAIQ, SIG-Lite, GDPR). Citation-grounded answers, no card. Team tier lifts the cap.",
  alternates: { canonical: "https://docai.bizlegal-ai.com/free-kb" },
};

export default function FreeKbPage() {
  return <FreeKbClient />;
}
