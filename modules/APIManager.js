// APIManager.js - Enhanced with modal system and full API key management
// Depends on: Utils

class APIManager {
  constructor() {
    // API key management
  }

  async tryInjectWorkflow(workflowData) {
    try {
      console.log('🔄 Attempting to inject workflow:', workflowData);
      
      // Check if we have API key first
      const apiKey = await this.getN8nApiKey();
      console.log('🔑 API Key available:', apiKey ? 'Yes (' + apiKey.substring(0, 10) + '...)' : 'No');
      
      // Method 1: Try n8n REST API (if we can detect the base URL)
      const n8nBaseUrl = Utils.detectN8nBaseUrl();
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
      
      // Method 2: Try to redirect to "new workflow" page with data
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
            this.showApiKeySetupModal();
          } else {
            console.log('🔑 API key invalid or expired');
            Utils.showNotification('❌ API Key invalid or expired. Please update it.');
          }
        } else if (response.status === 403) {
          console.log('🚫 Permission denied - API key may lack required scopes');
          Utils.showNotification('❌ Permission denied. Your API key may need additional scopes.');
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

  async injectViaRedirect(workflowData) {
    try {
      // Try to navigate to new workflow page and inject data
      const currentUrl = window.location.href;
      const baseUrl = Utils.detectN8nBaseUrl();
      
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
      Utils.showNotification('❌ Corrupted API key detected and cleared. Please enter a new API key.');
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

  promptForApiKey() {
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
            background: linear-gradient(45deg,rgb(10, 10, 10), #2dd4bf);
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
            background: rgb(45, 131, 212);
            border: 1px solidrgb(45, 131, 212);
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
      Utils.showNotification('✅ Cleared corrupted API key data. Please enter a new API key.');
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

    // Setup all the event listeners for the modal...
    // (All the event listeners from the original code)
    
    // Clear button
    clearBtn.addEventListener('click', () => {
      console.log('🧹 Clear button clicked');
      input.value = '';
      input.focus();
      input.dispatchEvent(new Event('input'));
    });
    
    // Toggle visibility button
    toggleBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.textContent = '🙈';
      } else {
        input.type = 'password';
        toggleBtn.textContent = '👁';
      }
    });
    
    // Input validation and paste handling
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      console.log('📋 PASTE EVENT - Data preview:', pastedData ? pastedData.substring(0, 100) + '...' : 'EMPTY');
      
      if (pastedData.startsWith('{') && pastedData.includes('nodes')) {
        console.error('❌ PASTE CONTAINS WORKFLOW JSON! Not pasting.');
        alert('❌ Your clipboard contains workflow JSON, not an API key!\n\nPlease copy the actual n8n API key from your n8n settings.');
        return;
      }
      
      input.value = pastedData;
      input.dispatchEvent(new Event('input'));
      console.log('✅ Pasted API key successfully');
    });

    // Input validation
    input.addEventListener('input', () => {
      const hasValue = input.value.trim();
      
      if (hasValue.startsWith('{') && hasValue.includes('nodes')) {
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
    });

    // Save functionality
    const saveApiKey = () => {
      const apiKey = input.value.trim();
      if (apiKey) {
        const success = this.saveApiKey(apiKey);
        if (success) {
          closeModal();
        }
      }
    };

    // Event listeners
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        saveApiKey();
      }
    });

    saveBtn.addEventListener('click', saveApiKey);
    cancelBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Add hover effects for all buttons...
    // (Button hover effects from original code)
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

  saveApiKey(apiKey) {
    try {
      console.log('🔑 saveApiKey called with:', typeof apiKey, apiKey ? apiKey.substring(0, 50) + '...' : 'NULL');
      
      // Validate API key format
      if (!apiKey || typeof apiKey !== 'string') {
        console.error('❌ Invalid API key format:', apiKey);
        Utils.showNotification('❌ Invalid API key format.');
        return false;
      }
      
      // Check if it looks like a JSON object instead of an API key
      if (apiKey.startsWith('{') && apiKey.includes('nodes')) {
        console.error('❌ API key appears to be workflow JSON!');
        Utils.showNotification('❌ Error: Workflow data detected instead of API key.');
        return false;
      }
      
      // Clear any corrupted data first
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
      
      // Always also save to localStorage as backup
      localStorage.setItem('n8n_api_key', apiKey);
      
      // Verify it was saved correctly
      const verification = localStorage.getItem('n8n_api_key');
      if (verification === apiKey) {
        console.log('✅ API Key saved and verified in localStorage');
      } else {
        console.error('❌ API Key verification failed!');
        Utils.showNotification('❌ API Key save verification failed!');
        return false;
      }
      
      Utils.showNotification('✅ API Key saved successfully! Click "⚡ Inject" again to create the workflow.');
      
      // Test the API connection
      setTimeout(() => {
        this.testApiConnection(apiKey);
      }, 1000);

      return true;
      
    } catch (error) {
      console.error('Failed to save API key:', error);
      Utils.showNotification('❌ Failed to save API key. Please try again.');
      return false;
    }
  }

  async testApiConnection(apiKey) {
    try {
      const baseUrl = Utils.detectN8nBaseUrl();
      if (!baseUrl) {
        console.log('⚠️ Cannot test API - no base URL detected');
        return;
      }
      
      console.log('🧪 Testing API connection...');
      
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
        Utils.showNotification('✅ API Key working! Ready to inject workflows.');
      } else {
        const errorText = await response.text();
        console.log('❌ API Test failed:', errorText);
        
        if (response.status === 401) {
          Utils.showNotification('❌ API Key authentication failed');
        } else if (response.status === 403) {
          Utils.showNotification('⚠️ API Key has limited permissions. Free tier may not support workflow creation.');
        } else {
          Utils.showNotification('❌ API connection failed: ' + response.status);
        }
      }
      
    } catch (error) {
      console.error('🧪 API Test error:', error);
      Utils.showNotification('❌ Failed to test API connection');
    }
  }
}

// Export for use in other modules
window.APIManager = APIManager;
