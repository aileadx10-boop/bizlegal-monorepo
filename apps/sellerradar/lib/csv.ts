/* ─── SellerRadar CSV parser — pure, typed, no dependencies ───────────────
   Hand-rolled per spec §5 (papaparse optional; this keeps the bundle clean
   and the validation errors human-readable, spec §3 criterion 2).

   Expected columns (flexible header mapping): SKU, ASIN, category,
   dimensions (length/width/height in inches, or a single "LxWxH" column),
   weight (lb), COGS, price, est. monthly units. Only SKU, price and monthly
   units are strictly required; everything else degrades to safe defaults
   with a warning, never a crash. */

export interface SellerSkuInput {
  readonly sku: string
  readonly asin: string | null
  readonly category: string
  readonly lengthIn: number | null
  readonly widthIn: number | null
  readonly heightIn: number | null
  readonly weightLb: number | null
  readonly price: number
  readonly cogs: number
  readonly monthlyUnits: number
}

export interface CsvIssue {
  readonly row: number // 1-based data-row number (header is row 0)
  readonly column: string | null
  readonly message: string
}

export interface CsvParseResult {
  readonly ok: boolean
  readonly rows: readonly SellerSkuInput[]
  readonly errors: readonly CsvIssue[] // fatal — nothing parsed
  readonly warnings: readonly CsvIssue[] // row skipped or field defaulted
  readonly headerMap: Readonly<Record<string, string>> // detected header → canonical field
}

/** Hard cap so a garbage multi-MB paste can't melt the function. */
export const MAX_CSV_ROWS = 5000

type CanonicalField =
  | 'sku'
  | 'asin'
  | 'category'
  | 'price'
  | 'cogs'
  | 'weightLb'
  | 'lengthIn'
  | 'widthIn'
  | 'heightIn'
  | 'dimensions'
  | 'monthlyUnits'

const HEADER_SYNONYMS: Readonly<Record<CanonicalField, readonly string[]>> = {
  sku: ['sku', 'seller-sku', 'seller sku', 'seller_sku', 'msku', 'merchant sku', 'merchant_sku'],
  asin: ['asin', 'asin1', 'product id', 'product_id'],
  category: ['category', 'product category', 'product_category', 'item category', 'browse node', 'department'],
  price: ['price', 'item price', 'item_price', 'selling price', 'your price', 'your_price', 'list price', 'sale price'],
  cogs: ['cogs', 'cost', 'unit cost', 'unit_cost', 'cost of goods', 'item cost', 'buy cost'],
  weightLb: ['weight', 'weight lb', 'weight (lb)', 'weight_lb', 'item weight', 'package weight', 'shipping weight'],
  lengthIn: ['length', 'length in', 'length (in)', 'length_in', 'longest side', 'item length'],
  widthIn: ['width', 'width in', 'width (in)', 'width_in', 'median side', 'item width'],
  heightIn: ['height', 'height in', 'height (in)', 'height_in', 'shortest side', 'item height'],
  dimensions: ['dimensions', 'dims', 'size', 'item dimensions', 'package dimensions'],
  monthlyUnits: [
    'monthly units', 'est monthly units', 'est_monthly_units', 'est. monthly units',
    'units', 'monthly sales', 'monthly_sales', 'sales', 'velocity', 'units sold', 'units/month',
  ],
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/["']/g, '').replace(/\s+/g, ' ')
}

/** Split CSV text into rows of cells. Handles quoted fields, embedded
 *  commas/newlines, and CRLF. Malformed quoting degrades to best-effort
 *  instead of throwing. */
export function splitCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text // strip BOM
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell)
      cell = ''
      // Drop fully-empty trailing rows (trailing newline at EOF).
      if (row.length > 1 || row[0].trim() !== '') rows.push(row)
      row = []
    } else if (ch === '\t') {
      // TSV paste from Excel — treat tabs as delimiters too.
      row.push(cell)
      cell = ''
    } else {
      cell += ch
    }
  }
  row.push(cell)
  if (row.length > 1 || row[0].trim() !== '') rows.push(row)
  return rows
}

function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, '')
  if (cleaned === '') return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** "12x9x3", '12 x 9 x 3', '12" x 9" x 3"' → [12, 9, 3] or null. */
