import IntakeForm from './IntakeForm'

export const metadata = {
  title: 'הקמת חדר עסקה — DEAL44',
  description: 'חמש שאלות. תקבלו הצעה כתובה בחזרה, בלי שיחת טלפון.',
}

export default function StartPage() {
  return <IntakeForm locale="he-IL" />
}
