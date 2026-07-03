# Data Processing Agreement (DPA)

**GDPR Article 28 compliant | BizLegal AI template**  
**Version:** 2026-07-03 | Governed by: [INSERT CLIENT GOVERNING LAW CHOICE]

---

## Parties

**Data Controller ("Controller"):**  
[CLIENT COMPANY NAME]  
[CLIENT ADDRESS]  
("Client")

**Data Processor ("Processor"):**  
DOR INNOVATIONS  
Operating as BizLegal AI  
[IL ADDRESS]  
("BizLegal AI")

---

## 1. Subject Matter and Duration

1.1 This DPA governs the processing of personal data by BizLegal AI on behalf of the Client in connection with the delivery of compliance AI services described in the Master Service Agreement ("MSA") between the parties.

1.2 This DPA is incorporated into and forms part of the MSA. In case of conflict, this DPA prevails for data protection matters.

1.3 Duration: this DPA remains in force for the term of the MSA plus 90 days (for data deletion/return processing).

---

## 2. Nature and Purpose of Processing

**Nature:** Collection, storage, analysis, and generation of compliance-related outputs from documents provided by the Controller.

**Purpose:** Delivery of the contracted compliance AI service (contract risk scanning, compliance health scoring, regulatory change monitoring).

**Types of personal data processed:**  
- Names, email addresses, and job titles appearing in contracts and compliance documents uploaded by the Controller
- Contact information of Controller's employees and counterparties within uploaded documents
- Any personal data incidentally present in uploaded contracts, policies, or compliance materials

**Categories of data subjects:**  
- Controller's employees
- Controller's contractual counterparties (vendors, customers, partners)

---

## 3. Processor Obligations

BizLegal AI shall:

3.1 Process personal data only on documented instructions from the Controller, including with regard to transfers, unless required to do so by applicable law.

3.2 Ensure that persons authorised to process the personal data have committed themselves to confidentiality or are under an appropriate statutory obligation of confidentiality.

3.3 Implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including:
- Encryption of personal data at rest (AES-256) and in transit (TLS 1.2+)
- Ability to ensure ongoing confidentiality, integrity, and availability
- Process for testing, assessing, and evaluating security measures regularly
- Logical tenant isolation (row-level security in Supabase)

3.4 Not engage a sub-processor without prior specific or general written authorisation of the Controller. Current authorised sub-processors are listed in Schedule 1.

3.5 Make available to the Controller all information necessary to demonstrate compliance with this DPA, and allow for and contribute to audits and inspections.

3.6 Notify the Controller within 72 hours of becoming aware of a personal data breach affecting the Controller's data.

3.7 Delete or return all personal data to the Controller upon termination of services (Controller's choice), and delete existing copies within 30 days of the request.

---

## 4. Controller Obligations

The Controller shall:

4.1 Ensure that the processing of personal data instructed hereunder complies with applicable data protection law.

4.2 Obtain all necessary consents and provide all required notices to data subjects before sharing their personal data with BizLegal AI.

4.3 Notify BizLegal AI promptly of any data subject requests received that relate to data processed by BizLegal AI under this DPA.

---

## 5. International Transfers

5.1 Processing occurs primarily within the EU (Hetzner, Frankfurt) and the USA (Anthropic, Supabase, Vercel, Resend, Cloudflare). Where personal data is transferred outside the EEA, BizLegal AI relies on:

- Standard Contractual Clauses (SCCs) issued by the European Commission (June 2021) for transfers to sub-processors in third countries; or
- Sub-processor's own transfer mechanism (Anthropic, Supabase, Vercel, Cloudflare all have EU-US Data Privacy Framework certification or equivalent SCCs in place).

5.2 A copy of applicable SCCs is available upon request.

---

## 6. Sub-processors

Current authorised sub-processors (Schedule 1):

| Sub-processor | Purpose | Location | Transfer mechanism |
|---|---|---|---|
| Anthropic, PBC | AI inference | USA | SCCs / DPF |
| Supabase Inc. | Database | USA/EU | SCCs / DPF |
| Vercel Inc. | App hosting | Global | SCCs / DPF |
| Firecrawl | Web extraction | USA | SCCs |
| Resend Inc. | Email delivery | USA | SCCs / DPF |
| Hetzner Online | Server infra | Germany (EU) | N/A (EU) |
| Cloudflare Inc. | CDN / WAF | Global | SCCs / DPF |

BizLegal AI will provide 30 days' notice before adding or replacing a sub-processor, giving the Controller the opportunity to object.

---

## 7. Data Subject Rights

7.1 BizLegal AI will promptly notify the Controller of any requests from data subjects exercising their rights under applicable data protection law.

7.2 BizLegal AI will not respond to such requests on behalf of the Controller but will provide reasonable assistance.

---

## 8. Governing Law and Disputes

8.1 This DPA shall be governed by the laws of [INSERT JURISDICTION] unless the parties have agreed otherwise in the MSA.

8.2 Disputes arising from this DPA shall be resolved in accordance with the dispute resolution clause of the MSA.

---

**Signed for and on behalf of the Controller:**

Name: ___________________________  
Title: ___________________________  
Date: ___________________________  

**Signed for and on behalf of BizLegal AI / DOR INNOVATIONS:**

Name: Moses Dor  
Title: Founder & CEO  
Date: ___________________________  

---

*This template is provided for reference. It does not constitute legal advice. Parties should have this agreement reviewed by qualified legal counsel before signing.*
