// UIManager.js - Handles all UI creation and management
// Depends on: Utils

class UIManager {
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
      background: rgba(15, 15, 15, 0.95);
      border-left: 1px solid #2a2a2a;
      backdrop-filter: blur(20px);
      z-index: 999999;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      display: none;
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
        background: linear-gradient(145deg, #1f1f1f 0%, #2a2a2a 100%);
        color: #ffffff;
      ">
        <!-- Header with HAMBURGER icon -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #2a2a2a;
          border-bottom: 1px solid #404040;
          min-height: 60px;
        ">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="color: #ffffff;">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>n9n</span>
          </div>
        </div>
        
        <!-- Chat Controls Section -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          background: #252525;
          border-bottom: 1px solid #404040;
          min-height: 18px;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- Current Conversation Pill -->
            <div id="current-convo-pill" style="
              display: none;
              align-items: center;
              gap: 6px;
              background: #404040;
              border: 1px solid #555555;
              border-radius: 12px;
              padding: 4px 8px;
              font-size: 11px;
              color: #d1d5db;
              max-width: 180px;
            ">
              <span id="convo-title" style="
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
              ">Current Chat</span>
              <button id="close-convo-btn" style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 14px;
                height: 14px;
                background: none;
                border: none;
                color: #a0a0a0;
                cursor: pointer;
                border-radius: 2px;
                transition: all 0.2s ease;
              " title="Close Current Chat">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <button id="new-chat-btn" style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              background: none;
              border: none;
              color: #a0a0a0;
              cursor: pointer;
              border-radius: 4px;
              transition: all 0.2s ease;
            " title="New Chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
          <button id="settings-btn" style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            background: none;
            border: none;
            color: #a0a0a0;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.2s ease;
          " title="Open n9n Web App">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
        
        <!-- Messages Container -->
        <div id="messages-container" style="
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #1f1f1f;
        "></div>
        
        <!-- Input Area -->
        <div style="
          border-top: 1px solid #404040;
          background: #2a2a2a;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
          ">
            <input 
              id="chat-input"
              type="text"
              placeholder="Describe the workflow you want to build..."
              maxlength="500"
              style="
                flex: 1;
                background: #404040;
                border: 1px solid #555555;
                border-radius: 8px;
                padding: 8px 12px;
                color: #ffffff;
                font-size: 13px;
                line-height: 1.4;
                outline: none;
                transition: all 0.2s;
                font-family: inherit;
                height: 32px;
              "
            >
            <button id="send-btn" disabled style="
              background: #000000;
              border: none;
              border-radius: 8px;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
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
          
          <!-- Suggestions -->         
          <div style="
            display: flex;
            gap: 4px;
            padding: 0 16px 6px;
            flex-wrap: nowrap;
            overflow-x: auto;
          ">
            <button class="suggestion-btn" data-text="Create a workflow that sends daily email reports" style="
              background: #404040;
              border: 1px solid #555555;
              border-radius: 10px;
              padding: 3px 7px;
              color: #a0a0a0;
              font-size: 9px;
              cursor: pointer;
              transition: all 0.2s;
              white-space: nowrap;
              flex-shrink: 0;
            ">📊 Daily email reports</button>
            <button class="suggestion-btn" data-text="Build a workflow to sync data between Google Sheets and Airtable" style="
              background: #404040;
              border: 1px solid #555555;
              border-radius: 10px;
              padding: 3px 7px;
              color: #a0a0a0;
              font-size: 9px;
              cursor: pointer;
              transition: all 0.2s;
              white-space: nowrap;
              flex-shrink: 0;
            ">🔄 Sync Google Sheets ↔ Airtable</button>
          </div>
          
          <!-- AI Model Selector -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px 12px;
            border-top: 1px solid #404040;
            background: #2a2a2a;
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 10px;
              color: #a0a0a0;
            ">
              <span>✓ Read, Edit, Browser, Model</span>
            </div>
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <select id="model-selector" style="
                background: #404040;
                border: 1px solid #555555;
                border-radius: 4px;
                padding: 2px 6px;
                color: #ffffff;
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
    // Add extra scrollbar hiding styles
    const scrollbarStyles = document.createElement('style');
    scrollbarStyles.id = 'n9n-scrollbar-hide';
    scrollbarStyles.textContent = `
      #chat-input::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      #messages-container::-webkit-scrollbar {
        width: 6px;
      }
      
      #messages-container::-webkit-scrollbar-track {
        background: transparent;
      }
      
      #messages-container::-webkit-scrollbar-thumb {
        background: #404040;
        border-radius: 3px;
      }
    `;
    document.head.appendChild(scrollbarStyles);
  }

  addToggleButton() {
    // Remove existing
    const existing = document.getElementById('n9n-copilot-toggle');
    if (existing) existing.remove();

    const toggleButton = document.createElement('button');
    toggleButton.id = 'n9n-copilot-toggle';
    toggleButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round"/>
      </svg>
    `;
    
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: #2a2a2a;
      border: 1px solid #404040;
      border-radius: 12px;
      color: #a0a0a0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999998;
      transition: all 0.2s ease;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    `;
    
    this.setupToggleButtonEvents(toggleButton);
    
    document.body.appendChild(toggleButton);
    return toggleButton;
  }

