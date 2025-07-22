// ChatPanel.js - Main chat interface component for the sidebar
export class ChatPanel {
  constructor(container) {
    this.container = container;
    this.chatManager = null;
    this.init();
  }

  async init() {
    try {
      // Initialize ChatManager
      this.chatManager = new window.ChatManager();
      
      // Wait a bit for Supabase initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.render();
      this.setupEventListeners();
      
      console.log('✅ ChatPanel initialized');
    } catch (error) {
      console.error('❌ Failed to initialize ChatPanel:', error);
      this.renderError(error);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-panel-container" style="
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #1f1f1f;
        color: #ffffff;
      ">
        <!-- Messages Container -->
        <div id="messages-container" style="
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        "></div>
        
        <!-- Input Area -->
        <div style="
          border-top: 1px solid #404040;
          background: #2a2a2a;
          padding: 16px;
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <input 
              id="chat-input"
              type="text"
              placeholder="How can I help you?"
              style="
                flex: 1;
                background: #404040;
                border: 1px solid #555555;
                border-radius: 8px;
                padding: 12px 16px;
                color: #ffffff;
                font-size: 14px;
                line-height: 1.4;
                outline: none;
                transition: all 0.2s;
                font-family: inherit;
              "
            >
            <button id="send-btn" disabled style="
              background: #6366f1;
              border: none;
              border-radius: 8px;
              width: 40px;
              height: 40px;
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
        </div>
      </div>
    `;

    this.renderWelcomeMessage();
  }

  setupEventListeners() {
    const input = this.container.querySelector('#chat-input');
    const sendBtn = this.container.querySelector('#send-btn');

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      input.addEventListener('input', (e) => {
        if (sendBtn) {
          sendBtn.disabled = !e.target.value.trim();
          sendBtn.style.opacity = e.target.value.trim() ? '1' : '0.5';
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.sendMessage();
      });
    }
  }

  async sendMessage() {
    const input = this.container.querySelector('#chat-input');
    const sendBtn = this.container.querySelector('#send-btn');
    
    if (!input || !input.value.trim()) return;

    const message = input.value.trim();
    
    // Clear input immediately
    input.value = '';
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.5';
    }

    try {
      // Add user message
      await this.chatManager.addMessage('user', message);
      
      // Render messages
      const messages = await this.chatManager.getMessages();
      this.renderMessages(messages);

      // Show typing indicator
      this.addTypingIndicator();

      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = this.generateAIResponse(message);
      await this.chatManager.addMessage('assistant', aiResponse.content, aiResponse.metadata);
      
      // Remove typing indicator and render updated messages
      this.removeTypingIndicator();
      const updatedMessages = await this.chatManager.getMessages();
      this.renderMessages(updatedMessages);
      
      // Handle conversation management
      await this.chatManager.handleMessageExchange(message);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      this.removeTypingIndicator();
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
      }
    }
  }

  renderWelcomeMessage() {
    const messagesContainer = this.container.querySelector('#messages-container');
    if (!messagesContainer) return;

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
        <div style="font-size: 48px; margin-bottom: 16px;">🤖</div>
        <h3 style="
          margin: 0 0 12px 0; 
          font-size: 18px; 
          font-weight: 600; 
          color: #ffffff;
        ">Welcome to n9n AI Copilot</h3>
        <p style="
          margin: 0 0 24px 0; 
          font-size: 14px; 
          line-height: 1.5;
          color: #888;
        ">I can help you create n8n workflows through natural conversation. Just describe what you want to automate!</p>
      </div>
    `;
  }

  renderMessages(messages) {
    const messagesContainer = this.container.querySelector('#messages-container');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = messages.map(message => {
      const isUser = message.role === 'user';
      const timeAgo = this.getTimeAgo(message.timestamp);
      
      return `
        <div style="
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 4px 16px;
          margin-bottom: 16px;
          ${isUser ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
        ">
          ${!isUser ? `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              font-size: 16px;
              color: #ffffff;
            ">
              🤖
            </div>
          ` : ''}
          
          <div style="
            max-width: ${isUser ? '80%' : '85%'};
            ${isUser ? 'order: 1;' : ''}
          ">
            <div style="
              background: ${isUser ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.05)'};
              color: #ffffff;
              padding: 12px 16px;
              border-radius: 18px;
              ${isUser ? 'border-bottom-right-radius: 4px;' : 'border-bottom-left-radius: 4px;'}
              border: ${isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
              font-size: 14px;
              line-height: 1.5;
              word-wrap: break-word;
              box-shadow: ${isUser ? '0 2px 8px rgba(99, 102, 241, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.2)'};
            ">
              ${this.formatMessageContent(message.content)}
            </div>
            
            <div style="
              font-size: 11px;
              color: #6b7280;
              margin-top: 4px;
              ${isUser ? 'text-align: right;' : 'text-align: left;'}
              padding: 0 4px;
            ">
              ${timeAgo}
            </div>
          </div>
          
          ${isUser ? `
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #4b5563;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              font-size: 16px;
              color: #ffffff;
              order: 2;
            ">
              👤
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addTypingIndicator() {
    const messagesContainer = this.container.querySelector('#messages-container');
    if (!messagesContainer) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div style="
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 4px 16px;
        margin-bottom: 16px;
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 16px;
          color: #ffffff;
        ">🤖</div>
        <div style="
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 16px;
          border-radius: 18px;
          border-bottom-left-radius: 4px;
          display: flex;
          gap: 4px;
          align-items: center;
        ">
          <span style="
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #6b7280;
            animation: typing 1.4s infinite ease-in-out;
          "></span>
          <span style="
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #6b7280;
            animation: typing 1.4s infinite ease-in-out;
            animation-delay: 0.2s;
          "></span>
          <span style="
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #6b7280;
            animation: typing 1.4s infinite ease-in-out;
            animation-delay: 0.4s;
          "></span>
        </div>
      </div>
    `;
    
    // Add animation styles if not present
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
    
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const indicator = this.container.querySelector('.typing-indicator');
    if (indicator) indicator.remove();
  }

  generateAIResponse(userMessage) {
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

  renderError(error) {
    this.container.innerHTML = `
      <div style="
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 40px 20px;
        color: #ef4444;
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h3 style="margin-bottom: 8px;">Error</h3>
        <p style="font-size: 14px; color: #9ca3af;">${error.message || 'Unknown error occurred'}</p>
        <button onclick="location.reload()" style="
          margin-top: 16px;
          padding: 10px 20px;
          background: #6366f1;
          border: none;
          border-radius: 6px;
          color: #ffffff;
          cursor: pointer;
        ">Retry</button>
      </div>
    `;
  }
}
