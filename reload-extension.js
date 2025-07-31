// Reload Extension Script
// Run this in the browser console to reload the extension and clear cached data

(function() {
  'use strict';
  
  console.log('🔄 Reloading n9n Copilot extension...');
  
  // Clear all cached data
  try {
    // Clear localStorage
    localStorage.removeItem('n9n_session');
    localStorage.removeItem('n9n_user');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refresh_token');
    console.log('✅ Cleared localStorage');
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
  }
  
  try {
    // Clear chrome.storage if available
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.clear();
      console.log('✅ Cleared chrome.storage');
    }
  } catch (error) {
    console.error('❌ Error clearing chrome.storage:', error);
  }
  
  // Clear any global variables
  if (window.authManager) {
    window.authManager.currentUser = null;
    window.authManager.currentSession = null;
    console.log('✅ Cleared AuthManager state');
  }
  
  if (window.chatManager) {
    window.chatManager.currentConversation = null;
    console.log('✅ Cleared ChatManager state');
  }
  
  // Reload the page to restart the extension
  console.log('🔄 Reloading page...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
})();
