// SidebarManager.js - Handles sidebar creation and basic UI operations
// Depends on: Utils

class SidebarManager {
  constructor() {
    this.sidebar = null;
    this.isVisible = false;
  }

  createSidebar() {
    // Remove existing
    const existing = document.getElementById('n9n-copilot-sidebar');
    if (existing) existing.remove();

    this.sidebar = document.createElement('div');
    this.sidebar.id = 'n9n-copilot-sidebar';
    this.sidebar.style.cssText = `
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

    this.sidebar.innerHTML = this.getSidebarHTML();
    this.addScrollbarStyles();

    document.body.appendChild(this.sidebar);
    return this.sidebar;
  }

  getSidebarHTML() {
    return `
      <div style="
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #09090b;
        color: #fafafa;
      ">
        <!-- Header with icons -->
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
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="new-chat-btn" style="
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
            " title="New Chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button id="settings-btn" style="
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
            " title="Settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            <button id="header-close-btn" style="
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
            " title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Main content area -->
        <div id="messages-container" style="
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          background: #09090b;
          color: #fafafa;
        ">
          <!-- Content will be dynamically inserted here -->
        </div>

        <!-- Input area -->
        <div style="
          padding: 8px 16px;
          background: #09090b;
          border-top: 1px solid #27272a;
        ">
          <div style="
            display: flex;
            gap: 8px;
            align-items: center;
          ">
            <input 
              id="chat-input"
              type="text"
              placeholder="How can I help you?"
              maxlength="500"
              style="
                flex: 1;
                background: #27272a;
                border: 1px solid #3f3f46;
                border-radius: 8px;
                padding: 8px 12px;
                color: #fafafa;
                font-size: 13px;
                line-height: 1.4;
                outline: none;
                transition: all 0.2s;
                font-family: inherit;
                height: 32px;
              "
            >
            <button id="send-btn" style="
              background: none;
              border: none;
              border-radius: 8px;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fafafa;
              cursor: pointer;
              transition: all 0.2s;
              flex-shrink: 0;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <!-- AI Model Selector -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px 10px;
            background: #09090b;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 10px;
              color: #a1a1aa;
            ">
              <span>✓ Read, Edit, Browser, Model</span>
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <select id="model-selector" style="
                background: #09090b;
                border: 1px solid #3f3f46;
                border-radius: 4px;
                padding: 2px 6px;
                color: #fafafa;
                font-size: 10px;
                cursor: pointer;
                outline: none;
              ">
                <option value="claude-4-sonnet">Claude 4 Sonnet</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gpt-4">GPT-4</option>
              </select>
              <span style="
                font-size: 10px;
                color: #3ecf8e;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                <span style="
                  width: 4px;
                  height: 4px;
                  border-radius: 50%;
                  background: #3ecf8e;
                "></span>
                Available
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  addScrollbarStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #n9n-copilot-sidebar ::-webkit-scrollbar {
        width: 6px;
      }
      #n9n-copilot-sidebar ::-webkit-scrollbar-track {
        background: #18181b;
      }
      #n9n-copilot-sidebar ::-webkit-scrollbar-thumb {
        background: #27272a;
        border-radius: 3px;
      }
      #n9n-copilot-sidebar ::-webkit-scrollbar-thumb:hover {
        background: #3f3f46;
      }
    `;
    document.head.appendChild(style);
  }

  addToggleButton() {
    const existingButton = document.getElementById('n9n-copilot-toggle');
    if (existingButton) return existingButton;

    const toggleButton = document.createElement('button');
    toggleButton.id = 'n9n-copilot-toggle';
    toggleButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: #3b82f6;
      border: none;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: all 0.2s ease;
      font-size: 20px;
    `;
    toggleButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `;

    document.body.appendChild(toggleButton);
    return toggleButton;
  }

  setupToggleButtonEvents(toggleButton) {
    toggleButton.addEventListener('click', () => {
      this.toggleSidebar();
    });

    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.transform = 'scale(1.05)';
      toggleButton.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
    });

    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.transform = 'scale(1)';
      toggleButton.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
    });
  }

  toggleSidebar() {
    if (!this.sidebar) {
      this.createSidebar();
    }

    if (this.isVisible) {
      this.closeSidebar();
    } else {
      this.showSidebar();
    }
  }

  showSidebar() {
    console.log('👀 Showing sidebar...');
    if (!this.sidebar) {
      console.error('❌ No sidebar to show!');
      return;
    }
    
    this.sidebar.style.display = 'flex';
    setTimeout(() => {
      this.sidebar.style.transform = 'translateX(0)';
      console.log('✅ Sidebar transform applied');
    }, 10);
    this.isVisible = true;
    console.log('✅ Sidebar is now visible');
  }

  closeSidebar() {
    if (!this.sidebar) return;
    
    this.sidebar.style.transform = 'translateX(100%)';
    setTimeout(() => {
      this.sidebar.style.display = 'none';
    }, 300);
    this.isVisible = false;
  }

  getSidebar() {
    return this.sidebar;
  }

  getIsVisible() {
    return this.isVisible;
  }

  getContentArea() {
    return this.sidebar?.querySelector('#messages-container');
  }

  clearContent() {
    const contentArea = this.getContentArea();
    if (contentArea) {
      contentArea.innerHTML = '';
    }
  }

  setContent(html) {
    const contentArea = this.getContentArea();
    if (contentArea) {
      contentArea.innerHTML = html;
    }
  }

  appendContent(html) {
    const contentArea = this.getContentArea();
    if (contentArea) {
      contentArea.insertAdjacentHTML('beforeend', html);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SidebarManager;
}

// Expose globally for browser extension
window.SidebarManager = SidebarManager; 