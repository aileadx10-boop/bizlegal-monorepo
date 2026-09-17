import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getSupabase } from './supabase'

export const PACK_PRODUCTS = ['sf_pack_us_19', 'sf_pack_both_29'] as const
export type PackProduct = (typeof PACK_PRODUCTS)[number]

export function isPackProduct(value: string): value is PackProduct {
  return (PACK_PRODUCTS as readonly string[]).includes(value)
}

export async function grantedPacks(ownerEmail: string): Promise<PackProduct[]> {
  const { data: firm, error: firmError } = await getSupabase()
    .from('sf_firms')
    .select('id')
    .eq('owner_email', ownerEmail.toLowerCase())
    .maybeSingle()
  if (firmError || !firm) return []
  const { data, error } = await getSupabase()
    .from('sf_pack_grants')
    .select('product_id')
    .eq('firm_id', firm.id)
    .eq('status', 'active')
  if (error) throw new Error(error.message)
  return Array.from(new Set((data ?? []).map((row) => row.product_id).filter(isPackProduct)))
}

const US_SECTIONS = [
  'Trust-account reconciliation log',
  'Professional-license renewal calendar',
  'CLE reporting record',
]
const DUBAI_SECTIONS = [
  'Trust reconciliation log',
  'DLD service-charge clearance record',
  'Oqood renewal record',
]

export async function renderPackPdf(productId: PackProduct): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const sections = productId === 'sf_pack_both_29'
    ? [['US', US_SECTIONS], ['Dubai', DUBAI_SECTIONS]] as const
    : [['US', US_SECTIONS]] as const

  for (const [jurisdiction, items] of sections) {
    for (const item of items) {
      const page = pdf.addPage([612, 792])
      page.drawText('SinceFiled Compliance Rhythm Pack', { x: 48, y: 740, size: 18, font: bold, color: rgb(0.08, 0.16, 0.28) })
      page.drawText(`${jurisdiction} — ${item}`, { x: 48, y: 705, size: 14, font: bold })
      page.drawText('Record only dates you have verified from the controlling source.', { x: 48, y: 680, size: 10, font })
      const labels = ['Obligation / reference', 'Controlling source', 'Last completed date', 'Next date to verify', 'Responsible person', 'Notes']
      labels.forEach((label, index) => {
        const y = 630 - index * 82
        page.drawText(label, { x: 48, y, size: 10, font: bold })
        page.drawLine({ start: { x: 48, y: y - 24 }, end: { x: 560, y: y - 24 }, thickness: 0.7, color: rgb(0.65, 0.68, 0.72) })
      })
      page.drawText('Template only. Dates are not calculated legal deadlines. Verify applicable rules and instructions.', { x: 48, y: 55, size: 8, font, color: rgb(0.35, 0.35, 0.35) })
    }
  }
  return pdf.save()
}
