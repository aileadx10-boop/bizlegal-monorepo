import LegalPage, { type Section } from '../legal/LegalPage'

export const metadata = {
  title: 'פרטיות — DEAL44',
  description: 'איזה מידע נשמר בחדר העסקה, מי רואה אותו, וכמה זמן הוא נשמר.',
}

/**
 * Written against what the code actually does, not against a template.
 *
 * Every claim here is checkable in the repository: the party table stores a
 * name, an email, a role and a hashed token and nothing else; the room has no
 * anon RLS policy; links expire 90 days after delivery; the audit tape records
 * views and ticks.
 */
const SECTIONS: readonly Section[] = [
  {
    heading: 'מה נשמר',
    body: [
      "לכל משתתף בחדר נשמרים שם, כתובת אימייל, התפקיד בעסקה ושפת הממשק. לכל משימה נשמרים הכיתוב, מי אחראי לה, מועד היעד, ומי סימן אותה כבוצעה ומתי.",
      "כותרת החדר ותאריכי החתימה והמסירה נשמרים כפי שהוזנו על ידי המתווך. אנחנו לא מבקשים ולא שומרים מספרי זהות, פרטי חשבון בנק או מסמכי העסקה עצמם.",
    ],
  },
  {
    heading: 'מי רואה את זה',
    body: [
      "כל מי שמחזיק בקישור האישי שלו רואה את החדר במלואו: את כל המשימות, מי אחראי לכל אחת, והשמות והתפקידים של יתר המשתתפים. כתובות האימייל של המשתתפים אינן מוצגות למשתתפים אחרים.",
      "אין לחדר גישה ציבורית. הקישור נשמר אצלנו כגיבוב (hash) בלבד — הקישור עצמו קיים רק בהודעה שנשלחה אליכם, כך שדליפה של מסד הנתונים לבדה אינה מאפשרת כניסה לחדר.",
    ],
  },
  {
    heading: 'כמה זמן',
    body: [
      "הקישורים פגים 90 יום אחרי מועד המסירה שנרשם בחדר. אחרי המועד הזה הקישור מפסיק לעבוד.",
      "החדר נשמר כדי שהמתווך יוכל לחזור אליו. לבקשת המתווך שפתח את החדר נמחק החדר וכל הנתונים שבו.",
    ],
  },
  {
    heading: 'תזכורות',
    body: [
      "אנחנו שולחים תזכורת יומית אחת לכל היותר, ורק כאשר מועד בחדר שלכם מתקרב או חלף. כל הודעה כוללת דרך להפסיק את התזכורות, וההפסקה נכנסת לתוקף מיד.",
      "אנחנו לא מוסיפים אתכם לרשימת תפוצה ולא שולחים חומר שיווקי בעקבות השתתפות בחדר.",
    ],
  },
  {
    heading: 'ספקים',
    body: [
      "הנתונים מאוחסנים אצל Supabase, והדואר נשלח דרך Resend. שני הספקים מעבדים את הנתונים עבורנו בלבד.",
    ],
  },
  {
    heading: 'יצירת קשר',
    body: ["בשאלות על המידע שנשמר עליכם, או לבקשת מחיקה: team@bizlegal-ai.com"],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      locale="he-IL"
      title="מדיניות פרטיות"
      updated="עודכן 7 בספטמבר 2026"
      sections={SECTIONS}
    />
  )
}
