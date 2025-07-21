// n9n AI Copilot Background Service Worker
// Handles extension lifecycle and communication

console.log('n9n AI Copilot background service worker loaded');

// Detection function for n8n pages
const isN8nPage = (tab) => {
  if (!tab || !tab.url) return false;
  return (
    tab.url.includes('n8n.cloud') ||
    tab.url.includes('localhost') ||
    tab.url.includes('127.0.0.1') ||
    tab.url.includes('100.78.164.43')
  );
};

chrome.runtime.onInstalled.addListener((details) => {
  console.log(' n9n AI Copilot installed:', details.reason);
  
  if (details.reason === 'install') {
    console.log('First time installation');
  } else if (details.reason === 'update') {
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type, 'from tab:', sender.tab?.id);
  
  try {
    switch (message.type) {
      case 'GET_EXTENSION_INFO':
        sendResponse({
          version: chrome.runtime.getManifest().version,
          name: chrome.runtime.getManifest().name
        });
        break;

    // Store data in extension storage        
      case 'STORE_DATA':
        if (message.key && message.value) {
          chrome.storage.local.set({ [message.key]: message.value }, () => {
            sendResponse({ success: !chrome.runtime.lastError });
          });
        } else {
          sendResponse({ success: false, error: 'Missing key or value' });
        }
        break;

    // Retrieve data from extension storage
      case 'GET_DATA':
        if (message.key) {
          chrome.storage.local.get([message.key], (result) => {
            sendResponse({ 
              success: !chrome.runtime.lastError, 
              data: result[message.key] 
            });
          });
        } else {
          sendResponse({ success: false, error: 'Missing key' });
        }
        break;

    // Ping the background service worker
      case 'PING':
        sendResponse({ pong: true, timestamp: Date.now() });
        break;
        
      default:
        console.log('Unknown message type:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Background script error:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  // Keep message channel open for async responses
  return true;
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const pageIsN8n = isN8nPage(tab);
    if (pageIsN8n) console.log('n8n page detected:', tab.url);
  }
});

// Keep service worker alive
setInterval(() => {
  console.log(' Service worker heartbeat');
}, 25000); // Every 25 seconds 