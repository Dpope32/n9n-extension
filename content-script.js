// n9n AI Copilot - Restored Working Version
// Full-height sidebar with hamburger icon and recent chats

class N9NCopilot {
  constructor() {
    this.isN8NPage = false;
    this.sidebar = null;
    this.isInitialized = false;
    this.isVisible = false;
    this.messages = JSON.parse(localStorage.getItem('n9n_chat_messages') || '[]');
    
    this.init();
  }

  async init() {
    this.isN8NPage = this.detectN8NPage();
    
    if (this.isN8NPage) {
      await this.initializeCopilot();
      this.setupMessageListener();
      
      // Auto-open sidebar if this is a new workflow page (especially AI-generated ones)
      if (window.location.href.includes('/workflow/') && !this.isVisible) {
        // Check if this might be an AI-generated workflow
        if (document.title.includes('AI Generated') || 
            window.location.href.includes('new') ||
            localStorage.getItem('n9n_auto_open_sidebar') === 'true') {
          console.log('🤖 Auto-opening sidebar for new/AI workflow page');
          setTimeout(() => {
            this.toggleSidebar();
            localStorage.removeItem('n9n_auto_open_sidebar'); // Clean up
          }, 1000);
        }
      }
      
      // Check if there's a workflow to inject (from redirect method)
      this.checkForWorkflowToInject();
    }
  }

  checkForWorkflowToInject() {
    const workflowToInject = localStorage.getItem('n9n_workflow_to_inject');
    if (workflowToInject) {
      try {
        const workflowData = JSON.parse(workflowToInject);
        console.log('Found workflow to inject on page load:', workflowData);
        
        // Clear the stored data
        localStorage.removeItem('n9n_workflow_to_inject');
        
        // Wait a bit for the page to load, then try to inject
        setTimeout(() => {
          this.attemptAutoInject(workflowData);
        }, 2000);
        
      } catch (error) {
        console.error('Failed to parse stored workflow data:', error);
        localStorage.removeItem('n9n_workflow_to_inject');
      }
    }
  }

  async attemptAutoInject(workflowData) {
    try {
      // Try DOM-based injection on the new workflow page
      const injected = await this.injectViaDOM(workflowData);
      
      if (injected) {
        console.log('Auto-injection successful!');
        this.showNotification('✅ Workflow injected successfully!');
      } else {
        console.log('Auto-injection failed, copying to clipboard');
        const success = await this.copyToClipboard(JSON.stringify(workflowData, null, 2));
        if (success) {
          this.showNotification('⚠️ Auto-inject failed. Workflow copied to clipboard - paste it manually.');
        } else {
          this.showNotification('❌ Auto-injection and clipboard copy both failed.');
        }
      }
      
    } catch (error) {
      console.error('Auto-injection error:', error);
      this.showNotification('❌ Auto-injection failed');
    }
  }

  detectN8NPage() {
    const url = window.location.href;
    const indicators = [
      'n8n.io',
      '/workflow',
      '/executions',
      'n8n',
      () => document.querySelector('[data-test-id="workflow-canvas"]'),
      () => document.querySelector('.workflow-canvas'),
      () => document.querySelector('#n8n-root'),
      () => document.title.toLowerCase().includes('n8n')
    ];

    return indicators.some(indicator => {
      if (typeof indicator === 'string') {
        return url.includes(indicator);
      } else if (typeof indicator === 'function') {
        try {
          return indicator();
        } catch (e) {
          return false;
        }
      }
      return false;
    });
  }

