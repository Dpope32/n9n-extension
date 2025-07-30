// ChatManager.js - Fixed Authentication Version
// Proper Supabase client-side authentication

class ChatManager {
  constructor() {
    this.messages = [];
    this.currentConversationId = null;
    this.supabaseUrl = 'https://pvxfiwdtbukopfjrutzq.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eGZpd2R0YnVrb3BmanJ1dHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAzOTksImV4cCI6MjA2NjAyNjM5OX0.YypL3hkw4rAcWWuL7i80BC20gN7J9JZZx6cLZa8ISZc';
    this.currentUser = null;
    this.authToken = null;
    this.isInitialized = false;
    this.initSupabase();
  }

  async initSupabase() {
    try {
      console.log('🔄 Initializing Supabase authentication...');
      
      // Check for OAuth callback first
      const authFromCallback = await this.handleOAuthCallback();
      if (authFromCallback) {
        console.log('✅ Authentication successful from OAuth callback');
        this.isInitialized = true;
        return;
      }
      
      // Try to get existing session from localStorage
      const sessionData = this.getStoredAuthSession();
      if (sessionData) {
        console.log('🔍 Found stored session, validating...');
        const isValid = await this.validateStoredSession(sessionData);
        if (isValid) {
          console.log('✅ Stored session is valid');
          this.isInitialized = true;
          return;
        } else {
          console.log('⚠️ Stored session is invalid, clearing...');
          this.clearStoredAuth();
        }
      }
      
      // No valid authentication found
      console.log('ℹ️ No valid authentication found - user needs to log in');
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      this.isInitialized = true;
    }
  }

  getStoredAuthSession() {
    // Try to get Supabase auth session from localStorage
    const authKey = `sb-${this.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
    const storedAuth = localStorage.getItem(authKey);
    
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        if (parsed.access_token && parsed.user) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse stored auth:', e);
      }
    }

    // Check for manual storage keys
    const manualToken = localStorage.getItem('supabase-auth-token');
    const manualUser = localStorage.getItem('supabase-user-data');
    
    if (manualToken && manualUser) {
      try {
        return {
          access_token: manualToken,
          user: JSON.parse(manualUser)
        };
      } catch (e) {
        console.warn('Failed to parse manual auth:', e);
      }
    }

    return null;
  }

  async validateStoredSession(sessionData) {
    try {
      // Try to make a simple request to verify the token works
      const response = await fetch(`${this.supabaseUrl}/rest/v1/workflows?limit=1`, {
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${sessionData.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Token is valid, set auth state
        this.authToken = sessionData.access_token;
        this.currentUser = sessionData.user;
        return true;
      } else if (response.status === 401) {
        // Token expired, try to refresh if we have a refresh token
        return await this.tryRefreshToken(sessionData);
      } else {
        console.warn('Unexpected response status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  async tryRefreshToken(sessionData) {
    const refreshToken = sessionData.refresh_token || localStorage.getItem('supabase-refresh-token');
    
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      if (response.ok) {
        const authData = await response.json();
        
        // Store new tokens
        this.authToken = authData.access_token;
        this.currentUser = authData.user;
        this.storeAuthSession(authData);
        
        console.log('✅ Token refreshed successfully');
        return true;
      } else {
        console.warn('Token refresh failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  storeAuthSession(authData) {
    try {
      // Store in Supabase standard format
      const authKey = `sb-${this.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
      localStorage.setItem(authKey, JSON.stringify(authData));
      
      // Also store in our manual keys for backup
      localStorage.setItem('supabase-auth-token', authData.access_token);
      localStorage.setItem('supabase-user-data', JSON.stringify(authData.user));
      if (authData.refresh_token) {
        localStorage.setItem('supabase-refresh-token', authData.refresh_token);
      }
    } catch (error) {
      console.error('Failed to store auth session:', error);
    }
  }

