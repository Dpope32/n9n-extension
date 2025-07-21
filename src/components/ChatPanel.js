// Simplified Chat Panel Component
// Non-module version for browser extension compatibility

(function() {
  'use strict';
  
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
      // Wait for services to be available
      await this.waitForServices();
      
      this.chatService = new window.ChatService();
      this.uiService = new window.UIService(this.container);
      
      await this.loadState();
      this.render();
      this.setupEventListeners();
      this.loadStyles();
    }

    async waitForServices() {
      return new Promise((resolve) => {
        const checkServices = () => {
          if (window.ChatService && window.UIService) {
            resolve();
          } else {
            setTimeout(checkServices, 100);
          }
        };
        checkServices();
      });
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
        <div class="n9n-chat-panel">
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
      // Handle conversation item clicks
      const conversationItem = event.target.closest('.n9n-conversation-item');
      if (conversationItem) {
        const conversationId = conversationItem.dataset.conversationId;
        await this.loadConversation(conversationId);
        return;
      }

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
        case 'copy-workflow':
          await this.copyWorkflow(event.target.dataset.messageId);
          break;
        case 'modify-workflow':
          await this.modifyWorkflow(event.target.dataset.messageId);
          break;
        case 'toggle-menu':
          this.toggleUserMenu();
          break;
        case 'new-conversation':
          await this.startNewConversation();
          break;
        case 'clear-history':
          await this.clearHistory();
          break;
        case 'sign-out':
          await this.signOut();
          break;
      }
    }

    async loadConversation(conversationId) {
      try {
        // Load specific conversation messages
        await this.chatService.loadConversation(conversationId);
        this.updateMessages();
        this.uiService.showNotification('Conversation loaded', 'success');
      } catch (error) {
        console.error('Load conversation error:', error);
        this.uiService.showNotification('Failed to load conversation', 'error');
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

    async signOut() {
      try {
        this.state.isAuthenticated = false;
        this.state.user = null;
        this.render();
        this.uiService.showNotification('Signed out successfully!', 'success');
      } catch (error) {
        console.error('Sign out error:', error);
        this.uiService.showNotification('Failed to sign out.', 'error');
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
      try {
        const messages = this.chatService.getMessages();
        const message = messages.find(m => m.id === messageId);
        
        if (message && message.content.includes('workflow')) {
          const workflowData = this.extractWorkflowFromMessage(message.content);
          if (workflowData) {
            // Mock workflow injection
            this.uiService.showNotification('Workflow ready to inject! (Demo mode)', 'success');
          }
        }
      } catch (error) {
        console.error('Inject workflow error:', error);
        this.uiService.showNotification('Failed to inject workflow.', 'error');
      }
    }

    async copyWorkflow(messageId) {
      try {
        const messages = this.chatService.getMessages();
        const message = messages.find(m => m.id === messageId);
        
        if (message) {
          const workflowData = this.extractWorkflowFromMessage(message.content);
          if (workflowData) {
            await navigator.clipboard.writeText(JSON.stringify(workflowData, null, 2));
            this.uiService.showNotification('Workflow JSON copied to clipboard!', 'success');
          }
        }
      } catch (error) {
        console.error('Copy workflow error:', error);
        this.uiService.showNotification('Failed to copy workflow.', 'error');
      }
    }

    async modifyWorkflow(messageId) {
      try {
        const input = this.container.querySelector('#chat-input');
        input.value = `Please modify the workflow to: `;
        input.focus();
        
        const cursorPos = input.value.length;
        input.setSelectionRange(cursorPos, cursorPos);
        
        this.container.querySelector('#send-btn').disabled = false;
        this.uiService.showNotification('Ready to modify workflow - describe your changes!', 'success');
      } catch (error) {
        console.error('Modify workflow error:', error);
        this.uiService.showNotification('Failed to prepare workflow modification.', 'error');
      }
    }

    toggleUserMenu() {
      const existingMenu = this.container.querySelector('.n9n-user-dropdown');
      
      if (existingMenu) {
        existingMenu.remove();
        return;
      }

      const menuBtn = this.container.querySelector('.n9n-menu-btn');
      if (!menuBtn) return;

      const dropdown = document.createElement('div');
      dropdown.innerHTML = this.uiService.renderUserDropdown();
      
      menuBtn.parentNode.style.position = 'relative';
      menuBtn.parentNode.appendChild(dropdown.firstElementChild);

      // Close dropdown when clicking outside
      setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
          const menu = document.querySelector('.n9n-user-dropdown');
          if (menu && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', closeDropdown);
          }
        });
      }, 0);
    }

    async startNewConversation() {
      await this.chatService.startNewConversation();
      this.updateMessages();
      this.uiService.showNotification('Started new conversation', 'success');
    }

    async clearHistory() {
      await this.chatService.clearHistory();
      this.updateMessages();
      this.uiService.showNotification('Chat history cleared', 'success');
    }

    updateMessages() {
      const messages = this.chatService.getMessages();
      this.uiService.updateMessages(messages);
      this.setupSuggestions(); // Re-setup suggestions after update
    }

    extractWorkflowFromMessage(content) {
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }
        
        const workflowMatch = content.match(/"workflow":\s*({[\s\S]*?})/);
        if (workflowMatch) {
          return JSON.parse(workflowMatch[1]);
        }
        
        return null;
      } catch (error) {
        console.error('Failed to extract workflow:', error);
        return null;
      }
    }

    loadStyles() {
      if (document.querySelector('#n9n-chat-styles')) return;

      const style = document.createElement('style');
      style.id = 'n9n-chat-styles';
      
      // Import CSS files
      fetch(chrome.runtime.getURL('src/styles/chat-panel.css'))
        .then(response => response.text())
        .then(css => {
          style.textContent = css;
          document.head.appendChild(style);
        })
        .catch(error => {
          console.error('Failed to load chat panel styles:', error);
        });
    }
  };

})();