  async initializeCopilot() {
    if (this.isInitialized) return;

    try {
      this.createSidebar();
      this.addToggleButton();
      this.setupKeyboardShortcuts();
      this.isInitialized = true;
      
      console.log('✅ n9n AI Copilot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize n9n AI Copilot:', error);
    }
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
      overflow: hidden;
      box-sizing: border-box;
    `;
    
    // Add the complete chat interface with proper dark theme
    this.sidebar.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
        background: linear-gradient(145deg, #1f1f1f 0%, #2a2a2a 100%);
        color: #ffffff;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      ">
        <!-- Header with HAMBURGER icon -->
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: #2a2a2a;
          border-bottom: 1px solid #404040;
          min-height: 60px;
          flex-shrink: 0;
          box-sizing: border-box;
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
          padding: 8px 12px;
          background: #252525;
          border-bottom: 1px solid #404040;
          min-height: 18px;
          flex-shrink: 0;
          box-sizing: border-box;
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
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #1f1f1f;
          box-sizing: border-box;
          min-height: 0;
        "></div>
        
        <!-- Input Area - SCROLLBAR COMPLETELY REMOVED -->
        <div style="
          border-top: 1px solid #404040;
          background: #2a2a2a;
          flex-shrink: 0;
          box-sizing: border-box;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            box-sizing: border-box;
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
          
          <!-- ENHANCED Suggestions -->         
          <div style="
            display: flex;
            gap: 4px;
            padding: 0 12px 6px;
            flex-wrap: nowrap;
            overflow-x: auto;
            box-sizing: border-box;
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
            padding: 8px 12px 12px;
            border-top: 1px solid #404040;
            background: #2a2a2a;
            box-sizing: border-box;
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
    
    document.body.appendChild(this.sidebar);
    this.setupChatEventListeners();
    this.updateMessages();
  }

  addToggleButton() {
    // Remove existing
    const existing = document.getElementById('n9n-copilot-toggle');
    if (existing) existing.remove();

    const toggleButton = document.createElement('button');
    toggleButton.id = 'n9n-copilot-toggle';
    // HAMBURGER ICON - NOT ROBOT EMOJI
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
    
    toggleButton.addEventListener('click', () => this.toggleSidebar());
    
    document.body.appendChild(toggleButton);
  }

  setupChatEventListeners() {
    const input = this.sidebar.querySelector('#chat-input');
    const sendBtn = this.sidebar.querySelector('#send-btn');
    const suggestions = this.sidebar.querySelectorAll('.suggestion-btn');
    const settingsBtn = this.sidebar.querySelector('#settings-btn');
    const newChatBtn = this.sidebar.querySelector('#new-chat-btn');
    const closeConvoBtn = this.sidebar.querySelector('#close-convo-btn');
    
    // Settings button - opens web app
    settingsBtn.addEventListener('click', () => {
      try {
        window.open('https://pvxfiwdtbukopfjrutzq.supabase.co/dashboard', '_blank');
      } catch (error) {
        window.open('https://pvxfiwdtbukopfjrutzq.supabase.co', '_blank');
      }
    });
    
    // New chat button - starts new conversation
    newChatBtn.addEventListener('click', () => {
      this.startNewConversation();
    });
    
    // Close conversation button - closes current conversation
    if (closeConvoBtn) {
      closeConvoBtn.addEventListener('click', () => {
        this.startNewConversation();
      });
    }
    
    // Button hover effects
    [settingsBtn, newChatBtn, closeConvoBtn].filter(Boolean).forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255, 255, 255, 0.1)';
        btn.style.color = '#ffffff';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'none';
        btn.style.color = '#a0a0a0';
      });
    });
    
    // Input handling - simplified for single line input
    input.addEventListener('input', () => {
      const hasText = input.value.trim();
      sendBtn.disabled = !hasText;
      sendBtn.style.opacity = hasText ? '1' : '0.5';
      sendBtn.style.background = hasText ? '#333333' : '#000000';
    });
    
    // Handle enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Handle send button
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    // Handle suggestions with hover effects
    suggestions.forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.text;
        input.focus();
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
        sendBtn.style.background = '#333333';
        input.dispatchEvent(new Event('input'));
      });
      
      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#555555';
        btn.style.borderColor = '#666666';
        btn.style.color = '#ffffff';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#404040';
        btn.style.borderColor = '#555555';
        btn.style.color = '#a0a0a0';
      });
    });
  }

  async sendMessage() {
    const input = this.sidebar.querySelector('#chat-input');
    const sendBtn = this.sidebar.querySelector('#send-btn');
    const message = input.value.trim();
    
    if (!message) return;

    // Clear input and reset state
    input.value = '';
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
    sendBtn.style.background = '#000000';

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(userMessage);
    this.updateMessages();
    this.updateConversationPill();
    this.addTypingIndicator();

    // Simulate AI response
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage = await this.generateWorkflowResponse(message);
      
      this.messages.push(assistantMessage);
      // CRITICAL: Only store messages, never overwrite API key
        localStorage.setItem('n9n_chat_messages', JSON.stringify(this.messages));
        console.log('💾 Saved', this.messages.length, 'messages to localStorage');
      
      // Save conversation after first exchange
      if (this.messages.length === 2 && !this.currentConversationId) {
        this.currentConversationId = this.saveConversation(userMessage.content);
      } else if (this.currentConversationId) {
        this.updateConversation();
      }
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      this.removeTypingIndicator();
      this.updateMessages();
      this.updateConversationPill();
    }
  }

  updateMessages() {
    const container = this.sidebar.querySelector('#messages-container');
    if (!container) return;
    
    if (this.messages.length === 0) {
      // Show recent conversations or empty state
      const recentConversations = this.getRecentConversations();
      
      if (recentConversations.length > 0) {
        container.innerHTML = `
          <div style="
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 12px;
            box-sizing: border-box;
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
              ${recentConversations.slice(0, 3).map(conv => `
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
                    ${this.getTimeAgo(conv.timestamp)} • ${conv.messageCount} messages
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        
        // Add conversation item click handlers
        container.querySelectorAll('.conversation-item').forEach(item => {
          item.addEventListener('click', () => {
            this.loadConversation(item.dataset.id);
          });
          
          item.addEventListener('mouseenter', () => {
            item.style.background = 'rgba(255, 255, 255, 0.05)';
          });
          
          item.addEventListener('mouseleave', () => {
            item.style.background = 'rgba(255, 255, 255, 0.02)';
          });
        });
        
        // Users can start new conversations using the text input at the bottom
        
      } else {
        // Show empty state for first-time users
        container.innerHTML = `
          <div style="
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px 12px;
            box-sizing: border-box;
          ">
            <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #ffffff;">Ready to build & modify workflows?</h3>
            <p style="margin: 0; color: #a0a0a0; font-size: 13px; line-height: 1.4;">
              Describe what you want to automate or how to modify existing workflows.
            </p>
          </div>
        `;
      }
    } else {
      container.innerHTML = this.messages.map(msg => this.renderMessage(msg)).join('');
      
      // Add event listeners for workflow buttons using event delegation
      this.setupWorkflowButtonListeners(container);
    }
    
    container.scrollTop = container.scrollHeight;
  }

  setupWorkflowButtonListeners(container) {
    // Use event delegation for dynamically created buttons
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('copy-workflow-btn')) {
        e.preventDefault();
        const messageId = e.target.dataset.messageId;
        this.copyWorkflow(messageId);
      } else if (e.target.classList.contains('inject-workflow-btn')) {
        e.preventDefault();
        const messageId = e.target.dataset.messageId;
        this.injectWorkflow(messageId);
      }
    });
    
    // Add hover effects for workflow buttons
    container.addEventListener('mouseenter', (e) => {
      if (e.target.classList.contains('copy-workflow-btn') || e.target.classList.contains('inject-workflow-btn')) {
        e.target.style.background = '#555555';
        e.target.style.borderColor = '#666666';
        e.target.style.color = '#ffffff';
      }
    }, true);
    
    container.addEventListener('mouseleave', (e) => {
      if (e.target.classList.contains('copy-workflow-btn') || e.target.classList.contains('inject-workflow-btn')) {
        e.target.style.background = '#404040';
        e.target.style.borderColor = '#555555';
        e.target.style.color = '#a0a0a0';
      }
    }, true);
  }

  renderMessage(message) {
    const isUser = message.role === 'user';
    const timeAgo = this.getTimeAgo(message.timestamp);
    
    // Get user avatar (profile pic or first initial)
    const userAvatar = this.getUserAvatar();
    
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
          ">${this.formatContent(message.content)}</div>
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

  formatContent(content) {
    return content
      .replace(/```json\n([\s\S]*?)\n```/g, '<pre style="background: #1a1a1a; border: 1px solid #333333; padding: 12px; border-radius: 6px; overflow-x: hidden; font-size: 11px; margin: 8px 0; color: #ffffff; white-space: pre-wrap; word-wrap: break-word;"><code>$1</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  getRecentConversations() {
    const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
    return conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
  }

  saveConversation(title) {
    const conversations = this.getRecentConversations();
    const newConversation = {
      id: Date.now().toString(),
      title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString(),
      messageCount: this.messages.length,
      messages: this.messages
    };
    
    conversations.unshift(newConversation);
    localStorage.setItem('n9n_conversations', JSON.stringify(conversations.slice(0, 20)));
    return newConversation.id;
  }

  loadConversation(conversationId) {
    const conversations = this.getRecentConversations();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      this.messages = conversation.messages || [];
      this.currentConversationId = conversationId;
      this.updateMessages();
    }
  }

  updateConversation() {
    if (!this.currentConversationId) return;
    
    const conversations = this.getRecentConversations();
    const index = conversations.findIndex(c => c.id === this.currentConversationId);
    
    if (index !== -1) {
      conversations[index].messageCount = this.messages.length;
      conversations[index].messages = this.messages;
      conversations[index].timestamp = new Date().toISOString();
      localStorage.setItem('n9n_conversations', JSON.stringify(conversations));
    }
  }

  startNewConversation() {
    this.messages = [];
    this.currentConversationId = null;
    this.updateMessages();
    this.updateConversationPill();
  }

  updateConversationPill() {
    const pill = this.sidebar.querySelector('#current-convo-pill');
    const titleSpan = this.sidebar.querySelector('#convo-title');
    
    if (this.messages.length > 0) {
      const firstUserMessage = this.messages.find(m => m.role === 'user');
      const title = firstUserMessage ? firstUserMessage.content.substring(0, 30) + '...' : 'Current Chat';
      
      titleSpan.textContent = title;
      pill.style.display = 'flex';
    } else {
      pill.style.display = 'none';
    }
  }

  getUserAvatar() {
    // Try to get user profile picture or first initial from email
    const userEmail = localStorage.getItem('n9n_user_email') || 'user@example.com';
    const userPfp = localStorage.getItem('n9n_user_avatar');
    
    if (userPfp && userPfp !== 'null') {
      return `<img src="${userPfp}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="User">`;
    }
    
    // Return first initial of email
    return userEmail.charAt(0).toUpperCase();
  }

  getTimeAgo(timestamp) {
    const diffMins = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  }

  getCurrentModel() {
    const modelSelector = this.sidebar.querySelector('#model-selector');
    return modelSelector ? modelSelector.value : 'claude-4-sonnet';
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

  async copyWorkflow(messageId) {
    try {
      const message = this.messages.find(m => m.id === messageId);
      if (message) {
        const jsonMatch = message.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const success = await this.copyToClipboard(jsonMatch[1]);
          if (success) {
            this.showNotification('✅ Workflow copied to clipboard!');
          } else {
            this.showNotification('❌ Failed to copy workflow');
          }
        }
      }
    } catch (error) {
      this.showNotification('❌ Failed to copy workflow');
    }
  }

  async generateWorkflowResponse(userMessage) {
    // Get selected model from dropdown
    const modelSelector = this.sidebar.querySelector('#model-selector');
    const selectedModel = modelSelector ? modelSelector.value : 'claude-4-sonnet';
    
    // Generate workflow based on user request
    const workflow = this.generateSmartWorkflow(userMessage, selectedModel);
    
    return {
      id: Date.now().toString() + '_ai',
      role: 'assistant',
      content: `I'll help you create that workflow! Here's a custom n8n workflow for: "${userMessage}"

\`\`\`json
${JSON.stringify(workflow, null, 2)}
\`\`\`

**Using:** ${selectedModel} • Click **⚡ Inject into n8n** to add this workflow directly to your n8n instance!`,
      timestamp: new Date().toISOString()
    };
  }

  generateSmartWorkflow(userMessage, selectedModel = 'claude-4-sonnet') {
    const message = userMessage.toLowerCase();
    
    // Generate workflow based on user request
    if (message.includes('print') && message.includes('date')) {
      return this.createDatePrintWorkflow(userMessage, selectedModel);
    } else if (message.includes('email') && message.includes('daily')) {
      return this.createDailyEmailWorkflow(userMessage, selectedModel);
    } else if (message.includes('sync') && (message.includes('sheet') || message.includes('airtable'))) {
      return this.createSyncWorkflow(userMessage, selectedModel);
    } else if (message.includes('webhook')) {
      return this.createWebhookWorkflow(userMessage, selectedModel);
    } else if (message.includes('schedule') || message.includes('cron')) {
      return this.createScheduledWorkflow(userMessage, selectedModel);
    } else {
      return this.createGenericWorkflow(userMessage, selectedModel);
    }
  }

  createDatePrintWorkflow(userMessage, selectedModel) {
    return {
      name: `AI: Print Today's Date`,
      description: `Generated by ${selectedModel} for: "${userMessage}"`,
      nodes: [
        {
          id: "manual-trigger",
          type: "n8n-nodes-base.manualTrigger",
          name: "Manual Trigger",
          position: [200, 300],
          parameters: {}
        },
        {
          id: "get-date",
          type: "n8n-nodes-base.function",
          name: "Get Today's Date",
          position: [400, 300],
          parameters: {
            functionCode: "// Get today's date in a nice format\nconst today = new Date();\nconst options = { \n  year: 'numeric', \n  month: 'long', \n  day: 'numeric',\n  weekday: 'long'\n};\n\nconst formattedDate = today.toLocaleDateString('en-US', options);\n\nreturn [{\n  json: {\n    date: formattedDate,\n    timestamp: today.toISOString(),\n    message: `Today is ${formattedDate}`\n  }\n}];"
          }
        }
      ],
      connections: {
        "Manual Trigger": {
          main: [[{"node": "Get Today's Date", "type": "main", "index": 0}]]
        }
      }
    };
  }

  createSyncWorkflow(userMessage, selectedModel) {
    // Placeholder for sync workflow
    return this.createGenericWorkflow(userMessage, selectedModel);
  }

  createWebhookWorkflow(userMessage, selectedModel) {
    // Placeholder for webhook workflow
    return this.createGenericWorkflow(userMessage, selectedModel);
  }

  createScheduledWorkflow(userMessage, selectedModel) {
    // Placeholder for scheduled workflow
    return this.createGenericWorkflow(userMessage, selectedModel);
  }

  createDailyEmailWorkflow(userMessage, selectedModel) {
    return {
      name: `AI: Daily Email Reports`,
      description: `Generated by ${selectedModel} for: "${userMessage}"`,
      nodes: [
        {
          id: "daily-schedule",
          type: "n8n-nodes-base.cron",
          name: "Daily Schedule",
          position: [200, 300],
          parameters: {
            triggerTimes: {
              item: [
                {
                  hour: 9,
                  minute: 0
                }
              ]
            }
          }
        },
        {
          id: "generate-report",
          type: "n8n-nodes-base.function",
          name: "Generate Report Data",
          position: [400, 300],
          parameters: {
            functionCode: "// Generate daily report data\nconst today = new Date().toLocaleDateString();\nconst reportData = {\n  date: today,\n  summary: 'Daily automated report',\n  metrics: {\n    tasks_completed: Math.floor(Math.random() * 10) + 5,\n    efficiency: Math.floor(Math.random() * 30) + 70\n  }\n};\n\nreturn [{ json: reportData }];"
          }
        },
        {
          id: "send-email",
          type: "n8n-nodes-base.emailSend",
          name: "Send Email Report",
          position: [600, 300],
          parameters: {
            toEmail: "recipient@example.com",
            subject: "Daily Report - {{$json.date}}",
            text: "Daily Summary:\n\nTasks Completed: {{$json.metrics.tasks_completed}}\nEfficiency: {{$json.metrics.efficiency}}%\n\nGenerated on {{$json.date}}"
          }
        }
      ],
      connections: {
        "Daily Schedule": {
          main: [[{"node": "Generate Report Data", "type": "main", "index": 0}]]
        },
        "Generate Report Data": {
          main: [[{"node": "Send Email Report", "type": "main", "index": 0}]]
        }
      }
    };
  }

  createGenericWorkflow(userMessage, selectedModel) {
    return {
      name: `AI: ${userMessage.substring(0, 40)}${userMessage.length > 40 ? '...' : ''}`,
      description: `Generated by ${selectedModel} for: "${userMessage}"`,
      nodes: [
        {
          id: "start-trigger",
          type: "n8n-nodes-base.manualTrigger",
          name: "Start Workflow",
          position: [200, 300]
        },
        {
          id: "process-request",
          type: "n8n-nodes-base.function",
          name: "Process Request",
          position: [400, 300],
          parameters: {
            functionCode: `// Custom workflow for: ${userMessage}\n// Add your automation logic here\n\nreturn [{\n  json: {\n    request: '${userMessage}',\n    processed: true,\n    timestamp: new Date().toISOString()\n  }\n}];`
          }
        }
      ],
      connections: {
        "Start Workflow": {
          main: [[{"node": "Process Request", "type": "main", "index": 0}]]
        }
      }
    };
  }

  async injectWorkflow(messageId) {
    try {
      const message = this.messages.find(m => m.id === messageId);
      if (message) {
        const jsonMatch = message.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          const workflowData = JSON.parse(jsonMatch[1]);
          
          // Show loading state
          this.showNotification('⚡ Injecting workflow into n8n...');
          
          // Try different injection methods
          const injected = await this.tryInjectWorkflow(workflowData);
          
          if (injected) {
            this.showNotification('✅ Workflow successfully injected into n8n!');
          } else {
          this.showNotification('⚠️ Could not auto-inject. Workflow copied to clipboard instead.');
          await this.copyToClipboard(jsonMatch[1]);
          }
        }
      }
    } catch (error) {
      console.error('Inject workflow error:', error);
      this.showNotification('❌ Failed to inject workflow');
    }
  }

