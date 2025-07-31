// ============================================================================
// Simple main copilot class
// ============================================================================
class N9NCopilot {
  constructor() {
    this.isN8NPage = this.detectN8NPage();
    this.sidebar = null;
    this.isVisible = false;
    this.uiManager = null;
    
    // Assign to global scope immediately so ChatPanel can access it
    window.n9nCopilot = this;
    
    if (this.isN8NPage) {
      this.init();
    }
  }

  detectN8NPage() {
    const url = window.location.href;
    
    // Check for n8n cloud
    if (url.includes('n8n.cloud')) return true;
    
    // Check for your specific n8n server
    if (url.includes('100.78.164.43')) return true;
    
    // For localhost, be more specific - check for n8n indicators
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      // Only return true if we can find n8n-specific elements or paths
      return document.querySelector('[data-test-id="workflow-canvas"]') !== null ||
             document.querySelector('#n8n-root') !== null ||
             document.title.toLowerCase().includes('n8n') ||
             url.includes('/workflow') ||
             url.includes('/executions') ||
             url.includes('/credentials');
    }
    
    return false;
  }

  async init() {
    this.isN8NPage = this.detectN8NPage();
    
    if (this.isN8NPage) {
      console.log('🚀 Initializing n9n copilot on n8n page...');
      
      // Wait for Main to be available
      if (!window.Main) {
        console.warn('⚠️ Main not available, retrying...');
        setTimeout(() => this.init(), 1000);
        return;
      }
      
      // Initialize the main application
      try {
        if (!window.n9nCopilot || !window.n9nCopilot.uiManager) {
          window.n9nCopilot = new window.Main();
          await window.n9nCopilot.initialize();
        }
        
        this.uiManager = window.n9nCopilot.uiManager;
        
        await this.createSidebar();
        
        // Add fallback to ensure welcome message is shown
        setTimeout(() => {
          const messagesContainer = document.querySelector('#messages-container');
          if (messagesContainer && messagesContainer.innerHTML.trim() === '') {
            console.log('🔧 Messages container empty, forcing welcome message...');
            if (window.chatManager && window.chatManager.renderWelcomeMessage) {
              window.chatManager.renderWelcomeMessage();
            } else {
              console.error('❌ ChatManager not available for fallback');
            }
          }
        }, 2000);
      } catch (error) {
        console.error('❌ Error initializing main application:', error);
        // Still try to create sidebar with fallback content
        this.createFallbackSidebar();
      }
      this.setupMessageListener();
      this.setupKeyboardShortcuts();
      
      // Initialize workflow detector
      this.initializeWorkflowDetector();
      
      // Check if sidebar should auto-open
      const shouldAutoOpen = localStorage.getItem('n9n_sidebar_was_open') === 'true' || 
                           localStorage.getItem('n9n_auto_open_sidebar') === 'true';
      
      if (shouldAutoOpen) {
        setTimeout(() => {
          this.toggleSidebar();
          // Clean up the flags
          localStorage.removeItem('n9n_auto_open_sidebar');
          localStorage.removeItem('n9n_sidebar_was_open');
        }, 500);
      }
      
      // Check if there's a workflow to inject (from redirect method)
      this.checkForWorkflowToInject();
      
      console.log('✅ n9n copilot initialization complete');
    } else {
      console.log('Not an n8n page, skipping copilot initialization');
    }
  }

  initializeWorkflowDetector() {
    try {
      console.log('🔍 Initializing WorkflowDetector...');
      
      // Wait for WorkflowDetector to be available
      const initDetector = () => {
        if (window.WorkflowDetector) {
          window.workflowDetector = new window.WorkflowDetector();
          window.workflowDetector.initialize();
          console.log('✅ WorkflowDetector initialized');
        } else {
          console.warn('⚠️ WorkflowDetector not available, retrying...');
          setTimeout(initDetector, 1000);
        }
      };
      
      // Start initialization after a delay to ensure all modules are loaded
      setTimeout(initDetector, 2000);
      
    } catch (error) {
      console.error('💥 Error initializing WorkflowDetector:', error);
    }
  }

  checkForWorkflowToInject() {
    try {
      const workflowToInject = localStorage.getItem('n9n_workflow_to_inject');
      if (workflowToInject) {
        console.log('📥 Found workflow to inject, processing...');
        localStorage.removeItem('n9n_workflow_to_inject');
        
        // Process workflow injection after a delay to ensure n8n is ready
        setTimeout(() => {
          this.injectWorkflow(JSON.parse(workflowToInject));
        }, 2000);
      }
    } catch (error) {
      console.error('💥 Error checking for workflow to inject:', error);
    }
  }

  async injectWorkflow(workflowData) {
    try {
      console.log('🚀 Injecting workflow:', workflowData.name);
      
      // Try to inject via n8n's API if available
      if (window.n8n && window.n8n.importWorkflow) {
        await window.n8n.importWorkflow(workflowData);
        console.log('✅ Workflow injected via n8n API');
      } else {
        // Fallback: try to fill the workflow data manually
        console.log('⚠️ n8n API not available, attempting manual injection...');
        this.manualWorkflowInjection(workflowData);
      }
    } catch (error) {
      console.error('💥 Error injecting workflow:', error);
    }
  }

  manualWorkflowInjection(workflowData) {
    // This is a fallback method for when n8n API is not available
    console.log('🔧 Attempting manual workflow injection...');
    
    // Try to find and fill workflow name input
    const nameInput = document.querySelector('[data-test-id="workflow-name-input"], input[placeholder*="workflow name"], input[placeholder*="Workflow name"]');
    if (nameInput) {
      nameInput.value = workflowData.name;
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log('✅ Set workflow name:', workflowData.name);
    }
    
    // Show success message
    if (window.uiManager) {
      window.uiManager.showMessage(`Workflow "${workflowData.name}" data prepared. You may need to manually import the JSON.`, 'info');
    }
  }

  async createSidebar() {
    this.createToggleButton();
    this.overlay = document.createElement('div');
    this.overlay.id = 'n9n-drawer-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      z-index: 999998;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      pointer-events: none;
    `;
    document.body.appendChild(this.overlay);

    // Get sidebar from the initialized uiManager
    if (this.uiManager) {
      this.sidebar = this.uiManager.getSidebar();
    }
  }

  createFallbackSidebar() {
    console.log('🎲 Creating fallback sidebar...');
    
    // Create toggle button
    this.createToggleButton();
    
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'n9n-drawer-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      z-index: 999998;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      pointer-events: none;
    `;
    document.body.appendChild(this.overlay);
    
    // Create basic sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'n9n-copilot-sidebar';
    sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 360px;
      height: 100vh;
      background: rgba(9, 9, 11, 0.95);
      border-left: 1px solid #27272a;
      backdrop-filter: blur(20px);
      z-index: 999999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    sidebar.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #09090b;
        color: #fafafa;
      ">
        <!-- Header -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #09090b;
          border-bottom: 1px solid #27272a;
          min-height: 60px;
        ">
          <div style="display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="color: #fafafa;">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span style="color: #fafafa;">n9n</span>
          </div>
          <button onclick="document.getElementById('n9n-copilot-sidebar').style.transform = 'translateX(100%)'" style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #a1a1aa;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div id="messages-container" style="
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          background: #09090b;
          color: #fafafa;
          padding: 20px;
        ">
          <div style="
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          ">
            <div style="
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #3b82f6, #8b5cf6);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 24px;
            ">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
              </svg>
            </div>
            
            <h2 style="
              margin: 0 0 12px;
              color: #fafafa;
              font-size: 24px;
              font-weight: 700;
            ">Welcome to n9n Copilot</h2>
            
            <p style="
              margin: 0 0 32px;
              color: #a1a1aa;
              font-size: 16px;
              line-height: 1.5;
              max-width: 280px;
            ">Failed to initialize. Please refresh the page and try again.</p>
            
            <button onclick="location.reload()" style="
              padding: 12px 16px;
              background: #3b82f6;
              border: 1px solid #60a5fa;
              border-radius: 8px;
              color: white;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;
            ">Refresh Page</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(sidebar);
    this.sidebar = sidebar;
    
    // Create basic UIManager-like object
    this.uiManager = {
      toggleSidebar: () => {
        if (this.sidebar.style.transform === 'translateX(0px)') {
          this.sidebar.style.transform = 'translateX(100%)';
          this.isVisible = false;
        } else {
          this.sidebar.style.transform = 'translateX(0)';
          this.isVisible = true;
        }
      },
      getIsVisible: () => this.isVisible
    };
  }

  createToggleButton() {
    
    // Remove existing toggle if any
    const existingToggle = document.getElementById('n9n-copilot-toggle');
    if (existingToggle) {
      existingToggle.remove();
    }
    
    const toggleButton = document.createElement('button');
    toggleButton.id = 'n9n-copilot-toggle';
    toggleButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `;
    
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;
    
    // Hover effects
    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.transform = 'translateY(-2px)';
      toggleButton.style.boxShadow = '-8px 0 30px rgba(0, 0, 0, 0.4)';
      toggleButton.style.background = '#2a2a2a';
    });
    
    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.transform = 'translateY(0)';
      toggleButton.style.boxShadow = '-4px 0 20px rgba(0, 0, 0, 0.3)';
      toggleButton.style.background = '#1a1a1a';
    });
    
    // Click handler
    toggleButton.addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    document.body.appendChild(toggleButton);
  }

    checkForWorkflowToInject() {
    const workflowToInject = localStorage.getItem('n9n_workflow_to_inject');
    if (workflowToInject) {
      try {
        const workflowData = JSON.parse(workflowToInject);
        console.log('Found workflow to inject on page load:', workflowData);
        
        // Clear the stored data
        localStorage.removeItem('n9n_workflow_to_inject');
        
        // Wait a bit for the page to load, then show notification
        setTimeout(() => {
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a1a1a;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            border: 1px solid #404040;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          `;
          notification.textContent = '✅ Workflow ready! Click "Import from URL" in n8n to paste it.';
          document.body.appendChild(notification);
          
          // Copy workflow to clipboard
          navigator.clipboard.writeText(JSON.stringify(workflowData, null, 2));
          
          setTimeout(() => notification.remove(), 5000);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to parse stored workflow data:', error);
        localStorage.removeItem('n9n_workflow_to_inject');
      }
    }
  }

  toggleSidebar() {
    if (!this.uiManager) {
      return;
    }

    this.uiManager.toggleSidebar();
    this.isVisible = this.uiManager.getIsVisible();
    console.log('✅ Sidebar visibility:', this.isVisible);
    
    // Show/hide overlay
    if (this.overlay) {
      if (this.isVisible) {
        this.overlay.style.visibility = 'visible';
        this.overlay.style.opacity = '1';
      } else {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
          if (this.overlay) this.overlay.style.visibility = 'hidden';
        }, 300);
      }
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'K') {
        event.preventDefault();
        this.toggleSidebar();
      }

      if (event.key === 'Escape' && this.isVisible) {
        this.toggleSidebar();
      }
    });
  }

  setupMessageListener() {
    try {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
          switch (message.type) {
            case 'TOGGLE_COPILOT':
              this.toggleSidebar();
              sendResponse({ success: true });
              break;
            case 'GET_PAGE_INFO':
              sendResponse({
                isN8NPage: this.isN8NPage,
                isVisible: this.isVisible,
                url: window.location.href
              });
              break;
            case 'PING':
              sendResponse({ pong: true });
              break;
            default:
              sendResponse({ error: 'Unknown message type' });
          }
        } catch (error) {
          console.error('Message handling error:', error);
          sendResponse({ error: error.message });
        }
        return true;
      });
    } catch (error) {
      console.error('Failed to setup message listener:', error);
    }
  }
}

// Initialize copilot
console.log('🔥 Loading n9n copilot...');
const copilot = new N9NCopilot();

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    copilot.init();
  });
} else {
  copilot.init();
}