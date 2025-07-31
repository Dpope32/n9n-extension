// UIManager.js - Main UI coordinator that delegates to specialized managers
// Depends on: SidebarManager, ModalManager, ChatManager, WorkflowManager, Utils

class UIManager {
  constructor() {
    this.sidebarManager = new SidebarManager();
    this.modalManager = new ModalManager();
    this.chatManager = new ChatManager();
    this.workflowManager = new WorkflowManager();
    
    // Initialize managers
    this.initializeManagers();
  }

  initializeManagers() {
    // Make managers available globally for cross-module communication
    window.sidebarManager = this.sidebarManager;
    window.modalManager = this.modalManager;
    window.chatManager = this.chatManager;
    window.workflowManager = this.workflowManager;
    window.uiManager = this;
  }

  createSidebar() {
    console.log('🎨 Creating sidebar...');
    const sidebar = this.sidebarManager.createSidebar();
    this.setupEventListeners();
    
    // Automatically show the sidebar
    this.sidebarManager.showSidebar();
    
    // Test: Immediately add some content to verify DOM is working
    const testContainer = document.querySelector('#messages-container');
    if (testContainer) {
      console.log('🧪 TEST: Found messages container, adding test content');
      testContainer.innerHTML = '<div style="padding: 20px; color: white;">Loading...</div>';
    } else {
      console.error('🧪 TEST: Could not find messages container!');
    }
    
    // Render initial content after a small delay to ensure DOM is ready
    setTimeout(() => {
      console.log('🎨 Timeout reached, rendering initial content...');
      this.renderInitialContent().catch(error => {
        console.error('❌ Failed to render initial content:', error);
        this.chatManager.renderWelcomeMessage();
      });
    }, 100);
    
    return sidebar;
  }

  setupEventListeners() {
    const sidebar = this.sidebarManager.getSidebar();
    if (!sidebar) return;

    const newChatBtn = sidebar.querySelector('#new-chat-btn');
    const settingsBtn = sidebar.querySelector('#settings-btn');
    const closeSidebarBtn = sidebar.querySelector('#header-close-btn');

    newChatBtn?.addEventListener('click', () => {
      this.chatManager.startNewChat();
    });

    settingsBtn?.addEventListener('click', () => {
      this.openSettings();
    });

    closeSidebarBtn?.addEventListener('click', () => {
      this.sidebarManager.closeSidebar();
    });

    const messageInput = sidebar.querySelector('#chat-input');
    const sendMessageBtn = sidebar.querySelector('#send-btn');

    messageInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.chatManager.sendMessage();
      }
    });

    messageInput?.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });

    sendMessageBtn?.addEventListener('click', () => {
      this.chatManager.sendMessage();
    });

    const toggleButton = this.sidebarManager.addToggleButton();
    this.sidebarManager.setupToggleButtonEvents(toggleButton);
  }

  openSettings() {
    // Show settings modal with options
    const modal = this.modalManager.createModal(`
      <div style="text-align: center;">
        <h2 style="margin: 0 0 16px; color: #fafafa;">Settings</h2>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="auth-settings-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          ">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Account & Authentication
            </div>
          </button>
          
          <button id="api-key-settings-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          ">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              API Key Management
            </div>
          </button>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #27272a;">
          <button id="close-settings-btn" style="
            width: 100%;
            padding: 10px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 6px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Close</button>
        </div>
      </div>
    `);

    // Setup settings modal listeners
    const authBtn = modal.querySelector('#auth-settings-btn');
    const apiKeyBtn = modal.querySelector('#api-key-settings-btn');
    const closeBtn = modal.querySelector('#close-settings-btn');

    authBtn?.addEventListener('click', () => {
      this.modalManager.closeModal();
      this.modalManager.showAuthenticationModal();
    });

    apiKeyBtn?.addEventListener('click', () => {
      this.modalManager.closeModal();
      this.modalManager.showApiKeyModal();
    });

    closeBtn?.addEventListener('click', () => {
      this.modalManager.closeModal();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.modalManager.closeModal();
      }
    });
  }

  async renderInitialContent() {
    console.log('🎭 UIManager: Rendering initial content...');
    // Delegate to ChatManager which handles authentication state
    if (this.chatManager && typeof this.chatManager.renderInitialContent === 'function') {
      console.log('🎭 UIManager: Calling chatManager.renderInitialContent()');
      await this.chatManager.renderInitialContent();
    } else {
      console.log('🎭 UIManager: Fallback to renderWelcomeMessage');
      // Fallback to welcome message if method doesn't exist
      this.chatManager.renderWelcomeMessage();
    }
  }

  showSidebar() {
    this.sidebarManager.showSidebar();
  }

  closeSidebar() {
    this.sidebarManager.closeSidebar();
  }

  toggleSidebar() {
    this.sidebarManager.toggleSidebar();
  }

  getSidebar() {
    return this.sidebarManager.getSidebar();
  }

  getIsVisible() {
    return this.sidebarManager.getIsVisible();
  }

  showNotification(message, type = 'info') {
    this.modalManager.showNotification(message, type);
  }

  // Workflow-related methods
  async injectWorkflowFromMessage(messageId) {
    await this.workflowManager.injectWorkflowFromMessage(messageId);
  }

  showTextCopyModal(text) {
    this.workflowManager.showTextCopyModal(text);
  }

  // Chat-related methods
  startNewChat() {
    this.chatManager.startNewChat();
  }

  async sendMessage() {
    await this.chatManager.sendMessage();
  }

  clearMessages() {
    this.chatManager.clearMessages();
  }

  renderMessages(messages) {
    this.chatManager.renderMessages(messages);
  }

  renderMessage(message) {
    return this.chatManager.renderMessage(message);
  }

  // Modal-related methods
  async showAuthenticationModal() {
    await this.modalManager.showAuthenticationModal();
  }

  async showApiKeyModal() {
    await this.modalManager.showApiKeyModal();
  }

  showUserAccountModal(user) {
    this.modalManager.showUserAccountModal(user);
  }

  showSignInModal() {
    this.modalManager.showSignInModal();
  }

  showSignUpModal() {
    this.modalManager.showSignUpModal();
  }

  // Utility methods
  highlightProfileIcon() {
    this.modalManager.highlightProfileIcon();
  }

  cleanupHighlights() {
    this.modalManager.cleanupHighlights();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}

// Expose globally for browser extension
window.UIManager = UIManager;