  async tryInjectWorkflow(workflowData) {
    try {
      console.log('🔄 Attempting to inject workflow:', workflowData);
      
      // Check if we have API key first
      const apiKey = await this.getN8nApiKey();
      console.log('🔑 API Key available:', apiKey ? 'Yes (' + apiKey.substring(0, 10) + '...)' : 'No');
      
      // Method 1: Try n8n REST API (if we can detect the base URL)
      const n8nBaseUrl = this.detectN8nBaseUrl();
      if (n8nBaseUrl) {
        console.log('🌐 Found n8n base URL, trying API injection...', n8nBaseUrl);
        const apiResult = await this.injectViaAPI(workflowData, n8nBaseUrl);
        if (apiResult) {
          console.log('✅ API injection successful!');
          return true;
        } else {
          console.log('❌ API injection failed, trying other methods...');
        }
      } else {
        console.log('⚠️ Could not detect n8n base URL');
      }
      
      // Method 2: DOM manipulation to trigger import
      const importButton = document.querySelector('[data-test-id="import-workflow-button"]') || 
                          document.querySelector('button[title*="import"]') ||
                          document.querySelector('button[title*="Import"]') ||
                          this.findButtonByText('Import');
      
      if (importButton) {
        console.log('Found import button, trying DOM injection...');
        return await this.injectViaDOM(workflowData, importButton);
      }
      
      // Method 3: Try to redirect to "new workflow" page with data
      const currentUrl = window.location.href;
      if (currentUrl.includes('n8n')) {
        console.log('On n8n page, trying redirect injection...');
        return await this.injectViaRedirect(workflowData);
      }
      
      console.log('No injection method found');
      return false;
      
    } catch (error) {
      console.error('Workflow injection failed:', error);
      return false;
    }
  }

