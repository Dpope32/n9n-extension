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
      background: rgba(9, 9, 11, 0.95);
      border-left: 1px solid #27272a;
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
    this.renderInitialContent().catch(error => {
      console.error('Failed to render initial content:', error);
      this.renderWelcomeMessage();
    });
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
            " title="Open n9n Web App">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
            " title="Close Panel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Messages Container -->
        <div id="messages-container" style="
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          background: #09090b;
        "></div>
        
        <!-- Input Area -->
        <div style="
          border-top: 1px solid #27272a;
          background: #18181b;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 10px;
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
            <button id="send-btn" disabled style="
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
            padding: 8px 16px 12px;
            border-top: 1px solid #27272a;
            background: #27272a;
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

  setupEventListeners() {

    if (!this.sidebar) {
      console.log('❌ No sidebar found for event listeners');
      return;
    }

    // Header close button
    const headerCloseBtn = this.sidebar.querySelector('#header-close-btn');
    if (headerCloseBtn) {
      headerCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeSidebar();
      });

      // Hover effects
      headerCloseBtn.addEventListener('mouseenter', () => {
        headerCloseBtn.style.background = '#27272a';
        headerCloseBtn.style.color = '#fafafa';
        headerCloseBtn.style.borderColor = '#3f3f46';
      });
      headerCloseBtn.addEventListener('mouseleave', () => {
        headerCloseBtn.style.background = '#18181b';
        headerCloseBtn.style.color = '#a1a1aa';
        headerCloseBtn.style.borderColor = '#27272a';
      });
    } else {
      console.log('❌ Header close button not found');
    }

    // New chat button  
    const newChatBtn = this.sidebar.querySelector('#new-chat-btn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.startNewChat();
      });

      // Hover effects
      newChatBtn.addEventListener('mouseenter', () => {
        newChatBtn.style.background = '#27272a';
        newChatBtn.style.color = '#fafafa';
        newChatBtn.style.borderColor = '#3f3f46';
      });
      newChatBtn.addEventListener('mouseleave', () => {
        newChatBtn.style.background = '#18181b';
        newChatBtn.style.color = '#a1a1aa';
        newChatBtn.style.borderColor = '#27272a';
      });
    } else {
      console.log('❌ New chat button not found');
    }

    // Settings button
    const settingsBtn = this.sidebar.querySelector('#settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openSettings();
      });

      // Hover effects
      settingsBtn.addEventListener('mouseenter', () => {
        settingsBtn.style.background = '#27272a';
        settingsBtn.style.color = '#fafafa';
        settingsBtn.style.borderColor = '#3f3f46';
      });
      settingsBtn.addEventListener('mouseleave', () => {
        settingsBtn.style.background = '#18181b';
        settingsBtn.style.color = '#a1a1aa';
        settingsBtn.style.borderColor = '#27272a';
      });
    } else {
      console.log('❌ Settings button not found');
    }

    // Close conversation button - REMOVED since section was deleted
    // const closeConvoBtn = this.sidebar.querySelector('#close-convo-btn');
    // if (closeConvoBtn) {
    //   closeConvoBtn.addEventListener('click', (e) => {
    //     e.preventDefault();
    //     this.closeCurrentConversation();
    //   });
    // }

    // Send button
    const sendBtn = this.sidebar.querySelector('#send-btn');
    if (sendBtn) {
      sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

    // Chat input enter key
    const chatInput = this.sidebar.querySelector('#chat-input');
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
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
    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
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
    if (window.n9nCopilot && window.n9nCopilot.toggleSidebar) {
      window.n9nCopilot.toggleSidebar();
    } else {
      console.log('❌ window.n9nCopilot not available');
    }
  }

  async startNewChat() {
    // Hide the conversation pill - REMOVED since pill no longer exists
    // const pill = this.sidebar.querySelector('#current-convo-pill');
    // if (pill) {
    //   pill.style.display = 'none';
    // }

    try {
      // Check if ChatManager is available
      if (!window.ChatManager) {
        console.warn('⚠️ ChatManager not available');
        this.renderWelcomeMessage();
        return;
      }

      // Initialize ChatManager if needed
      if (!window.chatManager) {
        window.chatManager = new window.ChatManager();
      }

      // Start new conversation
      await window.chatManager.startNewConversation();

      // Show welcome message
      this.renderWelcomeMessage();

      // Clear and focus input
      const chatInput = this.sidebar.querySelector('#chat-input');
      if (chatInput) {
        chatInput.value = '';
        chatInput.focus();
      }

      this.showNotification('New chat started!', 'success');
    } catch (error) {
      console.error('Error starting new chat:', error);
      this.renderWelcomeMessage();
    }
  }


  openSettings() {
    this.showApiKeyModal();
  }

  closeCurrentConversation() {
    // Hide the conversation pill - REMOVED since pill no longer exists
    // const pill = this.sidebar.querySelector('#current-convo-pill');
    // if (pill) {
    //   pill.style.display = 'none';
    // }
    this.showNotification('Conversation closed', 'success');
  }

  async sendMessage() {
    const input = this.sidebar.querySelector('#chat-input');
    const sendBtn = this.sidebar.querySelector('#send-btn');

    if (!input || !input.value.trim()) {
      console.log('❌ No message to send');
      return;
    }

    const message = input.value.trim();
    console.log('📤 Sending message:', message);

    // Clear input immediately to prevent double-sends
    input.value = '';
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.5';
    }

    try {
      // Check if ChatManager is available
      if (!window.ChatManager) {
        throw new Error('ChatManager not available');
      }

      // Initialize ChatManager if not exists
      if (!window.chatManager) {
        window.chatManager = new window.ChatManager();
        // Wait for Supabase to initialize
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Add user message first
      await window.chatManager.addMessage('user', message);

      // Get and render current messages immediately
      const messages = await window.chatManager.getMessages();
      this.renderMessages(messages);

      // Show typing indicator
      this.addTypingIndicator();

      // Simulate AI response (replace with your actual AI service)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate AI response
      const aiResponse = this.generateMockAIResponse(message);
      await window.chatManager.addMessage('assistant', aiResponse.content, aiResponse.metadata);

      // Remove typing indicator
      const typingIndicator = this.sidebar.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }

      // Render updated messages
      const updatedMessages = await window.chatManager.getMessages();
      this.renderMessages(updatedMessages);

      // Handle conversation management
      await window.chatManager.handleMessageExchange(message);

      // Update conversation pill if needed - REMOVED since pill no longer exists
      // this.updateConversationPill(window.chatManager);

    } catch (error) {
      console.error('Failed to send message:', error);
      this.showNotification('Failed to send message: ' + error.message, 'error');

      // Remove typing indicator if it exists
      const typingIndicator = this.sidebar.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    } finally {
      // Re-enable send button
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
      }
    }
  }

  generateMockAIResponse(userMessage) {
    const isWorkflowRequest = userMessage.toLowerCase().includes('workflow') ||
      userMessage.toLowerCase().includes('automation') ||
      userMessage.toLowerCase().includes('make');

    if (isWorkflowRequest) {
      const mockWorkflow = {
        nodes: [
          {
            id: "start",
            type: "n8n-nodes-base.manualTrigger",
            name: "Manual Trigger",
            position: [250, 300]
          },
          {
            id: "process",
            type: "n8n-nodes-base.function",
            name: "Process Data",
            position: [450, 300],
            parameters: {
              functionCode: `// Your workflow logic here\nreturn items.map(item => {\n  return {\n    json: {\n      ...item.json,\n      processed: true,\n      timestamp: new Date().toISOString()\n    }\n  };\n});`
            }
          }
        ]
      };

      return {
        content: `Great idea! I've generated a workflow that handles that automation. Here's the n8n workflow JSON:\n\n\`\`\`json\n${JSON.stringify(mockWorkflow, null, 2)}\n\`\`\`\n\nThis workflow includes:\n1. **Manual Trigger** - Starts the workflow when you run it\n2. **Process Data** - Handles your data transformation\n\nYou can copy the JSON above and import it into n8n!`,
        metadata: { workflow: mockWorkflow }
      };
    }

    const responses = [
      "I can help you create n8n workflows! What kind of automation are you looking to build?",
      "That sounds interesting! Let me help you break that down into workflow steps.",
      "Perfect! I can definitely help you automate that process with n8n.",
      "Great question! Let me guide you through setting up that workflow."
    ];

    return {
      content: responses[Math.floor(Math.random() * responses.length)],
      metadata: {}
    };
  }

  async renderInitialContent() {
    // Initialize ChatManager with better error handling
    try {
      if (!window.ChatManager) {
        console.warn('⚠️ ChatManager not available, falling back to welcome message');
        this.renderWelcomeMessage();
        return;
      }

      if (!window.chatManager) {
        window.chatManager = new window.ChatManager();
        // Wait a bit for Supabase to initialize
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const recentConversations = await this.getRecentConversations();

      if (recentConversations.length > 0) {
        console.log(`📋 Rendering ${recentConversations.length} 0ations`);
        this.renderRecentConversations(recentConversations);
      } else {
        console.log('👋 No recent conversations, showing welcome message');
        this.renderWelcomeMessage();
      }
    } catch (error) {
      console.error('❌ Error in renderInitialContent:', error);
      this.renderWelcomeMessage();
    }
  }

  async getRecentConversations() {
    if (window.chatManager && window.ChatManager) {
      try {
        return await window.chatManager.getRecentConversations();
      } catch (error) {
        console.log('Error loading recent conversations from ChatManager:', error);
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem('n9n_recent_conversations');
      if (stored) {
        const conversations = JSON.parse(stored);
        return conversations.filter(conv => conv && conv.id);
      }
    } catch (error) {
      console.log('Error loading recent conversations from localStorage:', error);
    }

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
          justify-content: flex-start;
          margin-bottom: 16px;
          padding: 0 16px;
        ">
          <h3 style="
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #fafafa;
          ">Recent Conversations</h3>
        </div>
        
        <div style="
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0 16px;
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
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        <div style="
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
          color: #fafafa;
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
          color: #a1a1aa;
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
        //   console.log('🗨️ Loading conversation:', conversationId);  
        this.loadConversation(conversationId);
      });

      // Hover effects
      item.addEventListener('mouseenter', () => {
        item.style.background = '#27272a';
        item.style.borderColor = '#3f3f46';
      });

      item.addEventListener('mouseleave', () => {
        item.style.background = '#18181b';
        item.style.borderColor = '#27272a';
      });
    });
  }

  async loadConversation(conversationId) {
    try {
      this.showNotification(`Loading conversation ${conversationId}...`, 'info');
      
      // Check if ChatManager is available
      if (!window.chatManager) {
        window.chatManager = new window.ChatManager();
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Load the conversation using ChatManager
      const success = await window.chatManager.loadConversation(conversationId);
      
      if (success) {
        // Get and render the loaded messages
        const messages = await window.chatManager.getMessages();
        this.renderMessages(messages);
        this.showNotification('Conversation loaded!', 'success');
      } else {
        console.error('Failed to load conversation');
        this.showNotification('Failed to load conversation', 'error');
        this.renderWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      this.showNotification('Error loading conversation', 'error');
      this.renderWelcomeMessage();
    }
  }

  renderWelcomeMessage() {
    const messagesContainer = this.sidebar.querySelector('#messages-container');
    if (!messagesContainer) {
      console.log('❌ Messages container not found');
      return;
    }

    messagesContainer.innerHTML = `
      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px 20px;
        color: #a1a1aa;
      ">
        <h3 style="
          margin: 0 0 12px 0; 
          font-size: 18px; 
          font-weight: 600; 
          color: #fafafa;
        "> Welcome Back!</h3>
        <p style="
          margin: 0 0 24px 0; 
          font-size: 14px; 
          line-height: 1.5;
          color: #71717a;
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
          margin-bottom: 16px;
          padding: 0 16px;
        ">
          <!-- Author label -->
          <div style="
            font-size: 12px;
            color: #71717a;
            margin-bottom: 6px;
            font-weight: 500;
            ${isUser ? 'text-align: left;' : 'text-align: right;'}
          ">
            ${isUser ? 'You' : 'Assistant'}
          </div>
          
          <!-- Message bubble -->
          <div style="
            background: ${isUser ? '#27272a' : '#18181b'};
            border: 1px solid #27272a;
            border-radius: 8px;
            padding: 12px 16px;
            color: #fafafa;
            font-size: 14px;
            line-height: 1.5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            word-wrap: break-word;
            overflow-wrap: break-word;
          ">
            ${this.formatMessageContent(message.content)}
          </div>
          
          <!-- Timestamp and actions -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 6px;
            padding: 0 4px;
          ">
            <div style="
              font-size: 11px;
              color: #71717a;
            ">
              ${timeAgo}
            </div>
            
            ${!isUser && message.content.includes('```json') ? `
              <div style="
                display: flex;
                gap: 8px;
              ">
                <button class="copy-workflow-btn" data-message-id="${message.id}" style="
                  background: #09090b;
                  border: 1px solid #27272a;
                  border-radius: 6px;
                  padding: 6px 12px;
                  color: #a1a1aa;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.2s;
                  font-family: inherit;
                  font-weight: 500;
                ">Copy</button>
                <button class="inject-workflow-btn" data-message-id="${message.id}" style="
                  background: #09090b;
                  border: 1px solid #27272a;
                  border-radius: 6px;
                  padding: 6px 12px;
                  color: #a1a1aa;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.2s;
                  font-family: inherit;
                  font-weight: 500;
                ">Inject</button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Setup button event listeners
    this.setupMessageButtonListeners();
  }

  formatMessageContent(content) {
    // Handle code blocks
    content = content.replace(/```json\n([\s\S]*?)\n```/g, (match, code) => {
      return `<div style="
          margin: 4px 0 0 0;
          border: 1px solid #27272a;
          border-radius: 6px;
          overflow: hidden;
          background: #09090b;
        ">
          <div style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background: #18181b;
            border-bottom: 1px solid #27272a;
            font-size: 11px;
            color: #a1a1aa;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          ">
            <span>workflow.json</span>
          </div>
          <pre style="
            margin: 0;
            padding: 12px;
            background: #09090b;
            color: #fafafa;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-width: 100%;
          "><code>${this.escapeHtml(code)}</code></pre>
        </div>`;
    });

    // Handle other code blocks
    content = content.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return `<div style="
          margin: 4px 0 0 0;
          border: 1px solid #27272a;
          border-radius: 6px;
          overflow: hidden;
          background: #09090b;
        ">
          <pre style="
            margin: 0;
            padding: 12px;
            background: #09090b;
            color: #fafafa;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-width: 100%;
          "><code>${this.escapeHtml(code)}</code></pre>
        </div>`;
    });

    // Handle inline code
    content = content.replace(/`([^`]+)`/g, '<code style="background: #27272a; color: #fafafa; padding: 2px 6px; border-radius: 4px; font-family: \'SF Mono\', Monaco, \'Cascadia Code\', \'Roboto Mono\', Consolas, \'Courier New\', monospace; font-size: 13px;">$1</code>');

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

  async showApiKeyModal() {

    // Remove existing modal if any
    const existingModal = document.querySelector('#n9n-api-key-modal');
    if (existingModal) {
      console.log('🗑️ Removing existing modal');
      existingModal.remove();
    }

    // Check if there's already an API key
    const existingKey = await this.getExistingApiKey();

    if (existingKey) {
      this.showApiKeyManagementModal(existingKey);
    } else {
      this.showApiKeySetupModal();
    }
  }

  async getExistingApiKey() {
    return new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['n8n_api_key'], (result) => {
          if (chrome.runtime.lastError) {
            const localKey = localStorage.getItem('n8n_api_key');
            resolve(this.validateApiKeyFormat(localKey));
          } else {
            const key = result.n8n_api_key;
            if (key && this.validateApiKeyFormat(key)) {
              resolve(key);
            } else {
              const localKey = localStorage.getItem('n8n_api_key');
              resolve(this.validateApiKeyFormat(localKey));
            }
          }
        });
      } else {
        const key = localStorage.getItem('n8n_api_key');
        resolve(this.validateApiKeyFormat(key));
      }
    });
  }

  validateApiKeyFormat(key) {
    if (!key || typeof key !== 'string') return null;
    if (key.startsWith('{') && key.includes('nodes')) return null; // Corrupted
    if (key.length < 10) return null; // Too short
    return key;
  }

  showApiKeyManagementModal(existingKey) {
    const maskedKey = this.maskApiKey(existingKey);

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
          <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #ffffff;">🔑 API Key Management</h3>
          <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.5;">
            Manage your n8n API key settings
          </p>
        </div>
        <div style="margin-bottom: 20px;">
          <div style="
            background: #252525;
            border: 1px solid #404040;
            border-radius: 8px;
            padding: 16px;
          ">
                         <div style="margin-bottom: 12px;">
               <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #3ecf8e;">✅ Current n8n API Key</h4>
             </div>
             <div style="
               display: flex;
               align-items: center;
               margin-bottom: 12px;
             ">
               <input type="password" id="current-api-key" value="${existingKey}" readonly style="
                 flex: 1;
                 padding: 10px 14px;
                 background: #1a1a1a;
                 border: 1px solid #555555;
                 border-radius: 6px;
                 color: #ffffff;
                 font-size: 13px;
                 font-family: 'Courier New', monospace;
                 outline: none;
               ">
             </div>
             
             <!-- Action Buttons Row -->
             <div style="
               display: flex;
               align-items: center;
               gap: 8px;
               margin-bottom: 8px;
             ">
               <button id="toggle-key-visibility" style="
                 background: none;
                 border: none;
                 color: #666666;
                 font-size: 16px;
                 cursor: pointer;
                 transition: all 0.2s;
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 width: 32px;
                 height: 32px;
                 border-radius: 4px;
               " title="Show/Hide API Key">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                   <circle cx="12" cy="12" r="3"/>
                 </svg>
               </button>
               
               <button id="copy-api-key" style="
                 background: none;
                 border: none;
                 color: #666666;
                 font-size: 16px;
                 cursor: pointer;
                 transition: all 0.2s;
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 width: 32px;
                 height: 32px;
                 border-radius: 4px;
               " title="Copy API Key">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                   <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                 </svg>
               </button>
               
               <button id="update-api-key" style="
                 background: none;
                 border: none;
                 color: #666666;
                 font-size: 16px;
                 cursor: pointer;
                 transition: all 0.2s;
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 width: 32px;
                 height: 32px;
                 border-radius: 4px;
               " title="Update API Key">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                 </svg>
               </button>
               
               <div style="flex: 1;"></div>
               
               <button id="delete-api-key" style="
                 background: none;
                 border: none;
                 color: #666666;
                 font-size: 16px;
                 cursor: pointer;
                 transition: all 0.2s;
                 display: flex;
                 align-items: center;
                 justify-content: center;
                 width: 32px;
                 height: 32px;
                 border-radius: 4px;
               " title="Delete API Key">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <polyline points="3,6 5,6 21,6"/>
                   <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                 </svg>
               </button>
             </div>
          </div>
        </div>
        
        <!-- Help Section -->
        <div style="margin-bottom: 20px;">
          <div style="
            background: #252525;
            border: 1px solid #404040;
            border-radius: 8px;
            padding: 12px;
          ">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #ffffff;">💡 Quick Help</h4>
            <ul style="margin: 0; padding-left: 16px; color: #a0a0a0; font-size: 12px; line-height: 1.5;">
              <li>Test your API key to ensure it's working properly</li>
              <li>Update your key if you've generated a new one in n8n</li>
              <li>Delete to remove the key and start fresh</li>
            </ul>
          </div>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button id="close-management-modal" style="
            padding: 10px 20px;
            background: #404040;
            border: 1px solid #555555;
            border-radius: 6px;
            color: #a0a0a0;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Close</button>
        </div>
      </div>
    `;

    // Add animation styles for management modal
    if (!document.querySelector('#management-modal-styles')) {
      const animationStyle = document.createElement('style');
      animationStyle.id = 'management-modal-styles';
      animationStyle.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(animationStyle);
    }

    document.body.appendChild(modalOverlay);
    this.setupApiKeyManagementListeners(modalOverlay, existingKey);
  }

  maskApiKey(key) {
    if (!key || key.length < 8) return key;
    return key.substring(0, 8) + '•'.repeat(Math.max(0, key.length - 12)) + key.substring(key.length - 4);
  }

  setupApiKeyManagementListeners(modal, existingKey) {
    const closeBtn = modal.querySelector('#close-api-modal');
    const closeManagementBtn = modal.querySelector('#close-management-modal');
    const toggleVisBtn = modal.querySelector('#toggle-key-visibility');
    const copyBtn = modal.querySelector('#copy-api-key');
    const updateBtn = modal.querySelector('#update-api-key');
    const deleteBtn = modal.querySelector('#delete-api-key');
    const keyInput = modal.querySelector('#current-api-key');

    const closeModal = () => {
      modal.remove();
    };

    // Close handlers
    closeBtn?.addEventListener('click', closeModal);
    closeManagementBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Toggle visibility
    toggleVisBtn?.addEventListener('click', () => {
      if (keyInput.type === 'password') {
        keyInput.type = 'text';
      } else {
        keyInput.type = 'password';
      }
    });

    // Add hover effects for toggle button
    toggleVisBtn?.addEventListener('mouseenter', () => {
      toggleVisBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      toggleVisBtn.style.color = '#ffffff';
    });
    toggleVisBtn?.addEventListener('mouseleave', () => {
      toggleVisBtn.style.background = 'none';
      toggleVisBtn.style.color = '#666666';
    });

    // Copy key
    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(existingKey);
        this.showNotification('✅ API key copied to clipboard!', 'success');
      } catch (error) {
        this.showNotification('❌ Failed to copy API key', 'error');
      }
    });

    // Add hover effects for copy button
    copyBtn?.addEventListener('mouseenter', () => {
      copyBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      copyBtn.style.color = '#ffffff';
    });
    copyBtn?.addEventListener('mouseleave', () => {
      copyBtn.style.background = 'none';
      copyBtn.style.color = '#666666';
    });

    // Update key
    updateBtn?.addEventListener('click', () => {
      modal.remove();
      this.showApiKeySetupModal(true); // Pass true to indicate it's an update
    });

    // Add hover effects for update button
    updateBtn?.addEventListener('mouseenter', () => {
      updateBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      updateBtn.style.color = '#ffffff';
    });
    updateBtn?.addEventListener('mouseleave', () => {
      updateBtn.style.background = 'none';
      updateBtn.style.color = '#666666';
    });

    // Delete key
    deleteBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete your API key? You\'ll need to enter it again to use n9n features.')) {
        this.deleteApiKey();
        modal.remove();
        this.showNotification('🗑️ API key deleted', 'success');
      }
    });

    // Add hover effects for delete button
    deleteBtn?.addEventListener('mouseenter', () => {
      deleteBtn.style.background = 'rgba(239, 68, 68, 0.1)';
      deleteBtn.style.color = '#ef4444';
    });
    deleteBtn?.addEventListener('mouseleave', () => {
      deleteBtn.style.background = 'none';
      deleteBtn.style.color = '#666666';
    });
  }



  deleteApiKey() {
    localStorage.removeItem('n8n_api_key');
    if (chrome && chrome.storage) {
      chrome.storage.local.remove(['n8n_api_key']);
    }
  }

  showApiKeySetupModal(isUpdate = false) {
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
          <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #ffffff;">${isUpdate ? '🔑 Update API Key' : '🔑 n8n API Key Required'}</h3>
          <p style="margin: 0; color: #a0a0a0; font-size: 14px; line-height: 1.5;">
            ${isUpdate ? 'Enter your new n8n API key below.' : 'To automatically create workflows, we need your n8n API key.'}
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
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.05); opacity: 1; }
      }
      @keyframes highlight {
        0%, 100% { box-shadow: 0 0 0 0 rgba(62, 207, 142, 0.7); }
        50% { box-shadow: 0 0 0 10px rgba(62, 207, 142, 0.3); }
      }
    `;
    document.head.appendChild(animationStyle);

    document.body.appendChild(modalOverlay);
    this.setupApiKeyModalListeners(modalOverlay);
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
        margin-bottom: 16px;
        padding: 0 16px;
      ">
        <!-- Author label -->
        <div style="
          font-size: 12px;
          color: #71717a;
          margin-bottom: 6px;
          font-weight: 500;
          text-align: right;
        ">
          Assistant
        </div>
        
        <!-- Typing bubble -->
        <div style="
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 12px 16px;
          color: #fafafa;
          font-size: 14px;
          line-height: 1.5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="color: #a1a1aa;">Thinking</span>
          <div style="
            display: flex;
            gap: 4px;
          ">
            <div style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #71717a;
              animation: typing 1.4s infinite ease-in-out;
            "></div>
            <div style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #71717a;
              animation: typing 1.4s infinite ease-in-out;
              animation-delay: 0.2s;
            "></div>
            <div style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #71717a;
              animation: typing 1.4s infinite ease-in-out;
              animation-delay: 0.4s;
            "></div>
          </div>
        </div>
      </div>
    `;

    // Add animation styles
    if (!document.querySelector('#typing-animation')) {
      const style = document.createElement('style');
      style.id = 'typing-animation';
      style.textContent = `
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.3; }
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

  setupMessageButtonListeners() {
    // Copy workflow buttons
    const copyBtns = this.sidebar.querySelectorAll('.copy-workflow-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const messageId = btn.dataset.messageId;
        await this.copyWorkflowFromMessage(messageId);
      });

      // Hover effects
      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#27272a';
        btn.style.color = '#fafafa';
        btn.style.borderColor = '#3f3f46';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#09090b';
        btn.style.color = '#a1a1aa';
        btn.style.borderColor = '#27272a';
      });
    });

    // Inject workflow buttons
    const injectBtns = this.sidebar.querySelectorAll('.inject-workflow-btn');
    injectBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const messageId = btn.dataset.messageId;
        await this.injectWorkflowFromMessage(messageId);
      });

      // Hover effects
      btn.addEventListener('mouseenter', () => {
        btn.style.background = '#27272a';
        btn.style.color = '#fafafa';
        btn.style.borderColor = '#3f3f46';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = '#09090b';
        btn.style.color = '#a1a1aa';
        btn.style.borderColor = '#27272a';
      });
    });
  }

  async copyToClipboard(text) {
    console.log('📋 Attempting to copy to clipboard...', text.length, 'characters');
    
    try {
      // Method 1: Try modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        console.log('🎆 Method 1: Using modern Clipboard API');
        await navigator.clipboard.writeText(text);
        console.log('✅ Modern clipboard API successful!');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Modern clipboard API failed:', error);
    }
    
    try {
      // Method 2: Try legacy execCommand
      console.log('🎆 Method 2: Using legacy execCommand');
      
      // Create a temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      
      // Select and copy
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        console.log('✅ Legacy execCommand successful!');
        return true;
      } else {
        console.warn('⚠️ execCommand returned false');
      }
    } catch (error) {
      console.warn('⚠️ Legacy execCommand failed:', error);
    }
    
    try {
      // Method 3: Try Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        console.log('🎆 Method 3: Using Chrome extension messaging');
        
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { action: 'copyToClipboard', text: text },
            (response) => {
              if (response && response.success) {
                console.log('✅ Chrome extension clipboard successful!');
                resolve(true);
              } else {
                console.warn('⚠️ Chrome extension clipboard failed');
                resolve(false);
              }
            }
          );
        });
      }
    } catch (error) {
      console.warn('⚠️ Chrome extension method failed:', error);
    }
    
    // Method 4: Fallback - show text in a modal for manual copy
    console.log('🎆 Method 4: Fallback to manual copy modal');
    this.showTextCopyModal(text);
    return false;
  }
  
  showTextCopyModal(text) {
    console.log('📝 Showing manual copy modal');
    
    // Remove existing modal if any
    const existingModal = document.querySelector('#n9n-copy-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.id = 'n9n-copy-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
      <div style="
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 12px;
        padding: 24px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      ">
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        ">
          <h3 style="
            margin: 0;
            color: #fafafa;
            font-size: 18px;
            font-weight: 600;
          ">Copy Workflow JSON</h3>
          <button onclick="this.closest('#n9n-copy-modal').remove()" style="
            background: none;
            border: none;
            color: #a1a1aa;
            cursor: pointer;
            font-size: 20px;
            padding: 4px;
          ">×</button>
        </div>
        
        <p style="
          margin: 0 0 12px 0;
          color: #a1a1aa;
          font-size: 14px;
        ">Automatic clipboard copy failed. Please manually select and copy the JSON below:</p>
        
        <textarea readonly style="
          width: 100%;
          height: 300px;
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 6px;
          padding: 12px;
          color: #fafafa;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 12px;
          line-height: 1.4;
          resize: none;
          outline: none;
        ">${text}</textarea>
        
        <div style="
          display: flex;
          gap: 12px;
          margin-top: 16px;
          justify-content: flex-end;
        ">
          <button onclick="this.closest('#n9n-copy-modal').remove()" style="
            background: #27272a;
            border: 1px solid #3f3f46;
            border-radius: 6px;
            padding: 8px 16px;
            color: #fafafa;
            cursor: pointer;
            transition: all 0.2s;
          ">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-select the text
    const textarea = modal.querySelector('textarea');
    setTimeout(() => {
      textarea.select();
      textarea.setSelectionRange(0, 99999);
    }, 100);
  }

  async injectWorkflowFromMessage(messageId) {
    console.log('🚀 Starting workflow injection for message ID:', messageId);

    try {
      // Find the message and extract workflow JSON
      console.log('📋 Getting messages from chat manager...');
      const messages = await window.chatManager.getMessages();
      console.log('✅ Retrieved', messages.length, 'messages');

      const message = messages.find(m => m.id === messageId);
      if (!message) {
        console.error('❌ Message not found with ID:', messageId);
        this.showNotification('❌ Message not found', 'error');
        return;
      }

      console.log('✅ Found message:', message.content.substring(0, 100) + '...');

      if (!message.content.includes('```json')) {
        console.warn('⚠️ Message does not contain JSON code block');
        this.showNotification('⚠️ No workflow JSON found in message', 'error');
        return;
      }

      console.log('🔍 Extracting JSON from message...');
      const jsonMatch = message.content.match(/```json\n([\s\S]*?)\n```/);

      if (!jsonMatch) {
        console.error('❌ Could not extract JSON from message');
        this.showNotification('❌ Invalid JSON format', 'error');
        return;
      }

      console.log('📄 Raw JSON length:', jsonMatch[1].length, 'characters');
      console.log('📄 JSON preview:', jsonMatch[1].substring(0, 200) + '...');

      let workflow;
      try {
        workflow = JSON.parse(jsonMatch[1]);
        console.log('✅ Successfully parsed JSON workflow');
        console.log('🔧 Workflow has', Object.keys(workflow).length, 'top-level properties');
        if (workflow.nodes) {
          console.log('📦 Workflow contains', workflow.nodes.length, 'nodes');
        }
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        this.showNotification('❌ Invalid JSON format: ' + parseError.message, 'error');
        return;
      }

      // Check current page context
      const currentUrl = window.location.href;
      const hostname = window.location.hostname;
      const port = window.location.port;
      const pathname = window.location.pathname;
      console.log('🌐 Current URL:', currentUrl);
      console.log('🏠 Current hostname:', hostname);
      console.log('🔌 Current port:', port);
      console.log('📁 Current pathname:', pathname);
      
      // Improved n8n page detection
      const isN8nPage = hostname.includes('n8n') || 
                       hostname.includes('localhost') || 
                       port === '5678' || 
                       pathname.includes('/workflow') ||
                       pathname.includes('/home/workflows') ||
                       currentUrl.includes('n8n');
      console.log('🔍 Is n8n page?', isN8nPage);

      if (isN8nPage) {
        console.log('🎯 Attempting to inject workflow into n8n canvas...');
        await this.injectIntoN8nCanvas(workflow, jsonMatch[1]);
      } else {
        console.log('📋 Not on n8n page, copying to clipboard as fallback');
        await this.copyToClipboard(jsonMatch[1]);
        this.showNotification('📋 Workflow copied! Open n8n and paste (Ctrl+V)', 'info');
      }

    } catch (error) {
      console.error('💥 Critical error in injectWorkflowFromMessage:', error);
      console.error('📊 Error stack:', error.stack);
      this.showNotification('❌ Failed to inject workflow: ' + error.message, 'error');
    }
  }

  async injectIntoN8nCanvas(workflow, rawJson) {
    console.log('🎨 Starting n8n canvas injection...');

    // Check for n8n application context
    const n8nChecks = {
      'window.n8n': !!window.n8n,
      'window.$nuxt': !!window.$nuxt,
      'window.Vue': !!window.Vue,
      'window.__NUXT__': !!window.__NUXT__,
      'n8n app element': !!document.querySelector('#app'),
      'n8n canvas': !!document.querySelector('[data-test-id="canvas"]'),
      'n8n workflow': !!document.querySelector('.workflow-canvas'),
      'vuex store': !!window.$nuxt?.$store
    };

    console.log('🔍 n8n Environment checks:', n8nChecks);

    // Try multiple injection methods
    let injectionSuccessful = false;

    // Method 1: Try n8n API if available
    if (window.n8n && window.n8n.importWorkflow) {
      console.log('🚀 Method 1: Using n8n.importWorkflow API');
      try {
        await window.n8n.importWorkflow(workflow);
        console.log('✅ Method 1 successful!');
        injectionSuccessful = true;
      } catch (error) {
        console.warn('⚠️ Method 1 failed:', error);
      }
    }

    // Method 2: Try Nuxt/Vue store injection
    if (!injectionSuccessful && window.$nuxt?.$store) {
      console.log('🚀 Method 2: Using Nuxt store injection');
      try {
        // Try to dispatch workflow import action
        await window.$nuxt.$store.dispatch('workflows/importWorkflow', workflow);
        console.log('✅ Method 2 successful!');
        injectionSuccessful = true;
      } catch (error) {
        console.warn('⚠️ Method 2 failed:', error);
      }
    }

    // Method 3: Try simulating paste event
    if (!injectionSuccessful) {
      console.log('🚀 Method 3: Simulating paste event');
      try {
        await navigator.clipboard.writeText(rawJson);

        // Find canvas or app container
        const canvas = document.querySelector('[data-test-id="canvas"]') ||
          document.querySelector('.workflow-canvas') ||
          document.querySelector('#app');

        if (canvas) {
          console.log('📌 Found canvas element, simulating paste...');
          canvas.focus();

          // Create and dispatch paste event
          const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
            bubbles: true,
            cancelable: true
          });

          // Add data to clipboard event
          pasteEvent.clipboardData.setData('text/plain', rawJson);

          canvas.dispatchEvent(pasteEvent);
          console.log('✅ Method 3: Paste event dispatched');
          injectionSuccessful = true;
        } else {
          console.warn('⚠️ Method 3: No canvas element found');
        }
      } catch (error) {
        console.warn('⚠️ Method 3 failed:', error);
      }
    }

    // Method 4: Try keyboard shortcut simulation
    if (!injectionSuccessful) {
      console.log('🚀 Method 4: Keyboard shortcut simulation');
      try {
        await navigator.clipboard.writeText(rawJson);

        // Simulate Ctrl+V
        const keyEvent = new KeyboardEvent('keydown', {
          key: 'v',
          code: 'KeyV',
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        });

        document.dispatchEvent(keyEvent);
        console.log('✅ Method 4: Keyboard event dispatched');
        injectionSuccessful = true;
      } catch (error) {
        console.warn('⚠️ Method 4 failed:', error);
      }
    }

    // Final result
    if (injectionSuccessful) {
      console.log('🎉 Workflow injection completed successfully!');
      this.showNotification('⚡ Workflow injected into n8n!', 'success');
    } else {
      console.log('📋 All injection methods failed, falling back to clipboard');
      await navigator.clipboard.writeText(rawJson);
      this.showNotification('📋 Workflow copied to clipboard. Try pasting (Ctrl+V) in n8n.', 'info');
    }

    // Additional debugging info
    console.log('🔧 Available global objects:');
    const globalObjects = ['n8n', '$nuxt', 'Vue', '__NUXT__', '$store', 'app'];
    globalObjects.forEach(obj => {
      if (window[obj]) {
        console.log(`  ✅ window.${obj}:`, typeof window[obj]);
        if (window[obj] && typeof window[obj] === 'object') {
          console.log(`    Properties:`, Object.keys(window[obj]).slice(0, 10));
        }
      } else {
        console.log(`  ❌ window.${obj}: undefined`);
      }
    });
  }

  updateConversationPill(chatManager) {
    // Conversation pill was removed from UI - this function is now a no-op
    // const pill = this.sidebar.querySelector('#current-convo-pill');
    // const titleSpan = this.sidebar.querySelector('#convo-title');

    // const title = chatManager.getCurrentConversationTitle();
    // if (title) {
    //   titleSpan.textContent = title;
    //   pill.style.display = 'flex';
    // } else {
    //   pill.style.display = 'none';
    // }
    console.log('💬 Conversation pill functionality removed from UI');
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