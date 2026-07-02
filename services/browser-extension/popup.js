/**
 * BizLegal AI — popup.js
 * Runs in the extension popup context (not the page context).
 * Vanilla JS, no bundler required.
 */

const HUB_ORIGIN = 'https://bizlegal-ai.com'
const DOCAI_ORIGIN = 'https://docai.bizlegal-ai.com'
const TRACR_ORIGIN = 'https://tracr.bizlegal-ai.com'

const statusEl = document.getElementById('status-msg')

function setStatus(msg, kind) {
  statusEl.textContent = msg
  statusEl.className = kind || ''
}

function getCurrentTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] || null)
    })
  })
}

function sendMessageToContent(tabId, msg) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, msg, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve(response)
      }
    })
  })
}

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

  const res = await fetch(`${HUB_ORIGIN}/api/extension/capture`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Capture Page ─────────────────────────────────────────────────────────────

document.getElementById('btn-capture').addEventListener('click', async () => {
  setStatus('Capturing page…', 'busy')

  const tab = await getCurrentTab()
  if (!tab || !tab.id) {
    setStatus('No active tab found.', 'error')
    return
  }

  let content
  try {
    content = await sendMessageToContent(tab.id, { action: 'getPageContent' })
  } catch {
    setStatus('Cannot read page — try refreshing.', 'error')
    return
  }

  try {
    const result = await postCapture({
      url: content.url,
      title: content.title,
      text: content.text,
      action: 'page_capture',
    })
    setStatus(`Captured! ${result.message || ''}`, 'ok')
  } catch (err) {
    setStatus(`Capture failed: ${err.message}`, 'error')
  }
})

// ── Analyze Contract ─────────────────────────────────────────────────────────

document.getElementById('btn-contract').addEventListener('click', async () => {
  setStatus('Getting selection…', 'busy')

  const tab = await getCurrentTab()
  if (!tab || !tab.id) {
    setStatus('No active tab found.', 'error')
    return
  }

  let sel
  try {
    sel = await sendMessageToContent(tab.id, { action: 'getSelection' })
  } catch {
    sel = { text: '' }
  }

  if (sel && sel.text && sel.text.trim().length > 20) {
    // Log the selection then open DocAI with ref param
    await postCapture({
      url: tab.url || '',
      title: tab.title || '',
      text: sel.text.slice(0, 50000),
      action: 'contract_analyze',
    }).catch(() => {})
  }

  chrome.tabs.create({ url: `${DOCAI_ORIGIN}/?ref=extension` })
  setStatus('Opened DocAI contract analyzer.', 'ok')
})

// ── Check Compliance ─────────────────────────────────────────────────────────

document.getElementById('btn-compliance').addEventListener('click', async () => {
  const tab = await getCurrentTab()
  if (!tab) {
    setStatus('No active tab found.', 'error')
    return
  }

  const currentUrl = tab.url || ''
  const encodedUrl = encodeURIComponent(currentUrl)
  chrome.tabs.create({
    url: `${HUB_ORIGIN}/use-cases/website-compliance?url=${encodedUrl}`,
  })
  setStatus('Opened compliance checker.', 'ok')

  postCapture({
    url: currentUrl,
    title: tab.title || '',
    text: '',
    action: 'compliance_check',
  }).catch(() => {})
})

// ── Track Wallet ─────────────────────────────────────────────────────────────

document.getElementById('btn-wallet').addEventListener('click', async () => {
  setStatus('Getting selection…', 'busy')

  const tab = await getCurrentTab()
  if (!tab || !tab.id) {
    setStatus('No active tab found.', 'error')
    return
  }

  let sel
  try {
    sel = await sendMessageToContent(tab.id, { action: 'getSelection' })
  } catch {
    sel = { text: '' }
  }

  const address = sel && sel.text ? sel.text.trim().replace(/\s+/g, '') : ''
  const encodedAddress = encodeURIComponent(address)

  chrome.tabs.create({
    url: `${TRACR_ORIGIN}/?address=${encodedAddress}&ref=extension`,
  })
  setStatus(address ? 'Opened Tracr for wallet.' : 'Opened Tracr — paste an address.', 'ok')

  if (address) {
    postCapture({
      url: tab.url || '',
      title: tab.title || '',
      text: address,
      action: 'wallet_track',
    }).catch(() => {})
  }
})

// ── Settings ─────────────────────────────────────────────────────────────────

document.getElementById('btn-settings').addEventListener('click', () => {
  chrome.tabs.create({ url: `${HUB_ORIGIN}/extension/settings` })
})