  setupToggleButtonEvents(toggleButton) {
    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.background = '#404040';
      toggleButton.style.color = '#ffffff';
      toggleButton.style.transform = 'translateY(-2px)';
      toggleButton.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.4)';
    });
    
    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.background = '#2a2a2a';
      toggleButton.style.color = '#a0a0a0';
      toggleButton.style.transform = 'translateY(0)';
      toggleButton.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
    });
  }

  toggleSidebar() {
    if (!this.sidebar) return;

    this.isVisible = !this.isVisible;
    
    if (this.isVisible) {
      this.sidebar.style.display = 'flex';
      setTimeout(() => {
        this.sidebar.style.transform = 'translateX(0)';
      }, 10);
    } else {
      this.sidebar.style.transform = 'translateX(100%)';
      setTimeout(() => {
        this.sidebar.style.display = 'none';
      }, 300);
    }

    // Update button position
    const toggleBtn = document.getElementById('n9n-copilot-toggle');
    if (toggleBtn) {
      toggleBtn.style.right = this.isVisible ? '380px' : '20px';
    }
  }

  renderMessage(message) {
    const isUser = message.role === 'user';
    const timeAgo = Utils.getTimeAgo(message.timestamp);
    
    // Get user avatar (profile pic or first initial)
    const userAvatar = Utils.getUserAvatar();
    
    return `
      <div style="
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
      ">
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${isUser ? '#404040' : '#2a2a2a'};
          border: ${isUser ? 'none' : '1px solid #555555'};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: ${isUser ? '12px' : '14px'};
          font-weight: 600;
          color: ${isUser ? '#ffffff' : '#3ecf8e'};
        ">
          ${isUser ? userAvatar : 'AI'}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="
            color: #ffffff;
            font-size: 13px;
            line-height: 1.4;
            margin-bottom: 3px;
          ">${Utils.formatContent(message.content)}</div>
          <div style="
            color: #a0a0a0;
            font-size: 11px;
            margin-bottom: 6px;
          ">${timeAgo}</div>
          ${!isUser && message.content.includes('```json') ? `
            <div style="display: flex; gap: 6px; align-items: center;">
              <button class="copy-workflow-btn" data-message-id="${message.id}" style="
                background: #404040;
                border: 1px solid #555555;
                border-radius: 5px;
                padding: 5px 10px;
                color: #a0a0a0;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 4px;
              ">📋 Copy</button>
              <button class="inject-workflow-btn" data-message-id="${message.id}" style="
                background: #404040;
                border: 1px solid #555555;
                border-radius: 5px;
                padding: 5px 10px;
                color: #a0a0a0;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 4px;
              ">⚡ Inject</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderRecentConversationsView(conversations) {
    if (conversations.length > 0) {
      return `
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 12px 16px;
        ">
          <div style="
            margin-bottom: 12px;
          ">
            <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #ffffff;">Recent Conversations</h3>
          </div>
          <div style="
            display: flex;
            flex-direction: column;
            gap: 6px;
          ">
            ${conversations.slice(0, 3).map(conv => `
              <div class="conversation-item" data-id="${conv.id}" style="
                padding: 10px 12px;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid #404040;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
              ">
                <div style="font-size: 13px; font-weight: 500; margin-bottom: 3px; color: #ffffff; line-height: 1.3;">
                  ${conv.title}
                </div>
                <div style="font-size: 11px; color: #a0a0a0;">
                  ${Utils.getTimeAgo(conv.timestamp)} • ${conv.messageCount} messages
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      return `
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 24px 16px;
        ">
          <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #ffffff;">Ready to build & modify workflows?</h3>
          <p style="margin: 0; color: #a0a0a0; font-size: 13px; line-height: 1.4;">
            Describe what you want to automate or how to modify existing workflows.
          </p>
        </div>
      `;
    }
  }

  addTypingIndicator() {
    const container = this.sidebar.querySelector('#messages-container');
    if (!container) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div style="
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 10px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.02);
      ">
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
        ">🤖</div>
        <div style="
          display: flex;
          gap: 3px;
          padding: 6px 0;
        ">
          <span style="
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #a0a0a0;
            animation: typing 1.4s infinite ease-in-out;
          "></span>
          <span style="
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #a0a0a0;
            animation: typing 1.4s infinite ease-in-out;
            animation-delay: 0.2s;
          "></span>
          <span style="
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #a0a0a0;
            animation: typing 1.4s infinite ease-in-out;
            animation-delay: 0.4s;
          "></span>
        </div>
      </div>
    `;
    
    // Add animation styles
    if (!document.querySelector('#typing-animation')) {
      const style = document.createElement('style');
      style.id = 'typing-animation';
      style.textContent = `
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = this.sidebar.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
  }

  updateConversationPill(chatManager) {
    const pill = this.sidebar.querySelector('#current-convo-pill');
    const titleSpan = this.sidebar.querySelector('#convo-title');
    
    const title = chatManager.getCurrentConversationTitle();
    if (title) {
      titleSpan.textContent = title;
      pill.style.display = 'flex';
    } else {
      pill.style.display = 'none';
    }
  }

  getSidebar() {
    return this.sidebar;
  }

  getIsVisible() {
    return this.isVisible;
  }
}

// Export for use in other modules
window.UIManager = UIManager;