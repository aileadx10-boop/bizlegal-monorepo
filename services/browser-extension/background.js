/**
 * BizLegal AI — background.js (Manifest V3 service worker)
 * Runs as a module (type: "module" in manifest).
 * Vanilla JS, no bundler required.
 */

const HUB_ORIGIN = 'https://bizlegal-ai.com'
const CAPTURE_ENDPOINT = `${HUB_ORIGIN}/api/extension/capture`
const MENU_CAPTURE = 'bizlegal_capture'
const MENU_CONTRACT = 'bizlegal_contract'
const MENU_WALLET = 'bizlegal_wallet'

// ── Install: create context menus ────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_CAPTURE,
    title: 'Send to BizLegal AI',
    contexts: ['page', 'selection'],
  })

  chrome.contextMenus.create({
    id: MENU_CONTRACT,
    title: 'Analyze as Contract (DocAI)',
    contexts: ['selection'],
  })

  chrome.contextMenus.create({
    id: MENU_WALLET,
    title: 'Check as Wallet (Tracr)',
    contexts: ['selection'],
  })
})

// ── Context menu click handler ────────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectionText = (info.selectionText || '').trim()
  const pageUrl = info.pageUrl || (tab && tab.url) || ''
  const pageTitle = (tab && tab.title) || ''

  let action = 'page_capture'
  if (info.menuItemId === MENU_CONTRACT) action = 'contract_analyze'
  if (info.menuItemId === MENU_WALLET) action = 'wallet_track'

  const captureId = await postCapture({
    url: pageUrl,
    title: pageTitle,
    text: selectionText || '',
    action,
  })

  if (captureId) {
    incrementCaptureCount()
    notifyUser(action, pageTitle || pageUrl)
  }
})

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiKey'], (result) => {
      resolve(result.apiKey || null)
    })
  })
}

async function postCapture(payload) {
  const apiKey = await getApiKey()
  if (apiKey) payload.api_key = apiKey

  try {
    const res = await fetch(CAPTURE_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.capture_id || null
  } catch {
    return null
  }
}

function incrementCaptureCount() {
  chrome.storage.local.get(['captureCount'], (result) => {
    const count = ((result.captureCount || 0) + 1)
    chrome.storage.local.set({ captureCount: count })
  })
}

function notifyUser(action, label) {
  if (!chrome.notifications) return

  const titles = {
    page_capture: 'Page Captured',
    contract_analyze: 'Contract Sent',
    compliance_check: 'Compliance Check Queued',
    wallet_track: 'Wallet Queued',
  }

  const messages = {
    page_capture: `"${label}" sent to BizLegal agents.`,
    contract_analyze: `Contract text from "${label}" sent to DocAI.`,
    compliance_check: `Running compliance check on "${label}".`,
    wallet_track: `Wallet from "${label}" queued in Tracr.`,
  }

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHJ4PSIxMiIgZmlsbD0iIzYzNjZmMSIvPjx0ZXh0IHg9IjI0IiB5PSIzMyIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSI3MDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CPC90ZXh0Pjwvc3ZnPg==',
    title: titles[action] || 'BizLegal AI',
    message: messages[action] || 'Capture queued.',
  })
}
