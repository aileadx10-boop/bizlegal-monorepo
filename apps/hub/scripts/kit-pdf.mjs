// O-018 — render lib/kit/ai-teammate-kit.ts to content/kits/ai-teammate-kit-<ver>.pdf (local tool; run from apps/hub: node scripts/kit-pdf.mjs). Needs Playwright chromium locally; not used at runtime.
import fs from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import { chromium } from 'playwright'

const src = fs.readFileSync(path.resolve('lib/kit/ai-teammate-kit.ts'), 'utf8')
const start = src.indexOf('`', src.indexOf('export const KIT_MARKDOWN')) + 1
const end = src.indexOf('`.trim()', start)
const md = src.slice(start, end).trim()
const body = renderToStaticMarkup(React.createElement(ReactMarkdown, null, md))
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{font-family:Georgia,serif;font-size:11.5pt;line-height:1.55;color:#111;margin:0;padding:0}
h1{font-size:22pt;margin:0 0 8pt} h2{font-size:15pt;margin:20pt 0 6pt;page-break-after:avoid}
p{margin:0 0 8pt} li{margin:0 0 3pt} blockquote{border-left:3px solid #1a56db;margin:8pt 0;padding:4pt 10pt;color:#222}
table{border-collapse:collapse;width:100%;font-size:10pt;margin:8pt 0} th,td{border:1px solid #999;padding:4pt 6pt;vertical-align:top;text-align:left}
hr{border:none;border-top:1px solid #999;margin:16pt 0} em{color:#333}
</style></head><body>${body}</body></html>`
const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent(html, { waitUntil: 'load' })
const out = path.resolve('../../content/kits/ai-teammate-kit-1.0.pdf')
await page.pdf({ path: out, format: 'A4', margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' }, printBackground: true,
  displayHeaderFooter: true, headerTemplate: '<div></div>',
  footerTemplate: '<div style="font-size:8pt;color:#666;width:100%;text-align:center;font-family:Georgia,serif">AI Teammate Kit for Law Practices · v1.0 · Moses Dor, Adv. · page <span class="pageNumber"></span>/<span class="totalPages"></span></div>' })
await browser.close()
const stat = fs.statSync(out)
console.log('PDF written:', out, stat.size, 'bytes; markdown chars:', md.length, '; h2 count:', (body.match(/<h2/g)||[]).length)
