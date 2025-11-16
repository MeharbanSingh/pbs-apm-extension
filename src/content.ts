// Content Script - Runs in the context of web pages
/// <reference types="chrome"/>

console.log('PBS APM Content Script loaded');

// Example: Send message to background script
chrome.runtime.sendMessage(
  { type: 'CONTENT_LOADED', url: window.location.href },
  (response: any) => {
    console.log('Background response:', response);
  }
);

// Example: Listen for messages from background or popup
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log('Content yy script received message:', message);
  let dataKey = `appData.khp${window.location.pathname.toLocaleLowerCase()}`;
   console.log('Fetching localStorage data with key:', dataKey);
  if (message.type === 'PING') {
    sendResponse({ type: 'PONG', url: window.location.href });
  }

  if (message.type === 'GET_PAGE_INFO') {
    // Respond with page info

    sendResponse({
      success: true,
      data: {
        serverName: window.location.hostname,
        applicationName: window.location.pathname,
        localStorageData: window.localStorage.getItem(dataKey) ? JSON.parse(window.localStorage.getItem(dataKey)!) : null

      }
    });
  }

  return true;
});

// Example: Manipulate the DOM
function initContentScript() {
  // Add your DOM manipulation logic here
  const body = document.body;
  if (body) {
    body.setAttribute('data-pbs-apm-extension', 'loaded');
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}