  clearStoredAuth() {
    try {
      const authKey = `sb-${this.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
      localStorage.removeItem(authKey);
      localStorage.removeItem('supabase-auth-token');
      localStorage.removeItem('supabase-refresh-token');
      localStorage.removeItem('supabase-user-data');
      
      this.currentUser = null;
      this.authToken = null;
    } catch (error) {
      console.error('Failed to clear auth:', error);
    }
  }

  async handleOAuthCallback() {
    try {
      const url = window.location.href;
      
      // Check if we have OAuth tokens in URL hash or search params
      if (url.includes('access_token=')) {
        console.log('🔐 Processing OAuth callback...');
        
        let params;
        if (url.includes('#access_token=')) {
          params = new URLSearchParams(window.location.hash.slice(1));
        } else {
          params = new URLSearchParams(window.location.search);
        }
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const expiresIn = params.get('expires_in');
        const tokenType = params.get('token_type');
        
        if (accessToken) {
          // Get user info with the access token
          const userResponse = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
            method: 'GET',
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Create auth session object
            const authSession = {
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_in: parseInt(expiresIn || '3600'),
              token_type: tokenType || 'bearer',
              user: userData
            };
            
            // Store the session
            this.storeAuthSession(authSession);
            this.authToken = accessToken;
            this.currentUser = userData;
            
            // Clean up URL
            if (window.history && window.history.replaceState) {
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            }
            
            console.log('✅ OAuth authentication successful for:', userData.email);
            return true;
          } else {
            console.error('Failed to get user info:', userResponse.status);
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      return false;
    }
  }

  // Public method to trigger Google login
  async loginWithGoogle() {
    console.log('🔐 Starting Google OAuth login...');
    
    // Get the current page URL for redirect
    const redirectUrl = window.location.origin + window.location.pathname;
    const authUrl = `${this.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    
    console.log('🔗 Auth URL:', authUrl);
    
    // For browser extension context, open in new tab
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      // Extension context
      chrome.tabs.create({ url: authUrl });
    } else {
      // Regular web context
      window.open(authUrl, '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes');
    }
    
    return { success: true, message: 'Login window opened. Please complete authentication.' };
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!(this.currentUser && this.authToken);
  }

  // Get current user info
  getCurrentUser() {
    return this.currentUser;
  }

  // Manual logout
  async logout() {
    try {
      // Call Supabase logout endpoint if we have a token
      if (this.authToken) {
        try {
          await fetch(`${this.supabaseUrl}/auth/v1/logout`, {
            method: 'POST',
            headers: {
              'apikey': this.supabaseKey,
              'Authorization': `Bearer ${this.authToken}`
            }
          });
        } catch (e) {
          // Ignore logout endpoint errors
          console.warn('Logout endpoint error (ignored):', e);
        }
      }
      
      // Clear all stored auth data
      this.clearStoredAuth();
      
      console.log('🔐 User logged out');
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  async makeSupabaseRequest(method, table, data = null, params = '') {
    // Wait for initialization if not ready
    let attempts = 0;
    while (!this.isInitialized && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    const token = this.authToken || this.supabaseKey;
    
    try {
      const url = `${this.supabaseUrl}/rest/v1/${table}${params}`;
      const options = {
        method,
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      };

      if (data && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      console.log(`🔄 Making ${method} request to ${table}`);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 401 && this.authToken) {
          console.log('🔄 Token expired, attempting refresh...');
          // Try to refresh token
          const sessionData = this.getStoredAuthSession();
          if (sessionData && await this.tryRefreshToken(sessionData)) {
            // Retry request with new token
            options.headers['Authorization'] = `Bearer ${this.authToken}`;
            const retryResponse = await fetch(url, options);
            if (retryResponse.ok) {
              const responseText = await retryResponse.text();
              return responseText ? JSON.parse(responseText) : null;
            }
          }
          // If refresh failed, clear auth and throw error
          this.clearStoredAuth();
          throw new Error('Authentication expired. Please log in again.');
        }
        
        let errorDetails = '';
        try {
          const errorBody = await response.text();
          errorDetails = errorBody ? ` - ${errorBody}` : '';
        } catch (e) {
          // Ignore error parsing error body
        }
        
        throw new Error(`Request failed: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const responseText = await response.text();
      const result = responseText ? JSON.parse(responseText) : null;
      console.log(`✅ ${method} request successful`);
      return result;
    } catch (error) {
      console.error(`❌ ${method} request error:`, error);
      throw error;
    }
  }

  // Sync workflow with proper auth
  async syncWorkflowToSupabase(workflow) {
    if (!this.isLoggedIn()) {
      throw new Error('User not authenticated - cannot sync workflow');
    }

    try {
      const workflowData = {
        id: workflow.id || this.generateUUID(),
        name: workflow.name || 'Unnamed Workflow',
        description: workflow.description || '',
        user_id: this.currentUser.id,
        n8n_workflow_json: workflow,
        project_id: null
      };

      const result = await this.makeSupabaseRequest('POST', 'workflows', workflowData);
      console.log('✅ Workflow synced to Supabase:', workflow.name);
      return result;
    } catch (error) {
      console.error('❌ Failed to sync workflow:', error);
      throw error;
    }
  }

  // Get user's workflows
  async getUserWorkflows() {
    if (!this.isLoggedIn()) {
      throw new Error('User not authenticated');
    }

    try {
      const workflows = await this.makeSupabaseRequest(
        'GET', 
        'workflows', 
        null, 
        `?user_id=eq.${this.currentUser.id}&order=created_at.desc`
      );
      return workflows || [];
    } catch (error) {
      console.error('❌ Failed to get workflows:', error);
      throw error;
    }
  }

  // Method for AI to get current workflows context
  async getCurrentWorkflowsContext() {
    try {
      if (!this.isLoggedIn()) {
        return { 
          error: 'User not authenticated', 
          message: 'Please log in with Google to view workflows',
          requiresAuth: true
        };
      }

      const workflows = await this.getUserWorkflows();
      return {
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
          name: this.currentUser.user_metadata?.full_name || this.currentUser.email
        },
        count: workflows.length,
        workflows: workflows.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description,
          created_at: w.created_at,
          n8n_workflow_json: w.n8n_workflow_json ? 'Available' : 'Missing'
        }))
      };
    } catch (error) {
      console.error('❌ Failed to get workflows context:', error);
      return { error: error.message };
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // === ORIGINAL CHAT FUNCTIONALITY PRESERVED ===

  fallbackToLocalStorage() {
    console.log('📱 Falling back to localStorage');
    this.messages = JSON.parse(localStorage.getItem('n9n_chat_messages') || '[]');
  }

  async getMessages() {
    if (!this.isLoggedIn() || !this.currentConversationId) {
      return this.messages;
    }

    try {
      const data = await this.makeSupabaseRequest(
        'GET', 
        'ai_messages',
        null,
        `?conversation_id=eq.${this.currentConversationId}&order=created_at.asc`
      );
      
      this.messages = data.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
        metadata: msg.metadata
      }));
      
      return this.messages;
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      return this.messages;
    }
  }

  async addMessage(role, content, metadata = {}) {
    const message = {
      id: this.generateUUID(),
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    // Add to local array immediately
    this.messages.push(message);
    
    // Save to Supabase if available
    if (this.isLoggedIn() && this.currentConversationId) {
      try {
        const messageData = {
          conversation_id: this.currentConversationId,
          role,
          content,
          metadata
        };

        const savedMessage = await this.makeSupabaseRequest('POST', 'ai_messages', messageData);
        
        if (savedMessage && savedMessage.length > 0) {
          message.id = savedMessage[0].id;
          this.messages[this.messages.length - 1] = message;
        }

        console.log('✅ Message saved to Supabase');
      } catch (error) {
        console.error('❌ Failed to save message to Supabase:', error);
        this.saveToLocalStorage();
      }
    } else {
      this.saveToLocalStorage();
    }
    
    return message;
  }

  saveToLocalStorage() {
    localStorage.setItem('n9n_chat_messages', JSON.stringify(this.messages));
    console.log('💾 Saved', this.messages.length, 'messages to localStorage');
  }

  async clearMessages() {
    this.messages = [];
    this.currentConversationId = null;
    localStorage.removeItem('n9n_chat_messages');
  }

  async getRecentConversations() {
    if (!this.isLoggedIn()) {
      const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
      return conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    }

    try {
      const data = await this.makeSupabaseRequest(
        'GET',
        'ai_conversations',
        null,
        `?user_id=eq.${this.currentUser.id}&order=created_at.desc&limit=10`
      );
      
      return data.map(conv => ({
        id: conv.id,
        title: conv.title,
        timestamp: conv.created_at,
        messageCount: conv.total_messages,
        status: conv.status
      }));
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
      return conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    }
  }

  async saveConversation(title) {
    if (!this.isLoggedIn()) {
      return this.saveConversationLocal(title);
    }

    const existingConversation = await this.findExistingConversation(title);
    if (existingConversation) {
      console.log('📋 Using existing conversation:', existingConversation.id);
      this.currentConversationId = existingConversation.id;
      return existingConversation.id;
    }

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        const conversationData = {
          user_id: this.currentUser.id,
          title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
          status: 'active',
          total_messages: 0,
          ai_credits_used: 0
        };

        const data = await this.makeSupabaseRequest('POST', 'ai_conversations', conversationData);

        if (data && data.length > 0) {
          this.currentConversationId = data[0].id;
          console.log('✅ Conversation saved to Supabase:', data[0].id);
          return data[0].id;
        } else {
          throw new Error('No data returned from conversation creation');
        }
      } catch (error) {
        retryCount++;
        
        if (error.message.includes('409')) {
          const existingAfterConflict = await this.findExistingConversation(title);
          if (existingAfterConflict) {
            console.log('📋 Found conversation created during conflict:', existingAfterConflict.id);
            this.currentConversationId = existingAfterConflict.id;
            return existingAfterConflict.id;
          }
          
          if (retryCount < maxRetries) {
            console.log(`⚠️ Conflict detected, retrying (${retryCount}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
            continue;
          }
        }
        
        console.error('❌ Failed to save conversation to Supabase:', error);
        return this.saveConversationLocal(title);
      }
    }
  }

  saveConversationLocal(title) {
    const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
    const newConversation = {
      id: this.generateUUID(),
      title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString(),
      messageCount: this.messages.length,
      messages: this.messages
    };
    
    conversations.unshift(newConversation);
    localStorage.setItem('n9n_conversations', JSON.stringify(conversations.slice(0, 20)));
    this.currentConversationId = newConversation.id;
    return newConversation.id;
  }

  async loadConversation(conversationId) {
    this.currentConversationId = conversationId;
    
    if (!this.isLoggedIn()) {
      const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        this.messages = conversation.messages || [];
        return true;
      }
      return false;
    }

    try {
      await this.getMessages();
      return true;
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      return false;
    }
  }

  async updateConversation() {
    if (!this.currentConversationId) return;
    
    if (!this.isLoggedIn()) {
      const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
      const index = conversations.findIndex(c => c.id === this.currentConversationId);
      
      if (index !== -1) {
        conversations[index].messageCount = this.messages.length;
        conversations[index].messages = this.messages;
        conversations[index].timestamp = new Date().toISOString();
        localStorage.setItem('n9n_conversations', JSON.stringify(conversations));
      }
      return;
    }

    try {
      await this.makeSupabaseRequest(
        'PATCH',
        'ai_conversations',
        { total_messages: this.messages.length },
        `?id=eq.${this.currentConversationId}`
      );

      console.log('✅ Conversation updated in Supabase');
    } catch (error) {
      console.error('❌ Failed to update conversation:', error);
    }
  }

  async startNewConversation() {
    this.messages = [];
    this.currentConversationId = null;
  }

  async findExistingConversation(title) {
    if (!this.isLoggedIn()) {
      return null;
    }

    try {
      const truncatedTitle = title.substring(0, 50) + (title.length > 50 ? '...' : '');
      const data = await this.makeSupabaseRequest(
        'GET',
        'ai_conversations',
        null,
        `?user_id=eq.${this.currentUser.id}&title=eq.${encodeURIComponent(truncatedTitle)}&limit=1`
      );

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('❌ Error checking for existing conversation:', error);
      return null;
    }
  }

  async handleMessageExchange(userMessage) {
    if (this.messages.length === 2 && !this.currentConversationId) {
      this.currentConversationId = await this.saveConversation(userMessage);
    } else if (this.currentConversationId) {
      await this.updateConversation();
    }
  }

  getCurrentConversationTitle() {
    if (this.messages.length > 0) {
      const firstUserMessage = this.messages.find(m => m.role === 'user');
      return firstUserMessage ? firstUserMessage.content.substring(0, 30) + '...' : 'Current Chat';
    }
    return null;
  }

  hasActiveConversation() {
    return this.messages.length > 0;
  }
}

// Export for use in other modules
// Export singleton instance
if (!window.chatManager) {
  window.chatManager = new ChatManager();
}

// Also export the class
window.ChatManager = ChatManager;