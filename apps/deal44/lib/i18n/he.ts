/**
 * Hebrew dictionary — the first market's language, not a translation layer
 * bolted on later.
 *
 * Typed as `Record<DictKey, string>` against `en.ts`, so a key added there
 * without a Hebrew string fails typecheck instead of rendering a raw key at an
 * Israeli broker.
 *
 * Wording rules, from decisions/PHASE-1-INTROVERT-FOUNDER.md and the trio
 * liability line: describe, never advise. A task label says what was done, not
 * what should be done, and nothing here tells a party their position is safe.
 */

import type { DictKey } from './types'

export const he: Record<DictKey, string> = {
  // ── Product ───────────────────────────────────────────────────────────────
  "brand": "DEAL44",
  "brand.tagline": "חדר אחד לכל העסקה.",

  // ── Room chrome ───────────────────────────────────────────────────────────
  "room.progress": "התקדמות",
  "room.tasks_done": "{done} מתוך {total} הושלמו",
  "room.your_tasks": "המשימות שלך",
  "room.all_tasks": "כל המשימות בחדר",
  "room.no_tasks": "עדיין אין משימות. המתווך מוסיף אותן ככל שהעסקה מתקדמת.",
  "room.due": "עד",
  "room.no_date": "טרם נקבע תאריך",
  "room.today": "היום",
  "room.tomorrow": "מחר",
  "room.days_left": "בעוד {n} ימים",
  "room.overdue_by": "באיחור של {n} ימים",
  "room.done_on": "הושלם ב-{date}",
  "room.role": "התפקיד שלך",
  "room.parties": "מי בחדר",
  "room.signing": "חתימה",
  "room.closing": "מסירה",
  "room.statutory": "מועד סטטוטורי",
  "room.draft_dates": "תאריכים בטיוטה",
  "room.add_task": "הוספת משימה",
  "room.task_label": "מה צריך לקרות",
  "room.task_phase": "שלב",
  "room.task_owner": "באחריות מי",
  "room.task_due": "עד מתי",
  "room.change_dates": "שינוי תאריכים",
  "room.add_party": "הוספת משתתף",
  "room.send_invite": "לשלוח לו את הקישור במייל",
  "room.link_once": "העתיקו את הקישור עכשיו — הוא מוצג פעם אחת ולא ניתן לשחזור.",
  "room.rescheduled": "{n} תאריכים עודכנו.",
  "room.sale_date": "יום המכירה",
  "room.no_auto_date": "מתוך ההסכם",
  "room.source.statutory": "מכוח הדין",
  "room.source.contractual": "מכוח ההסכם",
  "room.source.operational": "שלב עבודה",
  "room.source.third_party": "תלוי גורם שלישי",
  "room.source.judgment": "מחייב שיקול דעת משפטי",
  "room.review_counsel": "לבדיקה מול עורך הדין שלכם",
  "room.link_expired": "תוקף הקישור פג. בקשו מהמתווך קישור חדש.",

  // ── Warnings the room must never hide ─────────────────────────────────────
  "warn.template_not_reviewed":
    "התאריכים בחדר הזה מבוססים על רשימת משימות בטיוטה שטרם אושרה על ידי עורך דין. התייחסו אליהם כרשימת עבודה, לא כמועדים מחייבים.",
  "warn.holidays_not_configured":
    "לוח החגים טרם נטען, ולכן תאריכים שמחושבים בימי עסקים עשויים לסטות ביום או יומיים סביב חג.",
  "warn.missing_anchor": "חלק מהתאריכים ריקים משום שתאריכי העסקה טרם הוזנו.",

  // ── Phases ────────────────────────────────────────────────────────────────
  "phase.pre_contract": "טרום חתימה",
  "phase.contract": "חוזה",
  "phase.tax": "מיסים",
  "phase.financing": "משכנתא",
  "phase.clearances": "אישורים",
  "phase.delivery": "מסירה",
  "phase.diligence": "בדיקת נאותות",
  "phase.closing": "סגירה",
  "phase.post_closing": "אחרי הסגירה",
  "phase.registration": "רישום",

  // ── Roles ─────────────────────────────────────────────────────────────────
  "role.broker": "מתווך",
  "role.buyer": "קונה",
  "role.seller": "מוכר",
  "role.buyer_lawyer": "עו\"ד הקונה",
  "role.seller_lawyer": "עו\"ד המוכר",
  "role.agent": "סוכן",
  "role.lender": "בנק מלווה",
  "role.title": "חברת נאמנות",
  "role.escrow": "נאמנות",
  "role.mortgage_broker": "יועץ משכנתאות",

  // ── Israeli residential purchase tasks ────────────────────────────────────

  // ── Israeli purchase — vocabulary authored by the practitioner ──
  "task.il.title_extract_reviewed": "בדיקת נסח טאבו",
  "task.il.encumbrances_checked": "בדיקת שעבודים, עיקולים והערות",
  "task.il.seller_mortgage_identified": "איתור משכנתת המוכר",
  "task.il.buyer_finance_feasibility": "בדיקת יכולת מימון של הרוכש",
  "task.il.sale_agreement_signed": "חתימת הסכם המכר",
  "task.il.buyer_caveat_registered": "רישום הערת אזהרה לטובת הקונה",
  "task.il.buyer_tax_declaration": "דיווח הרוכש למיסוי מקרקעין",
  "task.il.seller_tax_declaration": "הצהרת המוכר למס שבח",
  "task.il.purchase_tax_payment": "תשלום מס רכישה",
  "task.il.capital_gains_tax_payment": "תשלום מס שבח",
  "task.il.mortgage_approval_in_principle": "אישור עקרוני למשכנתה",
  "task.il.mortgage_file_opened": "פתיחת תיק משכנתה",
  "task.il.mortgage_valuation": "שמאות",
  "task.il.bank_documents_to_seller": "העברת מסמכי הבנק למוכר",
  "task.il.seller_signs_bank_documents": "חתימת המוכר על מסמכי הבנק",
  "task.il.bank_security_registered": "רישום בטוחה לטובת הבנק",
  "task.il.seller_payoff_letter": "מכתב כוונות למשכנתת המוכר",
  "task.il.seller_mortgage_discharged": "סילוק משכנתת המוכר",
  "task.il.municipal_clearance": "קבלת אישור עירייה",
  "task.il.tax_clearance_certificates": "קבלת אישורי מסים",
  "task.il.purchase_price_payment": "תשלום התמורה",
  "task.il.possession_handover": "מסירת החזקה",
  "task.il.registration_documents_delivered": "מסירת מסמכי הרישום",
  "task.il.ownership_registered": "רישום הבעלות",
  "task.il.mortgage_registered": "רישום המשכנתה",
  "task.il.final_title_extract": "הפקת נסח סופי",
  "task.il.transaction_completed": "סגירת העסקה",
  "task.il.rmi_lease_validity_checked": "בדיקת תוקף החכירה ברמ\"י",
  "task.il.rmi_arrears_checked": "בדיקת חובות ברמ\"י",
  "task.il.rmi_transfer_approval": "אישור העברה מרמ\"י",
  "task.il.company_rights_confirmation": "אישור זכויות מהחברה המשכנת",
  "task.il.company_transfer_documents": "מסמכי העברה בחברה המשכנת",
  "task.il.company_registration_completed": "השלמת רישום בחברה המשכנת",

  // ── Landing ───────────────────────────────────────────────────────────────
  "landing.h1": "כל הצדדים, כל המועדים, חדר אחד.",
  "landing.sub":
    "רשימת משימות משותפת לעסקת נדל\"ן. המתווך פותח חדר, כל צד מקבל קישור אישי, וכל מועד מגיע לאדם שאחראי עליו לפני שהוא חולף.",
  "landing.cta": "פתחו לי חדר לעסקה הבאה",
  "landing.price": "‏2,500 ₪ לעסקה, כולל הקמה וניהול שוטף.",
  "landing.how": "איך זה עובד",
  "landing.how1": "אתם שולחים את ההסכם החתום ואת תאריכי המפתח.",
  "landing.how2": "אנחנו בונים את החדר ושולחים לכל צד קישור פרטי משלו.",
  "landing.how3": "כל אחד רואה מה שלו. תזכורות יוצאות לפני המועד, לא אחריו.",
  "landing.disclaimer":
    "DEAL44 היא תוכנה שמארגנת את רשימת המשימות של העסקה. היא אינה שירות משפטי, אינה ייעוץ משפטי, ואינה מחליפה את עורכי הדין של הצדדים.",

  // ── Intake ────────────────────────────────────────────────────────────────
  "intake.h1": "הקמת חדר עסקה",
  "intake.sub": "חמש שאלות. תקבלו הצעה כתובה בחזרה, בלי שיחת טלפון.",
  "intake.name": "השם שלכם",
  "intake.email": "אימייל",
  "intake.phone": "טלפון (לא חובה)",
  "intake.deals_per_month": "בערך כמה עסקאות בחודש",
  "intake.next_signing": "מתי החתימה הקרובה",
  "intake.notes": "משהו שכדאי שאדע",
  "intake.submit": "שליחה",
  "intake.sending": "שולח...",
  "intake.thanks": "התקבל. תקבלו תשובה כתובה תוך יום עסקים אחד.",
  "intake.error": "השליחה נכשלה. נסו שוב, או כתבו לכתובת שמופיעה למטה.",

  // ── Checkout ──────────────────────────────────────────────────────────────
  "buy.h2": "או לשלם עכשיו ולפתוח את החדר",
  "buy.price": "{price} לעסקה — הקמה וניהול לאורך כל חיי העסקה.",
  "buy.currency": "מטבע",
  "buy.currency.ils": "שקלים (₪)",
  "buy.currency.usd": "דולר ארה\"ב ($)",
  "buy.email": "אימייל לקבלת החשבונית",
  "buy.pay_card": "תשלום בכרטיס אשראי",
  "buy.pay_crypto": "תשלום בקריפטו",
  "buy.card_unavailable":
    "תשלום בכרטיס אינו נסלק בשקלים, ולכן המחיר השקלי משולם בקריפטו או מול חשבונית. כתבו לכתובת שמופיעה למטה והחשבונית תישלח באותו יום.",
  "buy.after":
    "אחרי התשלום נפנה אליכם לקבלת ההסכם החתום, תאריכי המפתח ופרטי הצדדים, ואז כל צד יקבל קישור אישי משלו. לא מוזן תאריך שלא מסרתם.",
  "buy.working": "פותח תשלום...",
  "buy.error":
    "פתיחת התשלום נכשלה. נסו שוב, או כתבו לכתובת שמופיעה למטה ונשלח חשבונית.",

  // ── Email ─────────────────────────────────────────────────────────────────
  "email.invite.subject": "{broker} צירף אתכם לחדר העסקה של {title}",
  "email.invite.intro": "{broker} הקים רשימת משימות משותפת לעסקה הזו וצירף אתכם בתפקיד {role}.",
  "email.invite.cta": "כניסה לחדר",
  "email.invite.explain":
    "בחדר מופיעים כל שלבי העסקה, מי אחראי לכל שלב ומתי הוא אמור להסתיים. תקבלו תזכורת קצרה לפני המועדים שבאחריותכם.",
  "email.digest.subject": "{title} — {n} משימות דורשות תשומת לב",
  "email.digest.intro": "זהו המצב העדכני של העסקה.",
  "email.stop": "להפסקת התזכורות, השיבו למייל הזה במילה הסר.",
  "email.footer.disclaimer":
    "DEAL44 מארגנת את רשימת המשימות של העסקה. אין באמור ייעוץ משפטי. שאלות על מעמדכם בעסקה מופנות לעורך הדין שלכם.",
}
