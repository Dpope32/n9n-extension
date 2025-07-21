// ============================================================================
// Simple main copilot class
// ============================================================================
class N9NCopilot {
  constructor() {
    this.isN8NPage = this.detectN8NPage();
    this.sidebar = null;
    this.isVisible = false;
    
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
      await this.createSidebar();
      this.setupMessageListener();
      this.setupKeyboardShortcuts();
      
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
    } else {
      console.log('Not an n8n page, skipping copilot initialization');
    }
  }

  async createSidebar() {
    // Remove existing sidebar if any
    const existingSidebar = document.getElementById('n9n-copilot-sidebar');
    if (existingSidebar) {
      existingSidebar.remove();
    }

    // Remove existing toggle if any
    const existingToggle = document.getElementById('n9n-copilot-toggle');
    if (existingToggle) {
      existingToggle.remove();
    }

    // Create toggle button
    this.createToggleButton();

    // Create sidebar container - RIGHT SIDE DRAWER (FULL HEIGHT)
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'n9n-copilot-sidebar';
    this.sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 350px;
      height: 100vh;
      background: #1a1a1a;
      border-left: 1px solid #2a2a2a;
      z-index: 999999;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      overflow: hidden;
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
    `;

    document.body.appendChild(this.sidebar);

    // Create subtle overlay for when drawer is open (optional)
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

    // Initialize chat panel
    this.chatPanel = new window.ChatPanel(this.sidebar);
  }

  createToggleButton() {
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
    if (!this.sidebar) return;

    this.isVisible = !this.isVisible;
    
    // Animate sidebar slide
    this.sidebar.style.transform = this.isVisible ? 'translateX(0%)' : 'translateX(100%)';
    
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

// Initialize
const copilot = new N9NCopilot();
window.n9nCopilot = copilot;

console.log('n9n AI Copilot loaded successfully');
