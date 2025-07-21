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
    this.setupEventListeners();
    this.renderInitialContent();
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
          <div style="display: flex; gap: 4px;">
            <button id="header-close-btn" style="
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
            " title="Close Panel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
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
              placeholder="How can I help you?"
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

  setupEventListeners() {
    console.log('🎯 Setting up UIManager event listeners');
    
    if (!this.sidebar) {
      console.log('❌ No sidebar found for event listeners');
      return;
    }

    // Header close button
    const headerCloseBtn = this.sidebar.querySelector('#header-close-btn');
    if (headerCloseBtn) {
      console.log('✅ Found header close button');
      headerCloseBtn.addEventListener('click', (e) => {
        console.log('🖱️ Header close button clicked');
        e.preventDefault();
        this.closeSidebar();
      });
    } else {
      console.log('❌ Header close button not found');
    }

    // New chat button  
    const newChatBtn = this.sidebar.querySelector('#new-chat-btn');
    if (newChatBtn) {
      console.log('✅ Found new chat button');
      newChatBtn.addEventListener('click', (e) => {
        console.log('🖱️ New chat button clicked');
        e.preventDefault();
        this.startNewChat();
      });
    } else {
      console.log('❌ New chat button not found');
    }

    // Settings button
    const settingsBtn = this.sidebar.querySelector('#settings-btn');
    if (settingsBtn) {
      console.log('✅ Found settings button');
      settingsBtn.addEventListener('click', (e) => {
        console.log('🖱️ Settings button clicked');
        e.preventDefault();
        this.openSettings();
      });
    } else {
      console.log('❌ Settings button not found');
    }

    // Close conversation button
    const closeConvoBtn = this.sidebar.querySelector('#close-convo-btn');
    if (closeConvoBtn) {
      console.log('✅ Found close conversation button');
      closeConvoBtn.addEventListener('click', (e) => {
        console.log('🖱️ Close conversation button clicked');
        e.preventDefault();
        this.closeCurrentConversation();
      });
    }

    // Send button
    const sendBtn = this.sidebar.querySelector('#send-btn');
    if (sendBtn) {
      console.log('✅ Found send button');
      sendBtn.addEventListener('click', (e) => {
        console.log('🖱️ Send button clicked');
        e.preventDefault();
        this.sendMessage();
      });
    }

    // Chat input enter key
    const chatInput = this.sidebar.querySelector('#chat-input');
    if (chatInput) {
      console.log('✅ Found chat input');
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          console.log('🖱️ Enter key pressed in chat input');
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Enable/disable send button based on input
      chatInput.addEventListener('input', (e) => {
        const sendBtn = this.sidebar.querySelector('#send-btn');
        if (sendBtn) {
          sendBtn.disabled = !e.target.value.trim();
          sendBtn.style.opacity = e.target.value.trim() ? '1' : '0.5';
        }
      });
    }

    // Suggestion buttons
    const suggestionBtns = this.sidebar.querySelectorAll('.suggestion-btn');
    console.log(`✅ Found ${suggestionBtns.length} suggestion buttons`);
    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('🖱️ Suggestion button clicked:', e.target.textContent);
        const text = e.target.dataset.text;
        if (text && chatInput) {
          chatInput.value = text;
          chatInput.dispatchEvent(new Event('input'));
          chatInput.focus();
        }
      });
    });
  }

  closeSidebar() {
    console.log('❌ Closing sidebar from UIManager');
    if (window.n9nCopilot && window.n9nCopilot.toggleSidebar) {
      console.log('✅ Calling n9nCopilot.toggleSidebar()');
      window.n9nCopilot.toggleSidebar();
    } else {
      console.log('❌ window.n9nCopilot not available');
    }
  }

  startNewChat() {
    console.log('🆕 Starting new chat from UIManager');
    
    // Hide the conversation pill
    const pill = this.sidebar.querySelector('#current-convo-pill');
    if (pill) {
      pill.style.display = 'none';
    }
    
    // Show welcome message
    this.renderWelcomeMessage();
    
    // Clear input focus
    const chatInput = this.sidebar.querySelector('#chat-input');
    if (chatInput) {
      chatInput.focus();
    }
    
    this.showNotification('New chat started!', 'success');
  }

  // Helper function to add some demo conversations for testing
  addDemoConversations() {
    const demoConversations = [
      {
        id: 'demo-1',
        title: 'Build me a basic workflow that prints todays date',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        messageCount: 4,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'demo-2', 
        title: 'Create a workflow for daily email reports',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        messageCount: 8,
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'demo-3',
        title: 'Help me sync Google Sheets with Airtable',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        messageCount: 12,
        lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    localStorage.setItem('n9n_recent_conversations', JSON.stringify(demoConversations));
    console.log('📝 Added demo conversations');
    this.showNotification('Demo conversations added!', 'success');
    
    // Re-render to show the conversations
    this.renderInitialContent();
  }

  openSettings() {
    console.log('⚙️ Opening settings from UIManager');
    this.showApiKeyModal();
  }

  closeCurrentConversation() {
    console.log('📝 Closing current conversation');
    // Hide the conversation pill
    const pill = this.sidebar.querySelector('#current-convo-pill');
    if (pill) {
      pill.style.display = 'none';
    }
    this.showNotification('Conversation closed', 'success');
  }

  sendMessage() {
    const input = this.sidebar.querySelector('#chat-input');
    const sendBtn = this.sidebar.querySelector('#send-btn');
    
    if (!input || !input.value.trim()) {
      console.log('❌ No message to send');
      return;
    }

    const message = input.value.trim();
    console.log('📤 Sending message:', message);
    
    // Clear input
    input.value = '';
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.5';
    }

    // TODO: Implement actual message sending
    this.showNotification('Message sent! (Feature coming soon)', 'success');
  }

  renderInitialContent() {
    const recentConversations = this.getRecentConversations();
    
    if (recentConversations.length > 0) {
      console.log(`📋 Rendering ${recentConversations.length} recent conversations`);
      this.renderRecentConversations(recentConversations);
    } else {
      console.log('👋 No recent conversations, showing welcome message');
      this.renderWelcomeMessage();
    }
  }

  getRecentConversations() {
    // Try to get from localStorage first
    try {
      const stored = localStorage.getItem('n9n_recent_conversations');
      if (stored) {
        const conversations = JSON.parse(stored);
        return conversations.filter(conv => conv && conv.id); // Filter out invalid entries
      }
    } catch (error) {
      console.log('Error loading recent conversations:', error);
    }

    // Return empty array if no conversations found
    return [];
  }

  renderRecentConversations(conversations) {
    const messagesContainer = this.sidebar.querySelector('#messages-container');
    if (!messagesContainer) {
      console.log('❌ Messages container not found');
      return;
    }

    messagesContainer.innerHTML = `
      <div style="padding: 16px 0;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding: 0 4px;
        ">
          <h3 style="
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
          ">Recent Conversations</h3>
          <button class="new-conversation-btn" style="
            background: none;
            border: none;
            color: #a0a0a0;
            font-size: 12px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.2s;
          " title="Start New Conversation">+ New</button>
        </div>
        
        <div style="
          display: flex;
          flex-direction: column;
          gap: 8px;
        ">
          ${conversations.slice(0, 5).map(conv => this.renderConversationItem(conv)).join('')}
        </div>
      </div>
    `;

    // Setup click handlers for conversation items
    this.setupConversationHandlers();
  }

  renderConversationItem(conversation) {
    const timeAgo = this.getTimeAgo(conversation.timestamp || conversation.lastActivity || Date.now());
    const messageCount = conversation.messageCount || conversation.messages?.length || 0;
    
    return `
      <div class="conversation-item" data-conversation-id="${conversation.id}" style="
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #404040;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        <div style="
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
          color: #ffffff;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">
          ${conversation.title || 'Untitled Conversation'}
        </div>
        <div style="
          font-size: 11px;
          color: #a0a0a0;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span>${timeAgo}</span>
          <span>•</span>
          <span>${messageCount} messages</span>
        </div>
      </div>
    `;
  }

  setupConversationHandlers() {
    const conversationItems = this.sidebar.querySelectorAll('.conversation-item');
    conversationItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const conversationId = item.dataset.conversationId;
        console.log('🗨️ Loading conversation:', conversationId);
        this.loadConversation(conversationId);
      });

      // Hover effects
      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(255, 255, 255, 0.08)';
        item.style.borderColor = '#555';
      });

      item.addEventListener('mouseleave', () => {
        item.style.background = 'rgba(255, 255, 255, 0.03)';
        item.style.borderColor = '#404040';
      });
    });

    // New conversation button
    const newConvBtn = this.sidebar.querySelector('.new-conversation-btn');
    if (newConvBtn) {
      newConvBtn.addEventListener('click', () => {
        console.log('🆕 Starting new conversation from recent conversations');
        this.startNewChat();
      });

      newConvBtn.addEventListener('mouseenter', () => {
        newConvBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        newConvBtn.style.color = '#ffffff';
      });

      newConvBtn.addEventListener('mouseleave', () => {
        newConvBtn.style.background = 'none';
        newConvBtn.style.color = '#a0a0a0';
      });
    }
  }

  loadConversation(conversationId) {
    // TODO: Implement conversation loading
    // For now, just show the conversation and switch to chat mode
    this.showNotification(`Loading conversation ${conversationId}...`, 'info');
    
    // Show the conversation pill
    const pill = this.sidebar.querySelector('#current-convo-pill');
    const titleSpan = this.sidebar.querySelector('#convo-title');
    
    if (pill && titleSpan) {
      // Try to get conversation title
      const conversations = this.getRecentConversations();
      const conv = conversations.find(c => c.id === conversationId);
      
      if (conv) {
        titleSpan.textContent = conv.title || 'Untitled Conversation';
        pill.style.display = 'flex';
      }
    }

    // Switch back to welcome/empty chat view for now
    this.renderWelcomeMessage();
  }

  renderWelcomeMessage() {
    const messagesContainer = this.sidebar.querySelector('#messages-container');
    if (!messagesContainer) {
      console.log('❌ Messages container not found');
      return;
    }

    console.log('👋 Rendering welcome message');
    messagesContainer.innerHTML = `
      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px 20px;
        color: #a0a0a0;
      ">
        <h3 style="
          margin: 0 0 12px 0; 
          font-size: 18px; 
          font-weight: 600; 
          color: #ffffff;
        "> Welcome Back!</h3>
        <p style="
          margin: 0 0 24px 0; 
          font-size: 14px; 
          line-height: 1.5;
          color: #888;
        ">Ready to build?</p>
        

      </div>
    `;

    // Setup demo button handler
    const demoBtn = this.sidebar.querySelector('#add-demo-convos');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        this.addDemoConversations();
      });
      
      demoBtn.addEventListener('mouseenter', () => {
        demoBtn.style.background = 'rgba(255, 255, 255, 0.1)';
        demoBtn.style.borderColor = '#555';
        demoBtn.style.color = '#ffffff';
      });
      
      demoBtn.addEventListener('mouseleave', () => {
        demoBtn.style.background = 'rgba(255, 255, 255, 0.05)';
        demoBtn.style.borderColor = '#404040';
        demoBtn.style.color = '#a0a0a0';
      });
    }
  }

  setupWelcomeSuggestionButtons() {
    const chatInput = this.sidebar.querySelector('#chat-input');
    const suggestionBtns = this.sidebar.querySelectorAll('.suggestion-btn');
    
    console.log(`✅ Setting up ${suggestionBtns.length} welcome suggestion buttons`);
    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        console.log('🖱️ Welcome suggestion clicked:', e.target.textContent?.trim());
        const text = e.target.dataset.text || e.target.closest('.suggestion-btn')?.dataset.text;
        if (text && chatInput) {
          chatInput.value = text;
          chatInput.dispatchEvent(new Event('input'));
          chatInput.focus();
          
          // Clear welcome message and show input focused state
          this.clearMessages();
        }
      });
      
      // Hover effects
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255, 255, 255, 0.1)';
        btn.style.borderColor = '#555';
        btn.style.color = '#ffffff';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = '#404040';
        btn.style.color = '#d1d5db';
      });
    });
  }

  clearMessages() {
    const messagesContainer = this.sidebar.querySelector('#messages-container');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
  }

  renderMessages(messages) {
    const messagesContainer = this.sidebar.querySelector('#messages-container');
    if (!messagesContainer) return;

    if (messages.length === 0) {
      this.renderWelcomeMessage();
      return;
    }

    messagesContainer.innerHTML = messages.map(message => {
      const isUser = message.role === 'user';
      const timeAgo = this.getTimeAgo(message.timestamp);
      
      return `
        <div style="
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          margin-bottom: 8px;
        ">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${isUser ? '#404040' : '#2a2a2a'};
            border: ${isUser ? 'none' : '1px solid #555555'};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: ${isUser ? '14px' : '16px'};
            color: ${isUser ? '#ffffff' : '#3ecf8e'};
          ">
            ${isUser ? '👤' : '🤖'}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="
              color: #ffffff;
              font-size: 14px;
              line-height: 1.5;
              margin-bottom: 4px;
            ">${this.formatMessageContent(message.content)}</div>
            <div style="
              color: #a0a0a0;
              font-size: 11px;
            ">${timeAgo}</div>
            ${!isUser && message.content.includes('```json') ? `
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button class="copy-workflow-btn" data-message-id="${message.id}" style="
                  background: #404040;
                  border: 1px solid #555555;
                  border-radius: 6px;
                  padding: 6px 12px;
                  color: #a0a0a0;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                ">📋 Copy</button>
                <button class="inject-workflow-btn" data-message-id="${message.id}" style="
                  background: #404040;
                  border: 1px solid #555555;
                  border-radius: 6px;
                  padding: 6px 12px;
                  color: #a0a0a0;
                  font-size: 12px;
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
    }).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  formatMessageContent(content) {
    // Handle code blocks
    content = content.replace(/```json\n([\s\S]*?)\n```/g, (match, code) => {
      return `
        <div style="
          margin: 12px 0;
          border: 1px solid #404040;
          border-radius: 8px;
          overflow: hidden;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: #2a2a2a;
            border-bottom: 1px solid #404040;
            font-size: 12px;
            color: #a0a0a0;
          ">
            <span>Workflow JSON</span>
            <button onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(code)}'))" style="
              background: none;
              border: none;
              color: #a0a0a0;
              cursor: pointer;
              font-size: 11px;
              padding: 4px 8px;
              border-radius: 4px;
            ">📋 Copy</button>
          </div>
          <pre style="
            margin: 0;
            padding: 12px;
            background: #1a1a1a;
            color: #e6e6e6;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            line-height: 1.4;
            overflow-x: auto;
          "><code>${this.escapeHtml(code)}</code></pre>
        </div>
      `;
    });

    // Handle other code blocks
    content = content.replace(/```(\\w+)?\\n([\\s\\S]*?)\\n```/g, (match, lang, code) => {
      return `<div style="margin: 12px 0; padding: 12px; background: #1a1a1a; border: 1px solid #404040; border-radius: 8px;"><pre style="margin: 0; color: #e6e6e6; font-family: monospace; font-size: 12px;"><code>${this.escapeHtml(code)}</code></pre></div>`;
    });

    // Handle inline code
    content = content.replace(/`([^`]+)`/g, '<code style="background: #2a2a2a; color: #e6e6e6; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">$1</code>');

    // Handle line breaks
    content = content.replace(/\n/g, '<br>');

    return content;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  }

  showApiKeyModal() {
    console.log('🔑 Creating API key modal...');
    
    // Remove existing modal if any
    const existingModal = document.querySelector('#n9n-api-key-modal');
    if (existingModal) {
      console.log('🗑️ Removing existing modal');
      existingModal.remove();
    }

    // Highlight the profile icon in n8n if we can find it
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

    // Create modal content with spotlight instructions
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
        
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #ffffff;">🔑 n8n API Key Required</h3>
          <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.5;">
            To automatically create workflows, we need your n8n API key.
          </p>
        </div>
        
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
              <li style="margin-bottom: 8px;">Give it a <strong>Label</strong>, Set <strong>Expiration to No Expiration</strong>, then <strong>Save</strong></li>
              <li>Copy the generated key and paste it below</li>
            </ol>
          </div>
          
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
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #d1d5db;">API Key:</label>
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
            box-sizing: border-box;
          ">
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="cancel-api-setup" style="
            padding: 10px 20px;
            background: #404040;
            border: 1px solid #555555;
            border-radius: 6px;
            color: #a0a0a0;
            font-size: 14px;
            cursor: pointer;
          ">Cancel</button>
          <button id="save-api-key" style="
            padding: 10px 20px;
            background: #3ecf8e;
            border: 1px solid #2dd4bf;
            border-radius: 6px;
            color: #ffffff;
            font-size: 14px;
            cursor: pointer;
            font-weight: 500;
          ">Save & Continue</button>
        </div>
      </div>
    `;

    // Add animation styles
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

    document.body.appendChild(modalOverlay);
    this.setupApiKeyModalListeners(modalOverlay);
    console.log('🎉 API key modal created and added to DOM');
  }

  highlightProfileIcon() {
    // Try to find and highlight the profile icon in n8n
    const possibleSelectors = [
      'img[alt*="avatar"]',
      'img[alt*="profile"]',
      '[data-test-id*="user"]',
      'nav img',
      '.sidebar img'
    ];

    let profileIcon = null;
    
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
      profileIcon.style.animation = 'highlight 2s infinite';
      profileIcon.style.border = '2px solid #3ecf8e';
      profileIcon.style.borderRadius = '50%';
      profileIcon.style.position = 'relative';
      profileIcon.style.zIndex = '99999';
      
      window.n9nHighlightedElement = profileIcon;
    } else {
      console.log('👤 Profile icon not found for highlighting');
    }
  }

  setupApiKeyModalListeners(modal) {
    const input = modal.querySelector('#api-key-input');
    const saveBtn = modal.querySelector('#save-api-key');
    const cancelBtn = modal.querySelector('#cancel-api-setup');
    const closeBtn = modal.querySelector('#close-api-modal');

    const closeModal = () => {
      modal.remove();
      this.cleanupHighlights();
    };

    const saveApiKey = () => {
      const apiKey = input.value.trim();
      if (apiKey && apiKey.length > 10) {
        // Save to localStorage and Chrome storage
        localStorage.setItem('n8n_api_key', apiKey);
        if (chrome && chrome.storage) {
          chrome.storage.local.set({ 'n8n_api_key': apiKey });
        }
        
        this.showNotification('✅ API Key saved successfully!', 'success');
        closeModal();
      } else {
        this.showNotification('❌ Please enter a valid API key', 'error');
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveApiKey();
    });

    saveBtn.addEventListener('click', saveApiKey);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  cleanupHighlights() {
    if (window.n9nHighlightedElement) {
      window.n9nHighlightedElement.style.animation = '';
      window.n9nHighlightedElement.style.border = '';
      window.n9nHighlightedElement.style.borderRadius = '';
      window.n9nHighlightedElement.style.position = '';
      window.n9nHighlightedElement.style.zIndex = '';
      window.n9nHighlightedElement = null;
    }
  }

  showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000000;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // Add animation
    if (!document.querySelector('#notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'notification-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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
            display: flex;
            flex-direction: column;
            gap: 12px;
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
          <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #ffffff;">Ready to build ?</h3>
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
          width: 2Error in event handler: ReferenceError: Cannot access 'isN8nPage' before initialization at chrome-extension://jncpkjgmbjldengmmefdmlpeodiajnla/background.js:75:234px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 12px;
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