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
        case 'open-settings':
          await this.openSettings();
          break;
        case 'close-panel':
          this.closeSidebar();
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

    async openSettings() {
      try {
        // Show the API key setup modal with spotlight
        this.showApiKeyModal();
      } catch (error) {
        console.error('Open settings error:', error);
        this.uiService.showNotification('Failed to open settings', 'error');
      }
    }

    closeSidebar() {
      // Close the sidebar - trigger parent's toggle method
      if (window.n9nCopilot && window.n9nCopilot.toggleSidebar) {
        window.n9nCopilot.toggleSidebar();
      }
    }

    showApiKeyModal() {
      // Remove existing modal if any
      const existingModal = document.querySelector('#n9n-api-key-modal');
      if (existingModal) existingModal.remove();

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
        console.log('✅ Found and highlighted profile icon!');
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
          
          this.uiService.showNotification('✅ API Key saved successfully!', 'success');
          closeModal();
        } else {
          this.uiService.showNotification('❌ Please enter a valid API key', 'error');
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