  detectN8nBaseUrl() {
    const currentUrl = window.location.href;
    
    // Extract base URL from current page
    if (currentUrl.includes('n8n.cloud')) {
      return currentUrl.split('/workflow')[0];
    } else if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
      const urlObj = new URL(currentUrl);
      return `${urlObj.protocol}//${urlObj.host}`;
    } else if (currentUrl.match(/\d+\.\d+\.\d+\.\d+/)) {
      // IP address
      const urlObj = new URL(currentUrl);
      return `${urlObj.protocol}//${urlObj.host}`;
    }
    
    return null;
  }

  async injectViaAPI(workflowData, baseUrl) {
    try {
      // Try to create workflow via n8n REST API
      const apiUrl = `${baseUrl}/api/v1/workflows`;
      
      console.log('🔗 Trying API endpoint:', apiUrl);
      
      // Try to get API key from storage or prompt user
      const apiKey = await this.getN8nApiKey();
      console.log('🔑 API Key for request:', apiKey ? 'Available' : 'Missing');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API key if available
      if (apiKey) {
        headers['X-N8N-API-KEY'] = apiKey;
      }
      
      const requestBody = {
        name: workflowData.name || `AI: ${workflowData.description || 'Custom Workflow'}`,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: {
          executionOrder: 'v1'
        }
      };
      
      console.log('📤 Request headers:', headers);
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include', // Include cookies for session auth
        body: JSON.stringify(requestBody)
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Workflow created successfully via API:', result);
        
        // Set flag to auto-open sidebar on the new workflow page
        localStorage.setItem('n9n_auto_open_sidebar', 'true');
        
        // Try to redirect to the new workflow
        if (result.id) {
          console.log('🔀 Redirecting to new workflow:', `${baseUrl}/workflow/${result.id}`);
          window.location.href = `${baseUrl}/workflow/${result.id}`;
        }
        return true;
      } else {
        console.log('❌ API request failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('📋 Error details:', errorText);
        
        // Check for specific error types
        if (response.status === 401) {
          if (!apiKey) {
            console.log('🔑 No API key provided - prompting user');
            this.promptForApiKey();
          } else {
            console.log('🔑 API key invalid or expired');
            this.showNotification('❌ API Key invalid or expired. Please update it.');
          }
        } else if (response.status === 403) {
          console.log('🚫 Permission denied - API key may lack required scopes');
          this.showNotification('❌ Permission denied. Your API key may need additional scopes.');
        } else if (response.status === 404) {
          console.log('🔍 API endpoint not found - wrong URL or n8n version?');
        }
        
        return false;
      }
      
    } catch (error) {
      console.error('API injection failed:', error);
      return false;
    }
  }

  async getN8nApiKey() {
    // Try to get API key from extension storage with corruption detection
    return new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['n8n_api_key'], (result) => {
          if (chrome.runtime.lastError) {
            console.log('🔑 Chrome storage error, falling back to localStorage:', chrome.runtime.lastError);
            const localKey = localStorage.getItem('n8n_api_key');
            console.log('🔑 FALLBACK localStorage key:', localKey ? localKey.substring(0, 50) + '...' : 'NULL');
            resolve(this.validateApiKey(localKey));
          } else {
            const key = result.n8n_api_key;
            console.log('🔑 Retrieved API key from chrome storage:', key ? key.substring(0, 50) + '...' : 'NULL');
            if (key) {
              console.log('🔑 Chrome storage key full length:', key.length);
              console.log('🔑 Chrome storage key type:', typeof key);
              const validatedKey = this.validateApiKey(key);
              if (validatedKey) {
                resolve(validatedKey);
                return;
              }
            }
            const localKey = localStorage.getItem('n8n_api_key');
            console.log('🔑 FALLBACK localStorage key:', localKey ? localKey.substring(0, 50) + '...' : 'NULL');
            if (localKey) {
              console.log('🔑 localStorage key full length:', localKey.length);
              console.log('🔑 localStorage key type:', typeof localKey);
            }
            resolve(this.validateApiKey(localKey));
          }
        });
      } else {
        // Fallback to localStorage
        const key = localStorage.getItem('n8n_api_key');
        console.log('🔑 Retrieved API key from localStorage:', key ? key.substring(0, 50) + '...' : 'NULL');
        if (key) {
          console.log('🔑 localStorage key full length:', key.length);
          console.log('🔑 localStorage key type:', typeof key);
        }
        resolve(this.validateApiKey(key));
      }
    });
  }
  
  validateApiKey(key) {
    // Validate that this is actually an API key, not workflow JSON
    if (!key || typeof key !== 'string') {
      console.log('🔑 No API key found');
      return null;
    }
    
    // Check if it's corrupted with workflow JSON
    if (key.startsWith('{') && key.includes('nodes')) {
      console.error('❌ CORRUPTED API KEY DETECTED! Contains workflow JSON, clearing...');
      this.clearCorruptedApiKey();
      this.showNotification('❌ Corrupted API key detected and cleared. Please enter a new API key.');
      return null;
    }
    
    // Basic API key format validation (n8n API keys are typically long alphanumeric strings)
    if (key.length < 10) {
      console.warn('⚠️ API key seems too short:', key.length, 'chars');
      return null;
    }
    
    console.log('✅ API key validation passed');
    return key;
  }

  findButtonByText(text) {
    // Helper function to find buttons by text content (since :contains() isn't valid CSS)
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent.toLowerCase().includes(text.toLowerCase())) {
        return button;
      }
    }
    return null;
  }

  async copyToClipboard(text) {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback to document.execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return result;
    } catch (error) {
      console.error('Clipboard access failed:', error);
      return false;
    }
  }

  promptForApiKey() {
    // Create a better API key setup modal instead of basic prompt
    this.showApiKeySetupModal();
  }

  showApiKeySetupModal() {
    // Remove existing modal if any
    const existingModal = document.querySelector('#n9n-api-key-modal');
    if (existingModal) existingModal.remove();

    // Try to highlight the profile icon in n8n if we can find it
    this.highlightProfileIcon();

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'n9n-api-key-modal';
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    `;

    // Create modal content
    modalOverlay.innerHTML = `
      <div style="
        background: #1a1a1a;
        border: 1px solid #404040;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      ">
        <!-- Close button -->
        <button id="close-api-modal" style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: #888;
          font-size: 20px;
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>
        
        <!-- Header -->
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #ffffff;">🔑 n8n API Key Required</h3>
          <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.5;">
            To automatically create workflows, we need your n8n API key.
          </p>
          <button id="clear-corrupted-key" style="
            margin-top: 8px;
            background: #d97706;
            border: 1px solid #f59e0b;
            border-radius: 4px;
            padding: 4px 8px;
            color: #ffffff;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
          ">Clear Corrupted API Key</button>
        </div>
        
        <!-- Step-by-step guide -->
        <div style="margin-bottom: 20px;">
          <div style="
            background: #252525;
            border: 1px solid #404040;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
          ">
            <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #3ecf8e;">📋 How to get your API key:</h4>
            <ol style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">Look for the <strong>highlighted profile icon</strong> in the bottom-left corner</li>
              <li style="margin-bottom: 8px;">Click the profile icon and select <strong>"Settings"</strong></li>
              <li style="margin-bottom: 8px;">Go to <strong>"n8n API"</strong> section</li>
              <li style="margin-bottom: 8px;">Click <strong>"Create an API key"</strong></li>
              <li style="margin-bottom: 8px;">Give it a <strong>Label</strong>, Set <strong>Expiration to No Expiration</strong> (recommended), then <strong>Save</strong></li>
              <li>Copy the generated key and paste it below</li>
            </ol>
          </div>
          
          <!-- Visual indicator -->
          <div style="
            background: linear-gradient(45deg, #3ecf8e, #2dd4bf);
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            margin-bottom: 16px;
            animation: pulse 2s infinite;
          ">
            <div style="font-size: 12px; font-weight: 600; color: #ffffff;">Profile Icon → Settings → n8n API</div>
          </div>
        </div>
        
        <!-- Input field -->
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #d1d5db;">API Key:</label>
          <div style="position: relative;">
            <input type="password" id="api-key-input" placeholder="Enter your n8n API key..." style="
              width: 100%;
              padding: 12px 16px;
              background: #2a2a2a;
              border: 1px solid #404040;
              border-radius: 8px;
              color: #ffffff;
              font-size: 14px;
              font-family: 'Courier New', monospace;
              outline: none;
              transition: border-color 0.2s, background-color 0.2s;
              box-sizing: border-box;
            ">
            <button type="button" id="clear-input-btn" style="
              position: absolute;
              right: 40px;
              top: 50%;
              transform: translateY(-50%);
              background: #404040;
              border: 1px solid #555555;
              border-radius: 4px;
              padding: 4px 8px;
              color: #a0a0a0;
              font-size: 10px;
              cursor: pointer;
              transition: all 0.2s;
            ">Clear</button>
            <button type="button" id="toggle-visibility-btn" style="
              position: absolute;
              right: 8px;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: none;
              color: #a0a0a0;
              font-size: 12px;
              cursor: pointer;
              transition: all 0.2s;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">👁</button>
          </div>
          <div style="font-size: 11px; color: #888; margin-top: 4px;">
            <strong>⚠️ Make sure to copy the API KEY, not workflow JSON!</strong><br>
            Tip: Use Ctrl+A to select all, then paste your API key
          </div>
        </div>
        
        <!-- Buttons -->
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="cancel-api-setup" style="
            padding: 10px 20px;
            background: #404040;
            border: 1px solid #555555;
            border-radius: 6px;
            color: #a0a0a0;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Cancel</button>
          <button id="save-api-key" style="
            padding: 10px 20px;
            background: #3ecf8e;
            border: 1px solid #2dd4bf;
            border-radius: 6px;
            color: #ffffff;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
          ">Save & Continue</button>
        </div>
      </div>
    `;

    // Add animations
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes highlight {
        0%, 100% { box-shadow: 0 0 0 0 rgba(62, 207, 142, 0.7); }
        50% { box-shadow: 0 0 0 10px rgba(62, 207, 142, 0.3); }
      }
    `;
    document.head.appendChild(animationStyle);

    // Add to page
    document.body.appendChild(modalOverlay);

    // Setup event listeners
    this.setupApiKeyModalListeners(modalOverlay);
    
    // Clear corrupted key button
    const clearBtn = modalOverlay.querySelector('#clear-corrupted-key');
    clearBtn.addEventListener('click', () => {
      this.clearCorruptedApiKey();
      this.showNotification('✅ Cleared corrupted API key data. Please enter a new API key.');
    });
    
    clearBtn.addEventListener('mouseenter', () => {
      clearBtn.style.background = '#f59e0b';
    });
    
    clearBtn.addEventListener('mouseleave', () => {
      clearBtn.style.background = '#d97706';
    });
    
    // Focus on input
    setTimeout(() => {
      const input = modalOverlay.querySelector('#api-key-input');
      if (input) input.focus();
    }, 100);
  }

  clearCorruptedApiKey() {
    // Clear from both storage locations with detailed logging
    console.log('🧹 Clearing corrupted API key data...');
    
    // Check what's stored before clearing
    const currentLocalStorage = localStorage.getItem('n8n_api_key');
    console.log('🔍 Current localStorage n8n_api_key:', currentLocalStorage ? currentLocalStorage.substring(0, 100) + '...' : 'NULL');
    
    localStorage.removeItem('n8n_api_key');
    console.log('✅ Cleared n8n_api_key from localStorage');
    
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['n8n_api_key'], (result) => {
        console.log('🔍 Current Chrome storage n8n_api_key:', result.n8n_api_key ? result.n8n_api_key.substring(0, 100) + '...' : 'NULL');
        
        chrome.storage.local.remove(['n8n_api_key'], () => {
          console.log('✅ Cleared API key from Chrome storage');
        });
      });
    }
    
    // Also clear any workflow data that might be in wrong place
    localStorage.removeItem('n9n_workflow_to_inject');
    console.log('✅ Cleared all API key storage locations and workflow temp data');
  }

  highlightProfileIcon() {
    // Try to find and highlight the profile icon in n8n
    const possibleSelectors = [
      'img[alt*="avatar"]',
      'img[alt*="profile"]',
      '[data-test-id*="user"]',
      '[data-test-id*="profile"]',
      '.user-avatar',
      '.profile-icon',
      // Look for images in the bottom-left area
      'nav img',
      '.sidebar img',
      // Generic approach - look for small circular images
      'img[style*="border-radius"]'
    ];

    let profileIcon = null;
    
    // Try each selector
    for (const selector of possibleSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        // Look for small images in the bottom-left quadrant
        if (rect.width < 100 && rect.height < 100 && 
            rect.left < window.innerWidth / 2 && 
            rect.bottom > window.innerHeight / 2) {
          profileIcon = element;
          break;
        }
      }
      if (profileIcon) break;
    }

    if (profileIcon) {
      // Add highlight effect
      profileIcon.style.animation = 'highlight 2s infinite';
      profileIcon.style.border = '2px solid #3ecf8e';
      profileIcon.style.borderRadius = '50%';
      profileIcon.style.position = 'relative';
      profileIcon.style.zIndex = '99999';
      
      // Store reference to remove highlight later
      window.n9nHighlightedElement = profileIcon;
      
      console.log('✅ Found and highlighted profile icon!');
      
      // Add pointing arrow
      this.addPointingArrow(profileIcon);
    } else {
      console.log('⚠️ Could not find profile icon to highlight');
    }
  }

  addPointingArrow(targetElement) {
    const rect = targetElement.getBoundingClientRect();
    
    // Create pointing arrow
    const arrow = document.createElement('div');
    arrow.id = 'n9n-pointing-arrow';
    arrow.innerHTML = `
      <div style="
        position: absolute;
        top: -40px;
        left: -20px;
        background: #3ecf8e;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      ">Click here for a new API key!</div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#3ecf8e" style="
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      ">
        <path d="M12 19l-7-7h14l-7 7z"/>
      </svg>
    `;
    
    arrow.style.cssText = `
      position: fixed;
      top: ${rect.top - 40}px;
      left: ${rect.left + rect.width / 2 - 10}px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
      animation: bounce 1s infinite;
    `;
    
    // Add bounce animation
    const bounceStyle = document.createElement('style');
    bounceStyle.textContent = `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(bounceStyle);
    
    document.body.appendChild(arrow);
    
    // Store reference for cleanup
    window.n9nPointingArrow = arrow;
  }

  setupApiKeyModalListeners(modal) {
    const input = modal.querySelector('#api-key-input');
    const saveBtn = modal.querySelector('#save-api-key');
    const cancelBtn = modal.querySelector('#cancel-api-setup');
    const closeBtn = modal.querySelector('#close-api-modal');
    const clearBtn = modal.querySelector('#clear-input-btn');
    const toggleBtn = modal.querySelector('#toggle-visibility-btn');

    // Close modal function
    const closeModal = () => {
      modal.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        modal.remove();
        this.cleanupHighlights();
      }, 300);
    };

    // Clear button
    clearBtn.addEventListener('click', () => {
      console.log('🧹 Clear button clicked');
      input.value = '';
      input.focus();
      input.dispatchEvent(new Event('input')); // Trigger validation
    });
    
    clearBtn.addEventListener('mouseenter', () => {
      clearBtn.style.background = '#555555';
      clearBtn.style.color = '#ffffff';
    });
    
    clearBtn.addEventListener('mouseleave', () => {
      clearBtn.style.background = '#404040';
      clearBtn.style.color = '#a0a0a0';
    });
    
    // Toggle visibility button
    toggleBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '🙈';
        console.log('👁 Password visibility toggled ON');
      } else {
        input.type = 'password';
        toggleBtn.textContent = '👁';
        console.log('👁 Password visibility toggled OFF');
      }
    });
    
    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.style.color = '#ffffff';
    });
    
    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.style.color = '#a0a0a0';
    });
    
    // Paste event listener to debug clipboard content
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      console.log('📋 PASTE EVENT - Data preview:', pastedData ? pastedData.substring(0, 100) + '...' : 'EMPTY');
      console.log('📋 PASTE EVENT - Data type:', typeof pastedData, 'Length:', pastedData.length);
      
      if (pastedData.startsWith('{') && pastedData.includes('nodes')) {
        console.error('❌ PASTE CONTAINS WORKFLOW JSON! Not pasting.');
        alert('❌ Your clipboard contains workflow JSON, not an API key!\n\nPlease copy the actual n8n API key from your n8n settings.');
        return;
      }
      
      // Only paste if it doesn't look like workflow JSON
      input.value = pastedData;
      input.dispatchEvent(new Event('input'));
      console.log('✅ Pasted API key successfully');
    });

    // Input validation
    input.addEventListener('input', () => {
      const hasValue = input.value.trim();
      console.log('🔍 Input changed, value preview:', hasValue ? hasValue.substring(0, 50) + '...' : 'EMPTY');
      console.log('🔍 Input value type:', typeof hasValue, 'Length:', hasValue.length);
      
      // Check if this looks like workflow JSON
      if (hasValue.startsWith('{') && hasValue.includes('nodes')) {
        console.warn('⚠️ WARNING: Input contains workflow JSON, not API key!');
        input.style.borderColor = '#ff6b6b';
        input.style.background = '#2a1f1f';
      } else if (hasValue.length > 10) {
        input.style.borderColor = '#3ecf8e';
        input.style.background = '#2a2a2a';
      } else {
        input.style.borderColor = '#404040';
        input.style.background = '#2a2a2a';
      }
      
      saveBtn.disabled = !hasValue;
      saveBtn.style.opacity = hasValue ? '1' : '0.5';
      saveBtn.style.cursor = hasValue ? 'pointer' : 'not-allowed';
    });

    // Enter key to save
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const apiKey = input.value.trim();
        console.log('🔑 Enter key pressed, input preview:', apiKey.substring(0, 30) + '...');
        console.log('🔑 Enter key pressed, input type:', typeof apiKey, 'Length:', apiKey.length);
        this.saveApiKey(apiKey, closeModal);
      }
    });

    // Save button
    saveBtn.addEventListener('click', () => {
      const apiKey = input.value.trim();
      console.log('🔑 Save button clicked, input preview:', apiKey.substring(0, 30) + '...');
      console.log('🔑 Save button clicked, input type:', typeof apiKey, 'Length:', apiKey.length);
      if (apiKey) {
        this.saveApiKey(apiKey, closeModal);
      }
    });

    // Cancel/Close buttons
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Escape key to close
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    });

    // Button hover effects
    [saveBtn, cancelBtn, closeBtn].forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        if (btn === saveBtn && !btn.disabled) {
          btn.style.background = '#2dd4bf';
        } else if (btn === cancelBtn) {
          btn.style.background = '#555555';
          btn.style.color = '#ffffff';
        } else if (btn === closeBtn) {
          btn.style.color = '#ffffff';
        }
      });
      
      btn.addEventListener('mouseleave', () => {
        if (btn === saveBtn) {
          btn.style.background = '#3ecf8e';
        } else if (btn === cancelBtn) {
          btn.style.background = '#404040';
          btn.style.color = '#a0a0a0';
        } else if (btn === closeBtn) {
          btn.style.color = '#888';
        }
      });
    });

    // Input focus effects
    input.addEventListener('focus', () => {
      input.style.borderColor = '#3ecf8e';
    });
    
    input.addEventListener('blur', () => {
      input.style.borderColor = '#404040';
    });
  }

  cleanupHighlights() {
    // Remove profile icon highlight
    if (window.n9nHighlightedElement) {
      window.n9nHighlightedElement.style.animation = '';
      window.n9nHighlightedElement.style.border = '';
      window.n9nHighlightedElement.style.borderRadius = '';
      window.n9nHighlightedElement.style.position = '';
      window.n9nHighlightedElement.style.zIndex = '';
      window.n9nHighlightedElement = null;
    }
    
    // Remove pointing arrow
    if (window.n9nPointingArrow) {
      window.n9nPointingArrow.remove();
      window.n9nPointingArrow = null;
    }
  }

  saveApiKey(apiKey, closeModal) {
    try {
      // CRITICAL: Debug the API key value
      console.log('🔑 saveApiKey called with:', typeof apiKey, apiKey ? apiKey.substring(0, 50) + '...' : 'NULL');
      
      // Validate API key format
      if (!apiKey || typeof apiKey !== 'string') {
        console.error('❌ Invalid API key format:', apiKey);
        this.showNotification('❌ Invalid API key format.');
        return;
      }
      
      // Check if it looks like a JSON object instead of an API key
      if (apiKey.startsWith('{') && apiKey.includes('nodes')) {
        console.error('❌ API key appears to be workflow JSON!');
        this.showNotification('❌ Error: Workflow data detected instead of API key.');
        return;
      }
      
      // CRITICAL FIX: Clear any corrupted data first
      console.log('🧹 Clearing any existing corrupted API key data...');
      localStorage.removeItem('n8n_api_key');
      
      // Store the API key in both places for redundancy
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ 'n8n_api_key': apiKey }, () => {
          if (chrome.runtime.lastError) {
            console.log('🔑 Chrome storage failed, using localStorage:', chrome.runtime.lastError);
          } else {
            console.log('✅ API Key saved to chrome storage');
          }
        });
      }
      
      // Always also save to localStorage as backup - with validation
      localStorage.setItem('n8n_api_key', apiKey);
      
      // Verify it was saved correctly
      const verification = localStorage.getItem('n8n_api_key');
      if (verification === apiKey) {
        console.log('✅ API Key saved and verified in localStorage');
      } else {
        console.error('❌ API Key verification failed! Saved:', verification?.substring(0, 30));
        this.showNotification('❌ API Key save verification failed!');
        return;
      }
      
      closeModal();
      this.showNotification('✅ API Key saved successfully! Click "⚡ Inject" again to create the workflow.');
      
      // Add debug logging with proper validation
      console.log('✅ API Key saved (first 20 chars):', apiKey.substring(0, 20) + '...');
      
      // Test the API connection
      setTimeout(() => {
        this.testApiConnection(apiKey);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to save API key:', error);
      this.showNotification('❌ Failed to save API key. Please try again.');
    }
  }

  async testApiConnection(apiKey) {
    try {
      const baseUrl = this.detectN8nBaseUrl();
      if (!baseUrl) {
        console.log('⚠️ Cannot test API - no base URL detected');
        return;
      }
      
      console.log('🧪 Testing API connection...');
      
      // Test with a simple GET request to list workflows
      const testUrl = `${baseUrl}/api/v1/workflows`;
      const headers = {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey
      };
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      
      console.log('🧪 Test API Response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Connection successful! Found', data.data ? data.data.length : 0, 'workflows');
        this.showNotification('✅ API Key working! Ready to inject workflows.');
      } else {
        const errorText = await response.text();
        console.log('❌ API Test failed:', errorText);
        
        if (response.status === 401) {
          this.showNotification('❌ API Key authentication failed');
        } else if (response.status === 403) {
          this.showNotification('⚠️ API Key has limited permissions. Free tier may not support workflow creation.');
        } else {
          this.showNotification('❌ API connection failed: ' + response.status);
        }
      }
      
    } catch (error) {
      console.error('🧪 API Test error:', error);
      this.showNotification('❌ Failed to test API connection');
    }
  }

  async injectViaRedirect(workflowData) {
    try {
      // Try to navigate to new workflow page and inject data
      const currentUrl = window.location.href;
      const baseUrl = this.detectN8nBaseUrl();
      
      if (!baseUrl) return false;
      
      // Store workflow data in localStorage for the new page to pick up
      // CRITICAL: Use specific key to avoid overwriting API key
      localStorage.setItem('n9n_workflow_to_inject', JSON.stringify(workflowData));
      console.log('🔄 Stored workflow for injection with key: n9n_workflow_to_inject');
      
      // Navigate to new workflow page
      const newWorkflowUrl = `${baseUrl}/workflow/new`;
      console.log('Redirecting to:', newWorkflowUrl);
      
      window.location.href = newWorkflowUrl;
      return true;
      
    } catch (error) {
      console.error('Redirect injection failed:', error);
      return false;
    }
  }

  async injectViaDOM(workflowData, importButton) {
    try {
      // Click import button and try to paste data
      importButton.click();
      
      // Wait for import dialog
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Look for textarea or input field
      const textArea = document.querySelector('textarea[placeholder*="workflow"]') ||
                      document.querySelector('textarea[placeholder*="JSON"]') ||
                      document.querySelector('.import-textarea');
      
      if (textArea) {
        textArea.value = JSON.stringify(workflowData, null, 2);
        textArea.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Try to find and click import/confirm button
        const confirmButton = document.querySelector('button[data-test-id="import-workflow-confirm"]') ||
                             document.querySelector('button:contains("Import")') ||
                             document.querySelector('.import-confirm-button');
        
        if (confirmButton) {
          confirmButton.click();
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('DOM injection failed:', error);
      return false;
    }
  }

  async injectViaCanvas(workflowData, canvas) {
    try {
      // Try to inject nodes directly into canvas
      // This would require understanding n8n's canvas structure
      console.log('Canvas injection not implemented yet');
      return false;
    } catch (error) {
      console.error('Canvas injection failed:', error);
      return false;
    }
  }

  showNotification(text) {
    const notification = document.createElement('div');
    notification.textContent = text;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2a2a2a;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      border: 1px solid #404040;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + Shift + K to toggle
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'K') {
        event.preventDefault();
        this.toggleSidebar();
      }
      
      // Escape to close
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

console.log('🚀 n9n AI Copilot loaded successfully');