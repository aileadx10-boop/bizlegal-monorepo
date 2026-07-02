/**
 * BizLegal AI — content-script.js
 * Injected into all pages at document_idle.
 * Listens for messages from popup.js and background.js.
 * Vanilla JS, no bundler required.
 */

const MAX_TEXT_LEN = 10_000

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  switch (msg.action) {
    case 'getPageContent':
      sendResponse({
        text: (document.body ? document.body.innerText : '').slice(0, MAX_TEXT_LEN),
        url: location.href,
        title: document.title,
      })
      break

    case 'getSelection': {
      const selection = window.getSelection()
      sendResponse({
        text: selection ? selection.toString() : '',
      })
      break
    }

    default:
      sendResponse({ error: 'unknown_action' })
  }

  // Return true to signal that sendResponse will be called asynchronously
  // for compatibility with some Chrome versions; we're synchronous here
  // but it doesn't hurt.
  return true
})
