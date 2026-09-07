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
  "room.link_expired": "תוקף הקישור פג. בקשו מהמתווך קישור חדש.",

  // ── Warnings the room must never hide ─────────────────────────────────────
  "warn.template_not_reviewed":
    "התאריכים בחדר הזה מבוססים על רשימת משימות בטיוטה שטרם אושרה על ידי עורך דין. התייחסו אליהם כרשימת עבודה, לא כמועדים מחייבים.",
  "warn.holidays_not_configured":
    "לוח החגים טרם נטען, ולכן תאריכים שמחושבים בימי עסקים עשויים לסטות ביום או יומיים סביב חג.",
  "warn.missing_anchor": "חלק מהתאריכים ריקים משום שתאריכי העסקה טרם הוזנו.",

  // ── Phases ────────────────────────────────────────────────────────────────
  "phase.contract": "חוזה",
  "phase.tax": "מיסים",
  "phase.financing": "משכנתא",
  "phase.clearances": "אישורים",
  "phase.delivery": "מסירה",
  "phase.registration": "רישום",

  // ── Roles ─────────────────────────────────────────────────────────────────
  "role.broker": "מתווך",
  "role.buyer": "קונה",
  "role.seller": "מוכר",
  "role.buyer_lawyer": "עו\"ד הקונה",
  "role.seller_lawyer": "עו\"ד המוכר",
  "role.mortgage_broker": "יועץ משכנתאות",

  // ── Israeli residential purchase tasks ────────────────────────────────────
  "task.il.contract_signed": "הסכם המכר נחתם",
  "task.il.first_payment_at_signing": "התשלום הראשון שולם במעמד החתימה",
  "task.il.irrevocable_poa_signed": "נחתם ייפוי כוח בלתי חוזר",
  "task.il.caveat_registered": "נרשמה הערת אזהרה",
  "task.il.purchase_tax_declaration": "הוגשה הצהרת מס רכישה",
  "task.il.purchase_tax_payment": "שולם מס רכישה",
  "task.il.shevach_declaration": "הוגשה הצהרת מס שבח",
  "task.il.shevach_payment": "שולם מס שבח",
  "task.il.mortgage_application_filed": "הוגשה בקשה למשכנתא",
  "task.il.seller_payoff_letter_obtained": "התקבל מכתב כוונות מהבנק של המוכר",
  "task.il.undertaking_to_register_mortgage": "הונפקה התחייבות לרישום משכנתא",
  "task.il.bank_caveat_registered": "נרשמה הערת אזהרה לטובת הבנק",
  "task.il.mortgage_funds_released": "שוחררו כספי המשכנתא",
  "task.il.betterment_levy_checked": "נבדק היטל השבחה",
  "task.il.municipal_clearance_obtained": "התקבל אישור עירייה לרישום",
  "task.il.tax_certificates_for_registration": "רוכזו אישורי המיסים לרישום",
  "task.il.house_committee_clearance": "התקבל אישור ועד הבית",
  "task.il.final_payment_and_delivery": "תשלום אחרון ומסירת החזקה",
  "task.il.seller_mortgage_released": "נמחקה המשכנתא של המוכר",
  "task.il.utilities_transferred": "הועברו חשבונות החשמל, המים והארנונה",
  "task.il.title_registered": "נרשמו הזכויות בטאבו",

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
