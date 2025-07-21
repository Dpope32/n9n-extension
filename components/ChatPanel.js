// ChatPanel - Main chat interface component
// Non-module version for browser extension compatibility

(function() {
  'use strict';
  
  window.ChatPanel = class ChatPanel {
    constructor(container) {
      if (!container) {
        throw new Error('Container is required');
      }

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
        // Always authenticate for seamless chat experience
        this.state.isAuthenticated = true;
        this.state.user = user;
        
        this.state.isLoading = false;
      } catch (error) {
        console.error('Failed to load chat state:', error);
        this.state.error = error.message;
        this.state.isLoading = false;
      }
    }
  
    render() {
      if (this.state.isLoading) {
        this.container.innerHTML = `
          <div class="n9n-loading">
            <div class="n9n-spinner"></div>
            <p>Loading...</p>
          </div>
        `;
        return;
      }

      if (this.state.error) {
        this.container.innerHTML = `
          <div class="n9n-error">
            <h3>Error</h3>
            <p>${this.state.error}</p>
            <button class="n9n-btn" data-action="retry">Retry</button>
          </div>
        `;
        return;
      }

      if (!this.state.isAuthenticated) {
        this.container.innerHTML = this.uiService.renderAuth();
        return;
      }

      this.container.innerHTML = `
        ${this.uiService.renderHeader(this.state.isAuthenticated, this.state.user)}
        <div class="n9n-chat-container">
          <div class="n9n-messages" id="n9n-messages"></div>
          <div class="n9n-input-area">
            <div class="n9n-input-wrapper">
              <textarea 
                id="n9n-chat-input" 
                placeholder="Describe the workflow you want to create..."
                rows="1"
              ></textarea>
              <button class="n9n-send-btn" id="n9n-send-btn" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="n9n-actions">
              <button class="n9n-btn n9n-btn-secondary" data-action="clear-history">Clear History</button>
              <button class="n9n-btn n9n-btn-secondary" data-action="new-conversation">New Chat</button>
            </div>
          </div>
        </div>
      `;

      this.renderMessages();
    }

    renderMessages() {
      const messagesContainer = document.getElementById('n9n-messages');
      if (!messagesContainer) return;

      const messages = this.chatService.getMessages();
      
      if (messages.length === 0) {
        messagesContainer.innerHTML = `
          <div class="n9n-welcome">
            <h3>Welcome to n9n AI Copilot!</h3>
            <p>Describe the workflow you want to create and I'll generate the n8n configuration for you.</p>
            <div class="n9n-suggestions">
              <button class="n9n-suggestion" data-suggestion="Create a workflow that sends a daily email report">
                📧 Daily email report
              </button>
              <button class="n9n-suggestion" data-suggestion="Set up a webhook to process form submissions">
                🔗 Process form submissions  
              </button>
              <button class="n9n-suggestion" data-suggestion="Create an automation to backup files to Google Drive">
                💾 Backup files to Drive
              </button>
            </div>
          </div>
        `;
        return;
      }

      messagesContainer.innerHTML = messages.map(message => `
        <div class="n9n-message n9n-message-${message.role}">
          <div class="n9n-message-avatar">
            ${message.role === 'user' ? '👤' : '🤖'}
          </div>
          <div class="n9n-message-content">
            ${this.formatMessageContent(message.content)}
            <div class="n9n-message-time">
              ${new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      `).join('');

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessageContent(content) {
      // Handle code blocks
      content = content.replace(/```json\n([\s\S]*?)\n```/g, (match, code) => {
        return `
          <div class="n9n-code-block">
            <div class="n9n-code-header">
              <span>Workflow JSON</span>
              <button class="n9n-copy-btn" data-copy="${encodeURIComponent(code)}">
                📋 Copy
              </button>
            </div>
            <pre><code>${this.escapeHtml(code)}</code></pre>
          </div>
        `;
      });

      // Handle other code blocks
      content = content.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
        return `<div class="n9n-code-block"><pre><code>${this.escapeHtml(code)}</code></pre></div>`;
      });

      // Handle inline code
      content = content.replace(/`([^`]+)`/g, '<code class="n9n-inline-code">$1</code>');

      // Handle line breaks
      content = content.replace(/\n/g, '<br>');

      return content;
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    setupEventListeners() {
      this.container.addEventListener('click', async (e) => {
        const target = e.target;
        const action = target.dataset.action;

        switch (action) {
          case 'sign-in':
            this.state.isAuthenticated = true;
            this.render();
            break;

          case 'clear-history':
            await this.chatService.clearHistory();
            this.renderMessages();
            break;

          case 'new-conversation':
            await this.chatService.startNewConversation();
            this.renderMessages();
            break;

          case 'retry':
            this.state.error = null;
            await this.loadState();
            this.render();
            break;
        }

        if (target.classList.contains('n9n-suggestion')) {
          const suggestion = target.dataset.suggestion;
          if (suggestion) {
            const input = document.getElementById('n9n-chat-input');
            if (input) {
              input.value = suggestion;
              input.dispatchEvent(new Event('input'));
            }
          }
        }

        if (target.classList.contains('n9n-copy-btn')) {
          const code = decodeURIComponent(target.dataset.copy);
          navigator.clipboard.writeText(code);
          
          const originalText = target.textContent;
          target.textContent = '✅ Copied!';
          setTimeout(() => {
            target.textContent = originalText;
          }, 2000);
        }
      });

      // Input handling
      this.container.addEventListener('input', (e) => {
        if (e.target.id === 'n9n-chat-input') {
          const sendBtn = document.getElementById('n9n-send-btn');
          if (sendBtn) {
            sendBtn.disabled = !e.target.value.trim();
          }
          
          // Auto-resize textarea
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        }
      });

      // Send message on Enter (but allow Shift+Enter for new lines)
      this.container.addEventListener('keydown', async (e) => {
        if (e.target.id === 'n9n-chat-input' && e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          await this.sendMessage();
        }
      });

      // Send button click
      this.container.addEventListener('click', async (e) => {
        if (e.target.id === 'n9n-send-btn' || e.target.closest('#n9n-send-btn')) {
          await this.sendMessage();
        }
      });
    }

    async sendMessage() {
      const input = document.getElementById('n9n-chat-input');
      const sendBtn = document.getElementById('n9n-send-btn');
      
      if (!input || !input.value.trim()) return;

      const message = input.value.trim();
      input.value = '';
      input.style.height = 'auto';
      
      if (sendBtn) sendBtn.disabled = true;

      try {
        // Add user message to display immediately
        this.renderMessages();

        // Send message and get response
        await this.chatService.sendMessage(message);
        
        // Re-render messages with response
        this.renderMessages();
        
      } catch (error) {
        console.error('Failed to send message:', error);
        // Show error in chat
      } finally {
        if (sendBtn) sendBtn.disabled = false;
        input.focus();
      }
    }

    loadStyles() {
      if (document.getElementById('n9n-chat-styles')) return;

      const styles = document.createElement('style');
      styles.id = 'n9n-chat-styles';
      styles.textContent = `
        /* Chat Panel Styles */
        .n9n-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #888;
        }

        .n9n-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #333;
          border-top: 3px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .n9n-error {
          padding: 20px;
          text-align: center;
          color: #ff6b6b;
        }

        .n9n-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #2a2a2a;
          background: #1a1a1a;
        }

        .n9n-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: white;
        }

        .n9n-logo svg {
          color: #4285f4;
        }

        .n9n-auth {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px 20px;
          text-align: center;
        }

        .n9n-auth h3 {
          margin: 0 0 8px 0;
          color: white;
        }

        .n9n-auth p {
          margin: 0 0 24px 0;
          color: #888;
        }

        .n9n-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: 1px solid #404040;
          background: #2a2a2a;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .n9n-btn:hover {
          background: #3a3a3a;
          border-color: #505050;
        }

        .n9n-btn-primary {
          background: #4285f4;
          border-color: #4285f4;
        }

        .n9n-btn-primary:hover {
          background: #3367d6;
        }

        .n9n-btn-secondary {
          background: transparent;
          font-size: 12px;
          padding: 8px 12px;
        }

        .n9n-chat-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 80px);
        }

        .n9n-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .n9n-welcome {
          text-align: center;
          color: #888;
        }

        .n9n-welcome h3 {
          color: white;
          margin-bottom: 8px;
        }

        .n9n-suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 20px;
        }

        .n9n-suggestion {
          padding: 12px;
          border: 1px solid #2a2a2a;
          background: transparent;
          color: #888;
          border-radius: 8px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }

        .n9n-suggestion:hover {
          border-color: #404040;
          color: white;
        }

        .n9n-message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .n9n-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2a2a2a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .n9n-message-content {
          flex: 1;
          padding: 12px;
          background: #1e1e1e;
          border-radius: 12px;
          color: white;
        }

        .n9n-message-user .n9n-message-content {
          background: #2a4a8a;
        }

        .n9n-message-time {
          font-size: 11px;
          color: #666;
          margin-top: 8px;
        }

        .n9n-code-block {
          margin: 12px 0;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          overflow: hidden;
        }

        .n9n-code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #222;
          border-bottom: 1px solid #2a2a2a;
          font-size: 12px;
          color: #888;
        }

        .n9n-copy-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .n9n-copy-btn:hover {
          background: #333;
          color: white;
        }

        .n9n-code-block pre {
          margin: 0;
          padding: 12px;
          background: #1a1a1a;
          color: #e6e6e6;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          line-height: 1.4;
          overflow-x: auto;
        }

        .n9n-inline-code {
          background: #2a2a2a;
          color: #e6e6e6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
        }

        .n9n-input-area {
          padding: 20px;
          border-top: 1px solid #2a2a2a;
          background: #1a1a1a;
        }

        .n9n-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        #n9n-chat-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #404040;
          background: #2a2a2a;
          color: white;
          border-radius: 8px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.4;
          min-height: 44px;
          max-height: 120px;
        }

        #n9n-chat-input::placeholder {
          color: #666;
        }

        #n9n-chat-input:focus {
          outline: none;
          border-color: #4285f4;
        }

        .n9n-send-btn {
          width: 44px;
          height: 44px;
          border: none;
          background: #4285f4;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .n9n-send-btn:disabled {
          background: #333;
          cursor: not-allowed;
        }

        .n9n-send-btn:not(:disabled):hover {
          background: #3367d6;
        }

        .n9n-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }
      `;
      
      document.head.appendChild(styles);
    }
  };

})(); 