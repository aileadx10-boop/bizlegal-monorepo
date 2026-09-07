# Outbound v2 — three confirmations only Moses can give (written, async)

**Status:** awaiting Moses · reply with "1 yes / 2 yes / 3 yes" (or the correction) and the agent flips the corresponding switch. Until then the engine treats all three as **not confirmed** and `OUTBOUND_AUTOSEND` stays unset.

## 1. Does Israeli Amendment 40 bind an Israeli advertiser sending commercial email to US businesses?

What the agent found (secondary sources, not primary): Section 30A of the Communications Law (Bezeq and Broadcasting) 1982 is framed around the *advertiser* ("מפרסם") sending "דבר פרסומת", not around the recipient's location; commentary (Mondaq 2008 "may have impact far beyond Israel's borders"; law.co.il 2016 amendment note) discusses foreign senders to Israeli recipients, not Israeli senders to foreign recipients. The agent could not find a ruling on the outbound-from-Israel case. **Assumption if unconfirmed:** the law applies to the sender and v1 must be redesigned as a one-time opt-in request ("may we send you the free totals?") rather than an offer — a materially weaker campaign.

## 2. Is signing cold mail "Moses Dor, founder, BizLegal AI — a software company, not a law firm" (no "Adv.") enough to keep it outside Israel Bar advertising rules?

The templates in `agents/outbound/templates/` use exactly that signature and never mention legal services. **Assumption if unconfirmed:** keep the signature as is; if Moses wants "Adv." in it, the Israel Bar Rules (advertising, Rule 3 of the Ethics Rules 1986 as amended) need his read first.

## 3. Is the CAN-SPAM footer in `packages/email/src/outbound.ts` sufficient?

Assembled text (postal address is the env value `OUTBOUND_POSTAL_ADDRESS`):

```
--
<postal address>
This is not legal advice. To stop these emails, reply STOP or use this link: <one-click unsubscribe>
BizLegal AI (DOR INNOVATIONS) is a software company, not a law firm.
```

Checked against 15 U.S.C. §7704(a): accurate header (real sender, dedicated domain), non-deceptive subject (no simulated "Re:"), identification as an advertisement is satisfied by the offer being explicit in the body, valid physical postal address, functioning opt-out honoured within 10 business days (suppression list is immediate). **Assumption if unconfirmed:** the footer ships as written.

_Sources are secondary and listed in `decisions/REVENUE-OS-IDEAS-RATED-2026-09-07.md`. Nothing here is legal advice to anyone; it is the agent's read for the lawyer who owns the decision._
