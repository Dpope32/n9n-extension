// n9n AI Copilot - Updated Consolidated Version with fixes
// Fixed: sidebar width 320px, removed Daily email reports and Sync Google Sheets buttons

// ============================================================================
// UIService - Handles all UI rendering and interactions with fixes
// ============================================================================
window.UIService = class UIService {
  constructor(container) {
    this.container = container;
  }

  renderHeader(isAuthenticated, user) {
    return `
      <div class="n9n-header">
        <div class="n9n-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          <span>n9n AI Copilot</span>
        </div>
        <button class="n9n-hamburger" data-action="close-panel" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 8px; border-radius: 4px; transition: all 0.2s;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
  }

  renderAuth() {
    return `
      <div class="n9n-auth">
        <div class="n9n-auth-content">
          <h3>Welcome to n9n AI Copilot</h3>
          <p>AI-powered workflow assistant for n8n</p>
          <button class="n9n-btn n9n-btn-primary" data-action="sign-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            </svg>
            Continue with Demo
          </button>
        </div>
      </div>
    `;
  }

  renderChat(messages) {
    return `
      <div class="n9n-chat">
        <div class="n9n-messages" id="messages-container">
          ${messages.length > 0 ? messages.map(msg => this.renderMessage(msg)).join('') : this.renderEmptyState()}
        </div>
        ${this.renderInputArea()}
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div class="n9n-empty-state">
        <h3>Ready to build amazing workflows?</h3>
        <p>Describe what you want to automate and I'll help you create the perfect n8n workflow.</p>
      </div>
    `;
  }

  renderMessage(message) {
    const isUser = message.role === 'user';
    const timeAgo = this.getTimeAgo(message.timestamp);
    
    return `
      <div class="n9n-message ${isUser ? 'n9n-message-user' : 'n9n-message-assistant'}">
        <div class="n9n-message-avatar">
          ${isUser ? 
            `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="background: #404040; border-radius: 50%; padding: 6px;">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#9ca3af" stroke-width="2"/>
            </svg>` :
            `<img src="${chrome.runtime.getURL('assets/void.png')}" alt="AI" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`
          }
        </div>
        <div class="n9n-message-content">
          <div class="n9n-message-text">${this.formatMessageContent(message.content)}</div>
          <div class="n9n-message-time">${timeAgo}</div>
          ${!isUser && message.content.includes('workflow') ? this.renderWorkflowActions(message) : ''}
        </div>
      </div>
    `;
  }

  renderWorkflowActions(message) {
    return `
      <div class="n9n-workflow-actions">
        <button class="n9n-action-btn" data-action="inject-workflow" data-message-id="${message.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Add to n8n
        </button>
      </div>
    `;
  }

  // FIXED: renderInputArea with proper bottom positioning and NO suggestions
  renderInputArea() {
    return `
      <div class="n9n-input-area">
        <div class="n9n-input-container">
          <textarea 
            placeholder="What should this workflow do?" 
            id="chat-input"
            rows="1"
            maxlength="2000"
          ></textarea>
          <button class="n9n-send-btn" id="send-btn" data-action="send-message" disabled>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  // Helper methods
  formatMessageContent(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/```json\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
      .replace(/\n/g, '<br>');
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

  getDefaultAvatar() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xMiAxNmEzIDMgMCAwIDEtMy0zaDZhMyAzIDAgMCAxLTMgMyIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Im0xNSA5YTMgMyAwIDEgMS02IDAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `n9n-notification n9n-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('n9n-notification-show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('n9n-notification-show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  updateMessages(messages) {
    const messagesContainer = this.container.querySelector('#messages-container');
    if (messagesContainer) {
      messagesContainer.innerHTML = messages.length > 0 ? 
        messages.map(msg => this.renderMessage(msg)).join('') : 
        this.renderEmptyState();
      
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  addTypingIndicator() {
    const messagesContainer = this.container.querySelector('#messages-container');
    if (messagesContainer) {
      const indicator = document.createElement('div');
      indicator.innerHTML = '<div class="n9n-typing-dots"><span></span><span></span><span></span></div>';
      indicator.className = 'n9n-typing-indicator';
      
      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  removeTypingIndicator() {
    const indicator = this.container.querySelector('.n9n-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
};

// ============================================================================
// ChatService - Handles chat functionality
// ============================================================================
window.ChatService = class ChatService {
  constructor() {
    this.messages = [];
    this.currentConversationId = null;
  }

  async initializeChat() {
    // Mock initialization
    return {
      email: 'demo@example.com',
      user_metadata: {
        full_name: 'Demo User',
        avatar_url: null
      }
    };
  }

  getMessages() {
    return this.messages;
  }

  async sendMessage(content) {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      timestamp: new Date().toISOString()
    };

    this.messages.push(userMessage);

    // Generate AI response with actual workflow JSON
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate workflow based on user request
    const workflow = this.generateWorkflow(content);
    
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      role: 'assistant', 
      content: `I'll help you create that workflow! Here's a custom n8n workflow for: "${content}"

\`\`\`json
${JSON.stringify(workflow, null, 2)}
\`\`\`

**Workflow Name:** ${workflow.name}  
Click **⚡ Inject** to add this workflow directly to your n8n instance!`,
      timestamp: new Date().toISOString()
    };

    this.messages.push(aiResponse);
  }

  async startNewConversation() {
    this.messages = [];
    this.currentConversationId = Date.now().toString();
  }

  async clearHistory() {
    this.messages = [];
  }

  generateWorkflow(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Extract workflow name if specified
    let workflowName = 'AI Generated Workflow';
    if (message.includes('name it')) {
      const nameMatch = message.match(/name it (.+?)(?:\.|$)/i);
      if (nameMatch) {
        workflowName = nameMatch[1].trim();
      }
    }
    
    // Generate appropriate workflow based on request
    if (message.includes('simple') || message.includes('basic')) {
      return this.createSimpleWorkflow(workflowName);
    } else if (message.includes('email')) {
      return this.createEmailWorkflow(workflowName);
    } else if (message.includes('webhook')) {
      return this.createWebhookWorkflow(workflowName);
    } else if (message.includes('schedule') || message.includes('cron')) {
      return this.createScheduledWorkflow(workflowName);
    } else {
      return this.createSimpleWorkflow(workflowName);
    }
  }

  createSimpleWorkflow(name) {
    return {
      name: name,
      nodes: [
        {
          parameters: {},
          id: "manual-trigger-1",
          name: "Manual Trigger",
          type: "n8n-nodes-base.manualTrigger",
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: "// Process your data here\nconst result = {\n  timestamp: new Date().toISOString(),\n  message: 'Workflow executed successfully!',\n  data: $input.all()\n};\n\nreturn [{ json: result }];"
          },
          id: "function-1",
          name: "Process Data",
          type: "n8n-nodes-base.function",
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        "Manual Trigger": {
          main: [
            [
              {
                node: "Process Data",
                type: "main",
                index: 0
              }
            ]
          ]
        }
      },
      active: false,
      settings: {
        executionOrder: "v1"
      }
    };
  }

  createEmailWorkflow(name) {
    return {
      name: name,
      nodes: [
        {
          parameters: {},
          id: "manual-trigger-1",
          name: "Manual Trigger",
          type: "n8n-nodes-base.manualTrigger",
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            toEmail: "recipient@example.com",
            subject: "Test Email from n8n",
            text: "This is a test email sent from your n8n workflow!"
          },
          id: "email-send-1",
          name: "Send Email",
          type: "n8n-nodes-base.emailSend",
          typeVersion: 2,
          position: [450, 300]
        }
      ],
      connections: {
        "Manual Trigger": {
          main: [[{ node: "Send Email", type: "main", index: 0 }]]
        }
      },
      active: false,
      settings: { executionOrder: "v1" }
    };
  }

  createWebhookWorkflow(name) {
    return {
      name: name,
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "webhook-endpoint"
          },
          id: "webhook-1",
          name: "Webhook",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            values: {
              string: [
                {
                  name: "response",
                  value: "Webhook received successfully!"
                }
              ]
            }
          },
          id: "set-1",
          name: "Set Response",
          type: "n8n-nodes-base.set",
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        "Webhook": {
          main: [[{ node: "Set Response", type: "main", index: 0 }]]
        }
      },
      active: false,
      settings: { executionOrder: "v1" }
    };
  }

  createScheduledWorkflow(name) {
    return {
      name: name,
      nodes: [
        {
          parameters: {
            triggerTimes: {
              item: [{ hour: 9, minute: 0 }]
            }
          },
          id: "cron-1",
          name: "Cron",
          type: "n8n-nodes-base.cron",
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: "// Scheduled task\nconst now = new Date();\nreturn [{\n  json: {\n    executedAt: now.toISOString(),\n    message: 'Scheduled task executed'\n  }\n}];"
          },
          id: "function-1",
          name: "Scheduled Task",
          type: "n8n-nodes-base.function",
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        "Cron": {
          main: [[{ node: "Scheduled Task", type: "main", index: 0 }]]
        }
      },
      active: false,
      settings: { executionOrder: "v1" }
    };
  }

  async loadConversation(conversationId) {
    // Mock conversation loading
    this.currentConversationId = conversationId;
    return true;
  }
};

// ============================================================================
// ChatPanel - Main component with fixes
// ============================================================================
window.ChatPanel = class ChatPanel {
  constructor(container) {
    this.container = container;
    this.chatService = null;
    this.uiService = null;
    
    this.state = {
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    };
    
    this.init();
  }

  async init() {
    this.chatService = new window.ChatService();
    this.uiService = new window.UIService(this.container);
    
    await this.loadState();
    this.render();
    this.setupEventListeners();
    this.loadStyles();
  }

  async loadState() {
    try {
      this.state.isLoading = true;
      
      const user = await this.chatService.initializeChat();
      if (user) {
        this.state.isAuthenticated = true;
        this.state.user = user;
      }
    } catch (error) {
      this.state.error = 'Failed to load user state';
      console.error('Load state error:', error);
    } finally {
      this.state.isLoading = false;
    }
  }

  render() {
    const messages = this.chatService ? this.chatService.getMessages() : [];
    
    this.container.innerHTML = `
      <div class="n9n-chat-panel" style="width: 320px;">
        ${this.uiService.renderHeader(this.state.isAuthenticated, this.state.user)}
        ${this.state.isAuthenticated ? 
          this.uiService.renderChat(messages) : 
          this.uiService.renderAuth()
        }
      </div>
    `;
  }

  setupEventListeners() {
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('keydown', this.handleKeydown.bind(this));
    this.container.addEventListener('input', this.handleInput.bind(this));
  }

  async handleClick(event) {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    event.preventDefault();

    switch (action) {
      case 'sign-in':
        await this.signIn();
        break;
      case 'send-message':
        await this.sendMessage();
        break;
      case 'inject-workflow':
        await this.injectWorkflow(event.target.dataset.messageId);
        break;
      case 'close-panel':
        // Close the sidebar when hamburger is clicked
        if (window.n9nCopilot) {
          window.n9nCopilot.toggleSidebar();
        }
        break;
    }
  }

  handleKeydown(event) {
    if (event.target.id === 'chat-input') {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        this.sendMessage();
      }
    }
  }

  handleInput(event) {
    if (event.target.id === 'chat-input') {
      const input = event.target;
      const sendBtn = this.container.querySelector('#send-btn');
      
      // Auto-resize textarea
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      
      // Enable/disable send button
      sendBtn.disabled = !input.value.trim();
      
      // Handle suggestions
      this.setupSuggestions();
    }
  }

  setupSuggestions() {
    const suggestions = this.container.querySelectorAll('.n9n-suggestion');
    const input = this.container.querySelector('#chat-input');
    const sendBtn = this.container.querySelector('#send-btn');
    
    suggestions.forEach(suggestion => {
      suggestion.onclick = () => {
        input.value = suggestion.dataset.suggestion;
        input.focus();
        sendBtn.disabled = false;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      };
    });
  }

  async signIn() {
    try {
      // Mock sign in for demo
      this.state.isAuthenticated = true;
      this.state.user = {
        email: 'demo@example.com',
        user_metadata: {
          full_name: 'Demo User',
          avatar_url: null
        }
      };
      this.render();
      this.uiService.showNotification('Signed in successfully!', 'success');
    } catch (error) {
      console.error('Sign in error:', error);
      this.uiService.showNotification('Failed to sign in. Please try again.', 'error');
    }
  }

  async sendMessage() {
    const input = this.container.querySelector('#chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Clear input
    input.value = '';
    input.style.height = 'auto';
    this.container.querySelector('#send-btn').disabled = true;

    // Add typing indicator
    this.uiService.addTypingIndicator();

    try {
      // Send message via chat service
      await this.chatService.sendMessage(message);
      
      // Update UI
      this.updateMessages();
      
    } catch (error) {
      console.error('Send message error:', error);
      this.uiService.showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      this.uiService.removeTypingIndicator();
    }
  }

  async injectWorkflow(messageId) {
    console.log('🔧 [INJECT] Starting workflow injection for message:', messageId);
    
    try {
      const messages = this.chatService.getMessages();
      const message = messages.find(m => m.id === messageId);
      
      console.log('🔧 [INJECT] Found message:', message);
      console.log('🔧 [INJECT] All messages:', messages);
      
      if (message && message.content.includes('```json')) {
        console.log('🔧 [INJECT] Message contains JSON workflow, extracting...');
        
        // Extract JSON workflow from the message content
        const jsonMatch = message.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            const workflowData = JSON.parse(jsonMatch[1]);
            console.log('🔧 [INJECT] Extracted workflow data:', workflowData);
            
            // Try to inject into current n8n page
            const injectionResult = await this.injectIntoN8N(workflowData);
            console.log('🔧 [INJECT] Injection result:', injectionResult);
            
            if (injectionResult.success) {
              this.uiService.showNotification('✅ Workflow injected successfully!', 'success');
            } else {
              console.error('🔧 [INJECT] Injection failed:', injectionResult.error);
              // Fallback to clipboard copy
              await this.copyToClipboard(JSON.stringify(workflowData, null, 2));
              this.uiService.showNotification('⚠️ Auto-inject failed. Workflow copied to clipboard!', 'warning');
            }
          } catch (parseError) {
            console.error('🔧 [INJECT] Failed to parse workflow JSON:', parseError);
            this.uiService.showNotification('❌ Invalid workflow JSON format', 'error');
          }
        } else {
          console.log('🔧 [INJECT] No JSON workflow found in message');
          this.uiService.showNotification('❌ No workflow JSON found in message', 'error');
        }
      } else {
        console.log('🔧 [INJECT] Message does not contain JSON workflow');
        this.uiService.showNotification('❌ No workflow found in message', 'error');
      }
    } catch (error) {
      console.error('🔧 [INJECT] Inject workflow error:', error);
      this.uiService.showNotification('❌ Failed to inject workflow: ' + error.message, 'error');
    }
  }
  
  async injectIntoN8N(workflowData) {
    console.log('🔧 [INJECT] Starting n8n injection process...');
    console.log('🔧 [INJECT] Current URL:', window.location.href);
    
    try {
      // Method 1: Try n8n REST API (most reliable)
      const n8nBaseUrl = this.detectN8nBaseUrl();
      if (n8nBaseUrl) {
        console.log('🔧 [INJECT] Found n8n base URL, trying API injection...', n8nBaseUrl);
        const apiResult = await this.injectViaAPI(workflowData, n8nBaseUrl);
        if (apiResult) {
          console.log('✅ API injection successful!');
          return { success: true, method: 'api' };
        } else {
          console.log('❌ API injection failed, trying other methods...');
        }
      } else {
        console.log('⚠️ Could not detect n8n base URL');
      }
      
      // Method 2: Try to redirect to "new workflow" page with data storage
      const currentUrl = window.location.href;
      if (currentUrl.includes('n8n') || currentUrl.includes('/workflow')) {
        console.log('🔧 [INJECT] On n8n page, trying redirect injection...');
        return await this.injectViaRedirect(workflowData);
      }
      
      console.log('🔧 [INJECT] No suitable injection method found');
      return { success: false, error: 'No suitable injection method available' };
      
    } catch (error) {
      console.error('🔧 [INJECT] Injection process failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  detectN8nBaseUrl() {
    const currentUrl = window.location.href;
    
    // Extract base URL from current page
    if (currentUrl.includes('n8n.cloud')) {
      return currentUrl.split('/workflow')[0].split('/home')[0];
    } else if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
      const urlObj = new URL(currentUrl);
      return `${urlObj.protocol}//${urlObj.host}`;
    } else if (currentUrl.match(/\d+\.\d+\.\d+\.\d+/)) {
      // IP address (like your 100.78.164.43:5678)
      const urlObj = new URL(currentUrl);
      return `${urlObj.protocol}//${urlObj.host}`;
    }
    
    return null;
  }
  
  async injectViaAPI(workflowData, baseUrl) {
    try {
      const apiUrl = `${baseUrl}/api/v1/workflows`;
      console.log('🔧 [API] Trying API endpoint:', apiUrl);
      
      // Get API key from storage
      const apiKey = await this.getN8nApiKey();
      console.log('🔧 [API] API Key available:', apiKey ? 'Yes' : 'No');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add API key if available
      if (apiKey) {
        headers['X-N8N-API-KEY'] = apiKey;
      }
      
      const requestBody = {
        name: workflowData.name || `AI Generated: ${new Date().toLocaleTimeString()}`,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings || { executionOrder: 'v1' }
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      console.log('🔧 [API] Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Workflow created successfully via API:', result);
        
        // Redirect to the new workflow
        if (result.id) {
          console.log('🔀 Redirecting to new workflow:', `${baseUrl}/workflow/${result.id}`);
          localStorage.setItem('n9n_auto_open_sidebar', 'true');
          window.location.href = `${baseUrl}/workflow/${result.id}`;
        }
        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ API request failed:', response.status, errorText);
        
        if (response.status === 401 && !apiKey) {
          console.log('🔑 No API key - prompting user');
          this.promptForApiKey();
        }
        return false;
      }
      
    } catch (error) {
      console.error('🔧 [API] API injection failed:', error);
      return false;
    }
  }
  
  async injectViaRedirect(workflowData) {
    try {
      const baseUrl = this.detectN8nBaseUrl();
      if (!baseUrl) return { success: false, error: 'Could not detect n8n base URL' };
      
      // Store workflow data for the new page to pick up
      localStorage.setItem('n9n_workflow_to_inject', JSON.stringify(workflowData));
      localStorage.setItem('n9n_auto_open_sidebar', 'true');
      console.log('🔧 [REDIRECT] Stored workflow data for injection');
      
      // Navigate to new workflow page
      const newWorkflowUrl = `${baseUrl}/workflow/new`;
      console.log('🔧 [REDIRECT] Redirecting to:', newWorkflowUrl);
      
      window.location.href = newWorkflowUrl;
      return { success: true, method: 'redirect' };
      
    } catch (error) {
      console.error('🔧 [REDIRECT] Redirect injection failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getN8nApiKey() {
    // Try to get API key from storage
    return new Promise((resolve) => {
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['n8n_api_key'], (result) => {
          if (chrome.runtime.lastError) {
            const localKey = localStorage.getItem('n8n_api_key');
            resolve(this.validateApiKey(localKey));
          } else {
            const key = result.n8n_api_key;
            if (key && this.validateApiKey(key)) {
              resolve(key);
            } else {
              const localKey = localStorage.getItem('n8n_api_key');
              resolve(this.validateApiKey(localKey));
            }
          }
        });
      } else {
        const key = localStorage.getItem('n8n_api_key');
        resolve(this.validateApiKey(key));
      }
    });
  }
  
  validateApiKey(key) {
    if (!key || typeof key !== 'string' || key.length < 10) {
      return null;
    }
    // Check if it's corrupted with workflow JSON
    if (key.startsWith('{') && key.includes('nodes')) {
      console.error('❌ CORRUPTED API KEY DETECTED! Clearing...');
      localStorage.removeItem('n8n_api_key');
      return null;
    }
    return key;
  }
  
  promptForApiKey() {
    // Simple prompt for now - you can enhance this with a modal later
    const apiKey = prompt('Enter your n8n API key to enable auto-injection:\n\n1. Go to n8n Settings > n8n API\n2. Create an API key\n3. Paste it here:');
    if (apiKey && apiKey.trim()) {
      const validatedKey = this.validateApiKey(apiKey.trim());
      if (validatedKey) {
        localStorage.setItem('n8n_api_key', validatedKey);
        if (chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ 'n8n_api_key': validatedKey });
        }
        this.uiService.showNotification('✅ API Key saved! Try injecting again.', 'success');
      } else {
        this.uiService.showNotification('❌ Invalid API key format', 'error');
      }
    }
  }
  
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback method
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
  
  trySetWorkflowViaDOM(workflowData) {
    console.log('🔧 [INJECT] Attempting to set workflow via DOM...');
    
    // Try to find import functionality
    const importBtn = document.querySelector('[data-test-id="import-workflow"]') ||
                     document.querySelector('button[title="Import"]');
    
    if (importBtn) {
      console.log('🔧 [INJECT] Found import button');
      importBtn.click();
      
      // Try to find textarea or input for workflow data
      setTimeout(() => {
        const textarea = document.querySelector('textarea[placeholder*="workflow"]') ||
                        document.querySelector('textarea[placeholder*="JSON"]') ||
                        document.querySelector('.monaco-editor textarea');
        
        if (textarea) {
          console.log('🔧 [INJECT] Found textarea, setting value');
          textarea.value = JSON.stringify(workflowData, null, 2);
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 500);
    }
  }

  updateMessages() {
    const messages = this.chatService.getMessages();
    this.uiService.updateMessages(messages);
    this.setupSuggestions(); // Re-setup suggestions after update
  }

  loadStyles() {
    if (document.querySelector('#n9n-chat-styles')) return;

    const style = document.createElement('style');
    style.id = 'n9n-chat-styles';
    
    // Embedded CSS - no need to fetch from file
    style.textContent = `
/* n9n AI Copilot Chat Panel Styles */
.n9n-chat-panel {
  width: 320px;
  height: 750px;
  background: linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%);
  border-radius: 16px;
  border: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.n9n-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid #2a2a2a;
}

.n9n-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
}

.n9n-logo svg {
  color: #6366f1;
}

.n9n-user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.n9n-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.n9n-menu-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.n9n-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.n9n-auth {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.n9n-auth-content {
  text-align: center;
  color: #ffffff;
}

.n9n-auth-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.n9n-auth-content p {
  margin: 0 0 24px 0;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.5;
}

.n9n-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.n9n-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
}

.n9n-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.n9n-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.n9n-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.n9n-messages::-webkit-scrollbar {
  width: 6px;
}

.n9n-messages::-webkit-scrollbar-track {
  background: transparent;
}

.n9n-messages::-webkit-scrollbar-thumb {
  background: #3a3a3a;
  border-radius: 3px;
}

.n9n-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #ffffff;
  padding: 40px 20px;
}

.n9n-empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.n9n-empty-state p {
  margin: 0 0 24px 0;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.5;
}

.n9n-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s;
}

.n9n-message:hover {
  background: rgba(255, 255, 255, 0.04);
}

.n9n-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.n9n-message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.n9n-assistant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.n9n-message-content {
  flex: 1;
  min-width: 0;
}

.n9n-message-text {
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.n9n-message-text code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 13px;
}

.n9n-message-time {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

.n9n-workflow-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.n9n-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  color: #d1d5db;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.n9n-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4a4a4a;
  color: #ffffff;
}

.n9n-typing-dots {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.n9n-typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6b7280;
  animation: n9n-typing 1.4s infinite ease-in-out;
}

.n9n-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.n9n-typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes n9n-typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.n9n-input-area {
  border-top: 1px solid #2a2a2a;
  background: rgba(255, 255, 255, 0.02);
}

.n9n-input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
}

.n9n-input-container textarea {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a3a;
  border-radius: 12px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.n9n-input-container textarea::-webkit-scrollbar {
  display: none;
}

.n9n-input-container textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.n9n-input-container textarea::placeholder {
  color: #6b7280;
}

.n9n-send-btn {
  background: #6366f1;
  border: none;
  border-radius: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.n9n-send-btn:hover:not(:disabled) {
  background: #5b21b6;
  transform: translateY(-1px);
}

.n9n-send-btn:disabled {
  background: #3a3a3a;
  cursor: not-allowed;
  opacity: 0.5;
}

.n9n-suggestions {
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
  flex-wrap: wrap;
}

.n9n-suggestion {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  padding: 6px 12px;
  color: #d1d5db;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.n9n-suggestion:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4a4a4a;
  color: #ffffff;
}

.n9n-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  z-index: 10000;
  transform: translateX(400px);
  transition: transform 0.3s ease;
  max-width: 300px;
}

.n9n-notification-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 1px solid #065f46;
}

.n9n-notification-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 1px solid #991b1b;
}

.n9n-notification-show {
  transform: translateX(0);
}

.n9n-hamburger:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}
    `;
    
    document.head.appendChild(style);
    console.log('✅ n9n styles loaded successfully (embedded)');
  }
};

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
      console.log('🚀 n9n AI Copilot initialized');
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

    // Create sidebar container - BOTTOM RIGHT FLOATING
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'n9n-copilot-sidebar';
    this.sidebar.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      height: 750px;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      z-index: 999999;
      transform: translateY(100%);
      transition: transform 0.3s ease;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(this.sidebar);

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
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      transition: all 0.2s ease;
    `;
    
    // Hover effects
    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.transform = 'translateY(-2px)';
      toggleButton.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.4)';
      toggleButton.style.background = '#2a2a2a';
    });
    
    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.transform = 'translateY(0)';
      toggleButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
      toggleButton.style.background = '#1a1a1a';
    });
    
    // Click handler
    toggleButton.addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    document.body.appendChild(toggleButton);
    console.log('✅ Toggle button created');
  }

  toggleSidebar() {
    if (!this.sidebar) return;
    
    this.isVisible = !this.isVisible;
    this.sidebar.style.transform = this.isVisible ? 'translateY(0%)' : 'translateY(100%)';
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
console.log('🚀 n9n AI Copilot loaded successfully (fixed version with 320px width and single suggestion)');
