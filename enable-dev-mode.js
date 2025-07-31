// Enable Development Mode Script
// Run this in the browser console to enable development mode

(function() {
  'use strict';
  
  console.log('🔧 Enabling development mode...');
  
  // Enable development mode
  localStorage.setItem('n9n_dev_mode', 'true');
  
  // Clear any existing auth data
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('supabase.auth.refresh_token');
  localStorage.removeItem('n9n_session');
  localStorage.removeItem('n9n_user');
  
  // Clear any global variables
  if (window.authManager) {
    window.authManager.currentUser = null;
    window.authManager.currentSession = null;
  }
  
  if (window.chatManager) {
    window.chatManager.currentConversation = null;
  }
  
  console.log('✅ Development mode enabled!');
  console.log('📝 Now when you click "Continue with Google", it will:');
  console.log('   - Use development OAuth (no popup)');
  console.log('   - Create a development user');
  console.log('   - Work with the database queries');
  
  // Reload the page to restart the extension
  console.log('🔄 Reloading page...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
})(); 