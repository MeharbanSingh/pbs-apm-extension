// Background Service Worker for Chrome Extension
/// <reference types="chrome"/>

chrome.runtime.onInstalled.addListener(() => {
  console.log('PBS APM Extension installed');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log('Background received message:', message);

  if (message.type === 'GET_DATA') {
    // Handle data requests
    sendResponse({ success: true, data: 'Data from background' });
  }

  if (message.type === 'GET_PAGE_INFO') {
    // Relay message to active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_PAGE_INFO' }, (response: any) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true; // Keep message channel open for async response
  }

  return true; // Keep message channel open for async responses
});

// Example: Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: any, tab: chrome.tabs.Tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
  }
});