export function parseDimensions(raw: string): [number, number, number] | null {
  const m = raw
    .toLowerCase()
    .replace(/["in\s]/g, '')
    .split(/x|×/)
    .map((p) => Number(p))
  if (m.length === 3 && m.every((n) => Number.isFinite(n) && n > 0)) {
    return [m[0], m[1], m[2]]
  }
  return null
}

export function parseSellerCsv(text: string): CsvParseResult {
  const warnings: CsvIssue[] = []
  const errors: CsvIssue[] = []

  if (!text || text.trim() === '') {
    return { ok: false, rows: [], errors: [{ row: 0, column: null, message: 'File is empty — upload a CSV export of your catalog.' }], warnings, headerMap: {} }
  }

  const grid = splitCsv(text)
  if (grid.length < 2) {
    return { ok: false, rows: [], errors: [{ row: 0, column: null, message: 'Only a header row was found — the file needs at least one SKU row.' }], warnings, headerMap: {} }
  }

  // ── Map headers ──
  const headers = grid[0].map(normalizeHeader)
  const colOf = new Map<CanonicalField, number>()
  const headerMap: Record<string, string> = {}
  headers.forEach((h, idx) => {
    for (const [field, synonyms] of Object.entries(HEADER_SYNONYMS) as [CanonicalField, readonly string[]][]) {
      if (synonyms.includes(h) && !colOf.has(field)) {
        colOf.set(field, idx)
        headerMap[grid[0][idx].trim()] = field
        break
      }
    }
  })

  for (const required of ['sku', 'price', 'monthlyUnits'] as const) {
    if (!colOf.has(required)) {
      errors.push({
        row: 0,
        column: required,
        message: `Missing required column "${required}" — accepted headers: ${HEADER_SYNONYMS[required].slice(0, 4).join(', ')}.`,
      })
    }
  }
  if (errors.length > 0) return { ok: false, rows: [], errors, warnings, headerMap }

  const dataRows = grid.slice(1)
  if (dataRows.length > MAX_CSV_ROWS) {
    errors.push({ row: 0, column: null, message: `Too many rows (${dataRows.length}) — the MVP accepts up to ${MAX_CSV_ROWS} SKUs per upload.` })
    return { ok: false, rows: [], errors, warnings, headerMap }
  }

  const get = (cells: string[], field: CanonicalField): string => {
    const idx = colOf.get(field)
    return idx == null ? '' : (cells[idx] ?? '').trim()
  }

  const rows: SellerSkuInput[] = []
  dataRows.forEach((cells, i) => {
    const rowNum = i + 1
    const sku = get(cells, 'sku')
    if (!sku) {
      warnings.push({ row: rowNum, column: 'sku', message: `Row ${rowNum}: empty SKU — row skipped.` })
      return
    }
    const price = parseMoney(get(cells, 'price'))
    if (price == null || price <= 0) {
      warnings.push({ row: rowNum, column: 'price', message: `Row ${rowNum} (${sku}): price "${get(cells, 'price')}" is not a positive number — row skipped.` })
      return
    }
    const monthlyUnits = parseMoney(get(cells, 'monthlyUnits'))
    if (monthlyUnits == null) {
      warnings.push({ row: rowNum, column: 'monthlyUnits', message: `Row ${rowNum} (${sku}): monthly units "${get(cells, 'monthlyUnits')}" is not a number — row skipped.` })
      return
    }
    const cogsRaw = get(cells, 'cogs')
    const cogs = cogsRaw ? parseMoney(cogsRaw) : null
    if (cogsRaw && cogs == null) {
      warnings.push({ row: rowNum, column: 'cogs', message: `Row ${rowNum} (${sku}): COGS "${cogsRaw}" unreadable — defaulted to $0.` })
    }

    let lengthIn: number | null = null
    let widthIn: number | null = null
    let heightIn: number | null = null
    const dimsRaw = get(cells, 'dimensions')
    if (dimsRaw) {
      const parsed = parseDimensions(dimsRaw)
      if (parsed) {
        ;[lengthIn, widthIn, heightIn] = parsed
      } else {
        warnings.push({ row: rowNum, column: 'dimensions', message: `Row ${rowNum} (${sku}): dimensions "${dimsRaw}" unreadable (want LxWxH inches) — FBA size tier may be estimated high.` })
      }
    } else {
      const l = parseMoney(get(cells, 'lengthIn'))
      const w = parseMoney(get(cells, 'widthIn'))
      const h = parseMoney(get(cells, 'heightIn'))
      lengthIn = l
      widthIn = w
      heightIn = h
    }

    const weightRaw = get(cells, 'weightLb')
    const weightLb = weightRaw ? parseMoney(weightRaw) : null
    if (weightRaw && weightLb == null) {
      warnings.push({ row: rowNum, column: 'weightLb', message: `Row ${rowNum} (${sku}): weight "${weightRaw}" unreadable — defaulted for size-tier classification.` })
    }

    rows.push({
      sku,
      asin: get(cells, 'asin') || null,
      category: get(cells, 'category') || 'default',
      lengthIn,
      widthIn,
      heightIn,
      weightLb,
      price,
      cogs: cogs ?? 0,
      monthlyUnits,
    })
  })

  if (rows.length === 0) {
    errors.push({ row: 0, column: null, message: 'No usable SKU rows — every row failed validation (see details above).' })
    return { ok: false, rows: [], errors, warnings, headerMap }
  }

  return { ok: true, rows, errors, warnings, headerMap }
}
