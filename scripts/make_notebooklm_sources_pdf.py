"""Generate a clean, NotebookLM-ready PDF of authoritative governmental / primary
regulatory sources for BizLegal-AI content + diagrams."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

OUT = r"C:/Users/Moshe Dor/Downloads/BizLegal-AI_Reliable_Sources_NotebookLM.pdf"

SECTIONS = [
    ("How to use this in NotebookLM", [
        ("Add these as Sources in NotebookLM (it accepts website URLs, PDFs, and pasted text). Prefer the primary regulator pages and official PDFs below over news sites — they give clean citations and zero hallucinated figures. To build a diagram: add 3-6 sources from ONE vertical, then prompt NotebookLM e.g. 'Create a compliance decision flowchart (Mermaid) for [topic] citing these sources' or 'Summarize the obligations as a comparison table.'", ""),
    ]),
    ("Crypto / Digital Assets / Markets  (tracr, brai)", [
        ("US SEC", "https://www.sec.gov  /  https://www.sec.gov/newsroom/press-releases  /  EDGAR: https://www.sec.gov/edgar"),
        ("US CFTC", "https://www.cftc.gov  /  https://www.cftc.gov/PressRoom/PressReleases"),
        ("US FinCEN", "https://www.fincen.gov  /  Travel Rule + MSB guidance"),
        ("UK FCA", "https://www.fca.org.uk  /  Cryptoasset authorisation: https://www.fca.org.uk/firms/cryptoassets"),
        ("EU ESMA", "https://www.esma.europa.eu"),
        ("EU MiCA (regulation text)", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1114"),
        ("UAE VARA", "https://www.vara.ae"),
        ("Dubai DFSA", "https://www.dfsa.ae"),
        ("Singapore MAS", "https://www.mas.gov.sg"),
        ("FATF", "https://www.fatf-gafi.org"),
        ("US OFAC / SDN list", "https://ofac.treasury.gov  /  https://sanctionssearch.ofac.treas.gov"),
    ]),
    ("Sanctions / AML  (brai)", [
        ("US OFAC", "https://ofac.treasury.gov"),
        ("UN Security Council Consolidated List", "https://www.un.org/securitycouncil/content/un-sc-consolidated-list"),
        ("EU Sanctions Map", "https://www.sanctionsmap.eu"),
        ("UK OFSI", "https://www.gov.uk/government/organisations/office-of-financial-sanctions-implementation"),
    ]),
    ("Privacy / Data Protection  (DocAI)", [
        ("EU GDPR (regulation text)", "https://eur-lex.europa.eu/eli/reg/2016/679/oj"),
        ("European Data Protection Board (EDPB)", "https://www.edpb.europa.eu"),
        ("UK ICO", "https://ico.org.uk"),
        ("California CPPA (CCPA/CPRA)", "https://cppa.ca.gov"),
        ("NIST (Privacy Framework / 800-53)", "https://www.nist.gov/privacy-framework  /  https://csrc.nist.gov"),
    ]),
    ("EU AI Act / AI Governance  (Conductor AI-Act vertical)", [
        ("EU AI Act (regulation text)", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689"),
        ("EU AI Office", "https://digital-strategy.ec.europa.eu/en/policies/ai-office"),
        ("NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework"),
    ]),
    ("Corporate / Beneficial Ownership / BOI  (forge)", [
        ("US FinCEN BOI", "https://www.fincen.gov/boi"),
        ("US Treasury", "https://home.treasury.gov"),
        ("Delaware Division of Corporations", "https://corp.delaware.gov"),
        ("UK Companies House", "https://www.gov.uk/government/organisations/companies-house"),
    ]),
    ("Immigration / Cross-border  (Conductor immigration vertical, OCI)", [
        ("US USCIS", "https://www.uscis.gov"),
        ("US Dept of State - Travel", "https://travel.state.gov"),
        ("UK Home Office / gov.uk visas", "https://www.gov.uk/browse/visas-immigration"),
        ("Israel Tax Authority (ITA) - R&D / Circular 8/2025", "https://www.gov.il/en/departments/israel_tax_authority"),
    ]),
    ("Real Estate / Cross-border deals  (OCI deal-router)", [
        ("Dubai Land Department (DLD)", "https://dubailand.gov.ae"),
        ("RERA Dubai", "https://www.dubailand.gov.ae/en/eservices/rera"),
        ("Singapore URA / IRAS (property)", "https://www.ura.gov.sg  /  https://www.iras.gov.sg"),
    ]),
]

def build():
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle('h1', parent=styles['Title'], fontSize=20, spaceAfter=6, textColor=colors.HexColor('#1a1a2e'))
    sub = ParagraphStyle('sub', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#666'), spaceAfter=14)
    h2 = ParagraphStyle('h2', parent=styles['Heading2'], fontSize=13, spaceBefore=14, spaceAfter=6, textColor=colors.HexColor('#2563eb'))
    name = ParagraphStyle('name', parent=styles['Normal'], fontSize=10.5, spaceBefore=4, textColor=colors.HexColor('#111'), leading=14)
    url = ParagraphStyle('url', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#444'), spaceAfter=4, leftIndent=10, leading=12)

    doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=1.8*cm, bottomMargin=1.8*cm,
                            title="BizLegal-AI Reliable Sources for NotebookLM")
    story = []
    story.append(Paragraph("BizLegal-AI — Reliable Governmental & Primary Sources", h1))
    story.append(Paragraph("Curated for NotebookLM. Official regulators and primary legal texts only. Generated %s." % __import__('datetime').date.today().isoformat(), sub))
    story.append(HRFlowable(width="100%", color=colors.HexColor('#ddd')))
    for title, rows in SECTIONS:
        story.append(Paragraph(title, h2))
        for n, u in rows:
            story.append(Paragraph("<b>%s</b>" % n, name))
            if u:
                story.append(Paragraph(u, url))
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", color=colors.HexColor('#ddd')))
    story.append(Paragraph("Disclaimer: BizLegal-AI content is regulatory decision-support, not legal advice. Always confirm obligations with the regulator and qualified counsel. When an official source contradicts a prior assertion, the regulator controls.", sub))
    doc.build(story)
    print("PDF written:", OUT, "| exists:", os.path.exists(OUT), "| bytes:", os.path.getsize(OUT) if os.path.exists(OUT) else 0)

if __name__ == "__main__":
    build()
