// ModalManager.js - Handles all modal operations (auth, API keys, user account)
// Depends on: Utils

class ModalManager {
  constructor() {
    this.currentModal = null;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      z-index: 1000000;
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease;
    `;

    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b'
    };

    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);

    // Add animation styles if not already present
    if (!document.getElementById('notification-animations')) {
      const style = document.createElement('style');
      style.id = 'notification-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  createModal(content, options = {}) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000000;
      animation: fadeIn 0.2s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    modalContent.innerHTML = content;
    modal.appendChild(modalContent);

    // Add animation styles if not already present
    if (!document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);
    this.currentModal = modal;
    return modal;
  }

  closeModal() {
    if (this.currentModal) {
      this.currentModal.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 200);
    }
  }

  // Authentication is now handled directly in the chat panel
  // This method is kept for backward compatibility but redirects to chat panel
  async showAuthenticationModal() {
    console.log('⚠️ Authentication modal is deprecated. Use chat panel authentication instead.');
    // Trigger UI refresh to show authentication in chat panel
    if (window.uiManager) {
      window.uiManager.renderInitialContent();
    }
  }

  showUserAccountModal(user) {
    const modal = this.createModal(`
      <div style="text-align: center;">
        <div style="margin-bottom: 20px;">
          <div style="
            width: 64px;
            height: 64px;
            background: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            font-size: 24px;
            color: white;
            font-weight: 600;
          ">${user.email?.charAt(0).toUpperCase() || 'U'}</div>
          <h3 style="margin: 0 0 8px; color: #fafafa; font-size: 18px;">Welcome back!</h3>
          <p style="margin: 0; color: #a1a1aa; font-size: 14px;">${user.email}</p>
        </div>
        
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button id="refresh-workflows" style="
            flex: 1;
            padding: 10px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 6px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Refresh Workflows</button>
          <button id="sign-out-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: #dc2626;
            border: 1px solid #ef4444;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Sign Out</button>
        </div>
      </div>
    `);

    this.setupAccountModalListeners(modal);
  }

  setupAccountModalListeners(modal) {
    const refreshBtn = modal.querySelector('#refresh-workflows');
    const signOutBtn = modal.querySelector('#sign-out-btn');

    refreshBtn?.addEventListener('click', async () => {
      refreshBtn.textContent = 'Refreshing...';
      refreshBtn.disabled = true;
      
      try {
        if (window.workflowDetector) {
          await window.workflowDetector.refreshWorkflows();
        }
        this.showNotification('Workflows refreshed!', 'success');
      } catch (error) {
        this.showNotification('Failed to refresh workflows', 'error');
      }
      
      refreshBtn.textContent = 'Refresh Workflows';
      refreshBtn.disabled = false;
    });

    signOutBtn?.addEventListener('click', async () => {
      try {
        await window.authManager?.signOut();
        this.closeModal();
        this.showNotification('Signed out successfully', 'success');
        // Trigger UI refresh
        if (window.uiManager) {
          window.uiManager.renderInitialContent();
        }
      } catch (error) {
        this.showNotification('Failed to sign out', 'error');
      }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  // These methods are deprecated - authentication is now handled in the chat panel
  showSignInModal() {
    console.log('⚠️ showSignInModal is deprecated. Use chat panel authentication instead.');
    if (window.uiManager) {
      window.uiManager.renderInitialContent();
    }
  }

  setupSignInModalListeners(modal) {
    console.log('⚠️ setupSignInModalListeners is deprecated.');
  }

  showSignUpModal() {
    console.log('⚠️ showSignUpModal is deprecated. Use chat panel authentication instead.');
    if (window.uiManager) {
      window.uiManager.renderInitialContent();
    }
  }

  setupSignUpModalListeners(modal) {
    console.log('⚠️ setupSignUpModalListeners is deprecated.');
  }

  async showApiKeyModal() {
    const existingKey = await this.getExistingApiKey();
    if (existingKey) {
      this.showApiKeyManagementModal(existingKey);
    } else {
      this.showApiKeySetupModal();
    }
  }

  async getExistingApiKey() {
    try {
      // Check if authManager and supabaseClient are available
      if (!window.authManager || !window.supabaseClient) {
        console.log('❌ AuthManager or supabaseClient not available');
        return null;
      }

      const user = await window.authManager.getCurrentUser();
      if (!user) return null;

      // Use the real Supabase client to get API key
      const { data, error } = await window.supabaseClient.client
        .from('user_api_keys')
        .select('api_key')
        .eq('user_id', user.id)
        .single()
        .execute();
      
      if (error) {
        console.error('Error fetching API key:', error);
        return null;
      }
      
      return data?.api_key || null;
    } catch (error) {
      console.error('Error fetching API key:', error);
      return null;
    }
  }

  validateApiKeyFormat(key) {
    return key && key.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(key);
  }

  showApiKeyManagementModal(existingKey) {
    const maskedKey = this.maskApiKey(existingKey);
    
    const modal = this.createModal(`
      <div style="text-align: center;">
        <h2 style="margin: 0 0 16px; color: #fafafa;">API Key Management</h2>
        <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 14px;">
          Your current API key is configured
        </p>
        
        <div style="
          background: #27272a;
          border: 1px solid #3f3f46;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
          font-family: monospace;
          font-size: 14px;
          color: #fafafa;
        ">${maskedKey}</div>
        
        <div style="display: flex; gap: 12px;">
          <button id="update-key-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: #3b82f6;
            border: 1px solid #60a5fa;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Update Key</button>
          <button id="delete-key-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: #dc2626;
            border: 1px solid #ef4444;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Delete Key</button>
        </div>
      </div>
    `);

    this.setupApiKeyManagementListeners(modal, existingKey);
  }

  maskApiKey(key) {
    if (!key || key.length < 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  }

  setupApiKeyManagementListeners(modal, existingKey) {
    const updateBtn = modal.querySelector('#update-key-btn');
    const deleteBtn = modal.querySelector('#delete-key-btn');

    updateBtn?.addEventListener('click', () => {
      this.closeModal();
      this.showApiKeySetupModal(true);
    });

    deleteBtn?.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete your API key? This will disable AI features.')) {
        try {
          await this.deleteApiKey();
          this.closeModal();
          this.showNotification('API key deleted successfully', 'success');
        } catch (error) {
          this.showNotification('Failed to delete API key', 'error');
        }
      }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  async deleteApiKey() {
    // Check if authManager and supabaseClient are available
    if (!window.authManager || !window.supabaseClient) {
      console.log('❌ AuthManager or supabaseClient not available');
      throw new Error('Authentication not available');
    }

    const user = await window.authManager.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

          // Use the real Supabase client to delete API key
      const { error } = await window.supabaseClient.client
        .from('user_api_keys')
        .delete()
        .eq('user_id', user.id)
        .execute();
    
    if (error) {
      console.error('Error deleting API key:', error);
      throw new Error('Failed to delete API key');
    }
  }

  showApiKeySetupModal(isUpdate = false) {
    const modal = this.createModal(`
      <div style="text-align: center;">
        <h2 style="margin: 0 0 16px; color: #fafafa;">
          ${isUpdate ? 'Update' : 'Setup'} API Key
        </h2>
        <p style="margin: 0 0 24px; color: #a1a1aa; font-size: 14px;">
          Enter your OpenAI API key to enable AI features
        </p>
        
        <div style="margin-bottom: 20px;">
          <input type="password" id="api-key-input" placeholder="sk-..." style="
            width: 100%;
            padding: 12px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #fafafa;
            font-size: 14px;
            font-family: monospace;
            outline: none;
            transition: border-color 0.2s;
          ">
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button id="save-key-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: #3b82f6;
            border: 1px solid #60a5fa;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Save Key</button>
          <button id="cancel-key-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 6px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Cancel</button>
        </div>
      </div>
    `);

    this.setupApiKeyModalListeners(modal);
  }

  setupApiKeyModalListeners(modal) {
    const saveBtn = modal.querySelector('#save-key-btn');
    const cancelBtn = modal.querySelector('#cancel-key-btn');
    const input = modal.querySelector('#api-key-input');

    const closeModal = () => {
      this.closeModal();
    };

    const saveApiKey = async () => {
      const key = input.value.trim();
      
      if (!this.validateApiKeyFormat(key)) {
        this.showNotification('Please enter a valid API key', 'error');
        return;
      }

      try {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        // Check if authManager and supabaseClient are available
        if (!window.authManager || !window.supabaseClient) {
          console.log('❌ AuthManager or supabaseClient not available');
          throw new Error('Authentication not available');
        }

        const user = await window.authManager.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        // Use the real Supabase client to save API key
        const { error } = await window.supabaseClient.client
          .from('user_api_keys')
          .upsert([{
            user_id: user.id,
            api_key: key,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }], {
            onConflict: 'user_id'
          })
          .execute();
        
        if (error) {
          console.error('Error saving API key:', error);
          throw new Error('Failed to save API key');
        }

        closeModal();
        this.showNotification('API key saved successfully!', 'success');
      } catch (error) {
        this.showNotification('Failed to save API key', 'error');
        saveBtn.textContent = 'Save Key';
        saveBtn.disabled = false;
      }
    };

    saveBtn?.addEventListener('click', saveApiKey);
    cancelBtn?.addEventListener('click', closeModal);

    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveApiKey();
      }
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Focus input on modal open
    setTimeout(() => {
      input?.focus();
    }, 100);
  }

  highlightProfileIcon() {
    const profileIcon = document.querySelector('[data-test-id="user-menu-button"]');
    if (profileIcon) {
      profileIcon.style.animation = 'pulse 2s infinite';
      profileIcon.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
      
      // Add pulse animation if not already present
      if (!document.getElementById('pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  cleanupHighlights() {
    const profileIcon = document.querySelector('[data-test-id="user-menu-button"]');
    if (profileIcon) {
      profileIcon.style.animation = '';
      profileIcon.style.boxShadow = '';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModalManager;
}

// Expose globally for browser extension
window.ModalManager = ModalManager; 