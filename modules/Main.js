// Main.js - Entry point that coordinates all managers
// Depends on: UIManager, AuthManager, ChatService, WorkflowDetector

class Main {
  constructor() {
    this.uiManager = null;
    this.authManager = null;
    this.chatService = null;
    this.workflowDetector = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('Initializing n9n Copilot...');

      // Initialize managers in order
      await this.initializeAuthManager();
      await this.initializeChatService();
      await this.initializeWorkflowDetector();
      await this.initializeUIManager();

      // Setup global event listeners
      this.setupGlobalListeners();

      this.isInitialized = true;
      console.log('n9n Copilot initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize n9n Copilot:', error);
    }
  }

  async initializeAuthManager() {
    try {
      // Initialize AuthManager if it exists
      if (typeof AuthManager !== 'undefined') {
        this.authManager = new AuthManager();
        window.authManager = this.authManager;
        console.log('AuthManager initialized');
      }
    } catch (error) {
      console.error('Failed to initialize AuthManager:', error);
    }
  }

  async initializeChatService() {
    try {
      // Initialize ChatService if it exists
      if (typeof ChatService !== 'undefined') {
        this.chatService = new ChatService();
        window.chatService = this.chatService;
        console.log('ChatService initialized');
      }
    } catch (error) {
      console.error('Failed to initialize ChatService:', error);
    }
  }

  async initializeWorkflowDetector() {
    try {
      // Initialize WorkflowDetector if it exists
      if (typeof WorkflowDetector !== 'undefined') {
        this.workflowDetector = new WorkflowDetector();
        window.workflowDetector = this.workflowDetector;
        console.log('WorkflowDetector initialized');
      }
    } catch (error) {
      console.error('Failed to initialize WorkflowDetector:', error);
    }
  }

  async initializeUIManager() {
    try {
      // Initialize UIManager
      this.uiManager = new UIManager();
      window.uiManager = this.uiManager;
      console.log('UIManager initialized');
      
      // Create and show the sidebar
      this.uiManager.createSidebar();
    } catch (error) {
      console.error('Failed to initialize UIManager:', error);
    }
  }

  setupGlobalListeners() {
    // Listen for messages from other parts of the extension
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;

      const { type, data } = event.data;

      switch (type) {
        case 'SHOW_SIDEBAR':
          this.uiManager?.showSidebar();
          break;
        case 'HIDE_SIDEBAR':
          this.uiManager?.closeSidebar();
          break;
        case 'TOGGLE_SIDEBAR':
          this.uiManager?.toggleSidebar();
          break;
        case 'SHOW_NOTIFICATION':
          this.uiManager?.showNotification(data.message, data.type);
          break;
        case 'SHOW_AUTH_MODAL':
          this.uiManager?.showAuthenticationModal();
          break;
        case 'SHOW_API_KEY_MODAL':
          this.uiManager?.showApiKeyModal();
          break;
        case 'INJECT_WORKFLOW':
          this.uiManager?.injectWorkflowFromMessage(data.messageId);
          break;
        default:
          console.log('Unknown message type:', type);
      }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + C to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.uiManager?.toggleSidebar();
      }
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, refresh if needed
        this.handlePageVisibilityChange();
      }
    });
  }

  handlePageVisibilityChange() {
    // Refresh workflow detection when page becomes visible
    if (this.workflowDetector) {
      this.workflowDetector.refreshWorkflows().catch(error => {
        console.error('Failed to refresh workflows on visibility change:', error);
      });
    }
  }

  // Public API methods
  showSidebar() {
    this.uiManager?.showSidebar();
  }

  hideSidebar() {
    this.uiManager?.closeSidebar();
  }

  toggleSidebar() {
    this.uiManager?.toggleSidebar();
  }

  showNotification(message, type = 'info') {
    this.uiManager?.showNotification(message, type);
  }

  async showAuthenticationModal() {
    await this.uiManager?.showAuthenticationModal();
  }

  async showApiKeyModal() {
    await this.uiManager?.showApiKeyModal();
  }

  async injectWorkflowFromMessage(messageId) {
    await this.uiManager?.injectWorkflowFromMessage(messageId);
  }

  // Cleanup method
  destroy() {
    // Clean up event listeners and resources
    this.uiManager?.cleanupHighlights();
    this.isInitialized = false;
    console.log('n9n Copilot destroyed');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.n9nCopilot = new Main();
    window.n9nCopilot.initialize();
  });
} else {
  // DOM is already ready
  window.n9nCopilot = new Main();
  window.n9nCopilot.initialize();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Main;
}

// Expose globally for browser extension
window.Main = Main; 