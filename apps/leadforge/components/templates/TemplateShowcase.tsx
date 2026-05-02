import { FileText, Mail } from "lucide-react";
import { EmailWelcomeTemplate } from "./EmailWelcomeTemplate";
import { PdfReportTemplate } from "./PdfReportTemplate";

const templateFeatures = [
  {
    title: "Welcome email template",
    detail: "Confirms the funnel is live and sets report expectations instantly.",
    icon: Mail,
  },
  {
    title: "Daily report template",
    detail: "Packages scored opportunities into something a buyer can act on fast.",
    icon: FileText,
  },
];

export function TemplateShowcase() {
  return (
    <section id="templates" className="section-shell px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="eyebrow">Templates</span>
          <h2 className="mt-4 font-display text-3xl text-[color:var(--lead-ink)] sm:text-4xl">
            LeadForge reports feel like product, not spreadsheets.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-navy-600 sm:text-base">
            The original LeadForge templates were folded into the unified repo as reusable UI
            building blocks for onboarding and report delivery.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {templateFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-[1.5rem] border border-[color:var(--lead-line)] bg-white px-4 py-4"
              >
                <Icon className="h-5 w-5 text-emerald-600" />
                <p className="mt-3 font-semibold text-navy-900">{feature.title}</p>
                <p className="mt-1 text-sm text-navy-600">{feature.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <EmailWelcomeTemplate />
        <PdfReportTemplate />
      </div>
    </section>
  );
}
