// n9n AI Copilot Background Service Worker
// Handles extension lifecycle and communication

console.log('🚀 n9n AI Copilot background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('✅ n9n AI Copilot installed:', details.reason);
  
  if (details.reason === 'install') {
    // Open welcome page or set up initial state
    console.log('🎉 First time installation');
  } else if (details.reason === 'update') {
    console.log('🔄 Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message.type, 'from tab:', sender.tab?.id);
  
  try {
    switch (message.type) {
      case 'GET_EXTENSION_INFO':
        sendResponse({
          version: chrome.runtime.getManifest().version,
          name: chrome.runtime.getManifest().name
        });
        break;
        
      case 'STORE_DATA':
        // Store data in extension storage
        if (message.key && message.value) {
          chrome.storage.local.set({ [message.key]: message.value }, () => {
            sendResponse({ success: !chrome.runtime.lastError });
          });
        } else {
          sendResponse({ success: false, error: 'Missing key or value' });
        }
        break;
        
      case 'GET_DATA':
        // Retrieve data from extension storage
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
        
      case 'PING':
        sendResponse({ pong: true, timestamp: Date.now() });
        break;
        
      default:
        console.log('⚠️ Unknown message type:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('❌ Background script error:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  // Keep message channel open for async responses
  return true;
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if this is an n8n page
    const isN8nPage = tab.url.includes('n8n.cloud') || 
                      tab.url.includes('localhost') ||
                      tab.url.includes('127.0.0.1') ||
                      tab.url.includes('100.78.164.43');
    
    if (isN8nPage) {
      console.log('🎯 n8n page detected:', tab.url);
      // Content script should already be injected via manifest
    }
  }
});

// Note: Extension icon clicks are handled by popup.html since default_popup is defined in manifest
// The onClicked event doesn't fire when a popup is defined

// Keep service worker alive
setInterval(() => {
  console.log('💓 Service worker heartbeat');
}, 25000); // Every 25 seconds 