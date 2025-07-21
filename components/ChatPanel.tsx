export class ChatPanel {
    private container: HTMLElement;
    private chatService: ChatService;
    private uiService: UIService;
    private state: {
      isAuthenticated: boolean;
      user: User | null;
      isLoading: boolean;
      error: string | null;
    };

    constructor(container: HTMLElement | null) {
      if (!container) {
        throw new Error('Container is required');
      }

      this.container = container;       
      
      this.chatService = new ChatService();
      this.uiService = new UIService(this.container);
      

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
      } catch (error) {
        this.state.error = 'Failed to load user state';
        console.error('Load state error:', error);
        // Even if there's an error, keep it authenticated
        this.state.isAuthenticated = true;
        this.state.user = { email: 'user@n9n.com' };
      } finally {
        this.state.isLoading = false;
      }
    }
  
    render() {
      const messages = this.chatService ? this.chatService.getMessages() : [];
      
      this.container.innerHTML = `
        <div class="n9n-chat-panel" style="width: 100%; height: 100%;">
          ${this.uiService.renderHeader(this.state.isAuthenticated, this.state.user)}
          ${this.state.isAuthenticated ? 
            this.uiService.renderChat(messages) : 
            this.uiService.renderAuth()
          }
        </div>
      `;
      
      // Re-setup event listeners after DOM update
      this.setupEventListeners();
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
        case 'open-settings':
          this.showApiKeyModal();
          break;
        case 'new-chat':
          this.startNewChat();
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
        
        // Update UI - re-render the chat
        this.render();
        
      } catch (error) {
        console.error('Send message error:', error);
        this.uiService.showNotification('Failed to send message. Please try again.', 'error');
      } finally {
        this.uiService.removeTypingIndicator();
      }
    }
  
    showApiKeyModal() {
      // Remove any existing modal
      this.removeApiKeyModal();
      
      // Create modal overlay
      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'n9n-api-modal-overlay';
      modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      
      // Create modal content
      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%);
        border: 1px solid #404040;
        border-radius: 16px;
        padding: 0;
        width: 480px;
        max-width: 90vw;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        transform: scale(0.9);
        transition: transform 0.3s ease;
        overflow: hidden;
      `;
      
      modalContent.innerHTML = `
        <div style="padding: 24px; border-bottom: 1px solid #404040;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">API Settings</h2>
            <button id="n9n-modal-close" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.5;">
            Configure your n8n API key to enable automatic workflow injection and advanced features.
          </p>
        </div>
        
        <div style="padding: 24px;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; color: #ffffff; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              n8n API Key
            </label>
            <input 
              type="password" 
              id="n9n-api-key-input"
              placeholder="Enter your n8n API key..."
              style="
                width: 100%;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid #404040;
                border-radius: 8px;
                padding: 12px 16px;
                color: #ffffff;
                font-size: 14px;
                outline: none;
                transition: all 0.2s;
                box-sizing: border-box;
              "
            />
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
              <input type="checkbox" id="n9n-show-key" style="margin: 0;">
              <label for="n9n-show-key" style="color: #9ca3af; font-size: 12px; cursor: pointer;">
                Show API key
              </label>
            </div>
          </div>
          
          <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0; margin-top: 2px;">
                <circle cx="12" cy="12" r="10" stroke="#3b82f6" stroke-width="2"/>
                <path d="M12 16v-4M12 8h.01" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <div>
                <h4 style="margin: 0 0 4px 0; color: #3b82f6; font-size: 13px; font-weight: 600;">How to get your API key:</h4>
                <ol style="margin: 0; padding-left: 16px; color: #9ca3af; font-size: 12px; line-height: 1.4;">
                  <li>Go to your n8n instance Settings</li>
                  <li>Navigate to "n8n API" section</li>
                  <li>Create a new API key</li>
                  <li>Copy and paste it here</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        <div style="padding: 20px 24px; background: rgba(255, 255, 255, 0.02); border-top: 1px solid #404040; display: flex; gap: 12px; justify-content: flex-end;">
          <button id="n9n-modal-cancel" style="
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #404040;
            border-radius: 8px;
            padding: 10px 20px;
            color: #9ca3af;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">Cancel</button>
          <button id="n9n-modal-save" style="
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">Save API Key</button>
        </div>
      `;
      
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);
      
      // Animate modal in
      requestAnimationFrame(() => {
        modalOverlay.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
      });
      
      // Load existing API key
      this.loadApiKeyToModal();
      
      // Setup event listeners
      this.setupModalEventListeners(modalOverlay);
      
      // Focus on input
      setTimeout(() => {
        const input = document.getElementById('n9n-api-key-input');
        if (input) input.focus();
      }, 100);
    }
    
    removeApiKeyModal() {
      const existingModal = document.getElementById('n9n-api-modal-overlay');
      if (existingModal) {
        existingModal.remove();
      }
    }
    
    loadApiKeyToModal() {
      const input = document.getElementById('n9n-api-key-input');
      if (input) {
        // Load existing key
        if (chrome && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['n8n_api_key'], (result) => {
            if (result.n8n_api_key) {
              input.value = result.n8n_api_key;
            } else {
              const localKey = localStorage.getItem('n8n_api_key');
              if (localKey) input.value = localKey;
            }
          });
        } else {
          const localKey = localStorage.getItem('n8n_api_key');
          if (localKey) input.value = localKey;
        }
      }
    }
    
    setupModalEventListeners(modalOverlay) {
      const closeBtn = document.getElementById('n9n-modal-close');
      const cancelBtn = document.getElementById('n9n-modal-cancel');
      const saveBtn = document.getElementById('n9n-modal-save');
      const showKeyCheckbox = document.getElementById('n9n-show-key');
      const apiKeyInput = document.getElementById('n9n-api-key-input');
      
      // Close modal handlers
      const closeModal = () => {
        modalOverlay.style.opacity = '0';
        const modalContent = modalOverlay.querySelector('div');
        if (modalContent) modalContent.style.transform = 'scale(0.9)';
        setTimeout(() => this.removeApiKeyModal(), 300);
      };
      
      closeBtn?.addEventListener('click', closeModal);
      cancelBtn?.addEventListener('click', closeModal);
      
      // Click outside to close
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
      
      // Escape key to close
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', handleKeydown);
        }
      };
      document.addEventListener('keydown', handleKeydown);
      
      // Show/hide password
      showKeyCheckbox?.addEventListener('change', (e) => {
        if (apiKeyInput) {
          apiKeyInput.type = e.target.checked ? 'text' : 'password';
        }
      });
      
      // Save API key
      saveBtn?.addEventListener('click', () => {
        const apiKey = apiKeyInput?.value?.trim();
        if (apiKey) {
          // Validate API key format
          if (this.validateApiKey(apiKey)) {
            // Save to both localStorage and chrome storage
            localStorage.setItem('n8n_api_key', apiKey);
            if (chrome && chrome.storage && chrome.storage.local) {
              chrome.storage.local.set({ 'n8n_api_key': apiKey });
            }
            
            this.uiService.showNotification('✅ API Key saved successfully!', 'success');
            closeModal();
          } else {
            this.uiService.showNotification('❌ Invalid API key format. Please check your key.', 'error');
          }
        } else {
          // Clear API key
          localStorage.removeItem('n8n_api_key');
          if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.remove(['n8n_api_key']);
          }
          this.uiService.showNotification('🗑️ API Key cleared.', 'success');
          closeModal();
        }
      });
      
      // Add hover effects
      [closeBtn, cancelBtn, saveBtn].forEach(btn => {
        if (btn) {
          btn.addEventListener('mouseenter', () => {
            if (btn === closeBtn) {
              btn.style.background = 'rgba(255, 255, 255, 0.1)';
              btn.style.color = '#ffffff';
            } else if (btn === cancelBtn) {
              btn.style.background = 'rgba(255, 255, 255, 0.1)';
              btn.style.color = '#ffffff';
            } else if (btn === saveBtn) {
              btn.style.transform = 'translateY(-1px)';
              btn.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
            }
          });
          
          btn.addEventListener('mouseleave', () => {
            if (btn === closeBtn) {
              btn.style.background = 'none';
              btn.style.color = '#9ca3af';
            } else if (btn === cancelBtn) {
              btn.style.background = 'rgba(255, 255, 255, 0.05)';
              btn.style.color = '#9ca3af';
            } else if (btn === saveBtn) {
              btn.style.transform = 'translateY(0)';
              btn.style.boxShadow = 'none';
            }
          });
        }
      });
      
      // Input focus effects
      if (apiKeyInput) {
        apiKeyInput.addEventListener('focus', () => {
          apiKeyInput.style.borderColor = '#6366f1';
          apiKeyInput.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        });
        
        apiKeyInput.addEventListener('blur', () => {
          apiKeyInput.style.borderColor = '#404040';
          apiKeyInput.style.boxShadow = 'none';
        });
      }
    }
  
    startNewChat() {
      // Clear current conversation
      this.chatService.clearHistory();
      
      // Re-render to show empty chat
      this.render();
      
      // Focus on input
      setTimeout(() => {
        const input = this.container.querySelector('#chat-input');
        if (input) input.focus();
      }, 100);
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
            
            // Store current chat state before redirecting
            localStorage.setItem('n9n_auto_open_sidebar', 'true');
            localStorage.setItem('n9n_chat_messages', JSON.stringify(this.chatService.getMessages()));
            localStorage.setItem('n9n_sidebar_was_open', 'true');
            
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
        
        // Store workflow data and chat state for the new page to pick up
        localStorage.setItem('n9n_workflow_to_inject', JSON.stringify(workflowData));
        localStorage.setItem('n9n_auto_open_sidebar', 'true');
        localStorage.setItem('n9n_chat_messages', JSON.stringify(this.chatService.getMessages()));
        localStorage.setItem('n9n_sidebar_was_open', 'true');
        console.log('🔧 [REDIRECT] Stored workflow data and chat state for injection');
        
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
      // This method should trigger a full re-render
      this.render();
    }
  
    loadStyles() {
      if (document.querySelector('#n9n-chat-styles')) return;
  
      const style = document.createElement('style');
      style.id = 'n9n-chat-styles';
      
      // Embedded CSS - no need to fetch from file
      style.textContent = `
  /* n9n AI Copilot Chat Panel Styles */
  .n9n-chat-panel {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%);
    border: none;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    gap: 8px;
    padding: 8px 12px;
  }
  
  .n9n-input-container textarea {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    padding: 8px 12px;
    color: #ffffff;
    font-size: 13px;
    line-height: 1.3;
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
  
  .n9n-hamburger:hover,
  .n9n-settings-btn:hover,
  .n9n-new-chat-btn:hover {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
  }
  
  /* Code block styles */
  .n9n-code-block {
    margin: 4px 0;
    background: #0a0a0a;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    overflow: hidden;
  }
  
  .n9n-code-block pre {
    margin: 0;
    padding: 8px 10px;
    overflow: hidden;
    background: transparent;
  }
  
  .n9n-code-block code {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 11px;
    line-height: 1.4;
    color: #e5e7eb;
    background: transparent;
    padding: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
      `;
      
      document.head.appendChild(style);
    }
  };    