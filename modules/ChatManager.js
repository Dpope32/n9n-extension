// ChatManager.js - REAL PRODUCTION VERSION - Multi-environment OAuth handling
// Handles both web app (localhost:3000) and n8n extension environments

class ChatManager {
  constructor() {
    this.messages = [];
    this.currentConversationId = null;
    this.supabaseUrl = 'https://pvxfiwdtbukopfjrutzq.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eGZpd2R0YnVrb3BmanJ1dHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAzOTksImV4cCI6MjA2NjAyNjM5OX0.YypL3hkw4rAcWWuL7i80BC20gN7J9JZZx6cLZa8ISZc';
    this.currentUser = null;
    this.authToken = null;
    this.initSupabase();
  }

  detectEnvironment() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' && port === '3000') {
      return 'webapp';
    } else if (hostname.includes('100.78.164.43') || port === '5678') {
      return 'n8n';
    } else if (protocol === 'chrome-extension:') {
      return 'extension';
    } else {
      return 'unknown';
    }
  }

  async initSupabase() {
    try {
      // Get existing session - user should already be logged in via Google
      await this.getExistingSession();
      
      if (this.currentUser) {
        console.log('✅ Authenticated user:', this.currentUser.email);
      } else {
        console.log('⚠️ No authenticated user - redirect to login');
        this.redirectToLogin();
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      this.redirectToLogin();
    }
  }

  async getExistingSession() {
    try {
      // Get session from Supabase Auth
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.getStoredToken()}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.id) {
          this.currentUser = userData;
          this.authToken = this.getStoredToken();
          return;
        } else {
          console.log('⚠️ Stored session is invalid, clearing...');
          this.clearStoredAuth();
        }
      }

      // Try to refresh session
      await this.refreshSession();
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      this.isInitialized = true;
    }
  }

  getStoredToken() {
    // Check for stored auth token from Supabase
    const supabaseAuth = localStorage.getItem('supabase.auth.token');
    if (supabaseAuth) {
      try {
        const parsed = JSON.parse(supabaseAuth);
        return parsed.access_token;
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Check for session in various storage locations
    const sessionKeys = [
      'sb-pvxfiwdtbukopfjrutzq-auth-token',
      'supabase-auth-token',
      'auth-token'
    ];

    for (const key of sessionKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        try {
          const parsed = JSON.parse(token);
          if (parsed.access_token) {
            return parsed.access_token;
          }
        } catch (e) {
          if (typeof token === 'string' && token.length > 20) {
            return token;
          }
        }
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
      } else {
        throw new Error('Failed to refresh session');
      }
    } catch (error) {
      console.error('❌ Failed to refresh session:', error);
      throw error;
    }
  }

  getStoredRefreshToken() {
    const refreshKeys = [
      'sb-pvxfiwdtbukopfjrutzq-auth-token.refresh_token',
      'supabase-refresh-token'
    ];

    for (const key of refreshKeys) {
      const token = localStorage.getItem(key);
      if (token) return token;
    }

    return null;
  }

  redirectToLogin() {
    // Redirect to Google OAuth login if not authenticated
    const redirectUrl = encodeURIComponent(window.location.href);
    const googleAuthUrl = `${this.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`;
    
    console.log('🔐 Redirecting to Google login...');
    window.location.href = googleAuthUrl;
  }

  // Manual login for extension environments
  async triggerManualLogin() {
    if (this.environment === 'extension' || this.environment === 'n8n') {
      // Open popup for OAuth
      const redirectUrl = 'http://localhost:3000'; // Always use webapp for OAuth
      const googleAuthUrl = `${this.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`;
      
      // Open in new window/popup
      const popup = window.open(googleAuthUrl, 'oauth', 'width=500,height=600');
      
      // Listen for popup to close or get tokens
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // Check if tokens were set by the popup
          setTimeout(() => {
            this.getExistingSession().then(() => {
              if (this.currentUser) {
                console.log('✅ Login successful via popup');
                // Refresh the page or notify the app
                window.location.reload();
              }
            });
          }, 1000);
        }
      }, 1000);
      
      return popup;
    } else {
      this.redirectToLogin();
    }
  }

  async makeSupabaseRequest(method, table, data = null, params = '') {
    if (!this.authToken && !this.currentUser) {
      throw new Error('User not authenticated');
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
        if (response.status === 401) {
          // Token expired, try to refresh
          await this.refreshSession();
          // Retry request with new token
          options.headers['Authorization'] = `Bearer ${this.authToken}`;
          const retryResponse = await fetch(url, options);
          if (!retryResponse.ok) {
            throw new Error(`Supabase request failed: ${retryResponse.status}`);
          }
          const responseText = await retryResponse.text();
          return responseText ? JSON.parse(responseText) : null;
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
    if (!this.currentUser) {
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
    if (!this.currentUser) {
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
      return [];
    }
  }

  // Method for AI to get current workflows context
  async getCurrentWorkflowsContext() {
    try {
      if (!this.isLoggedIn()) {
        return { 
          error: 'User not authenticated', 
          message: 'Please log in with Google to view workflows',
          loginUrl: `${this.supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.href)}`
        };
      }

      const workflows = await this.getUserWorkflows();
      return {
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
          name: this.currentUser.user_metadata?.full_name || this.currentUser.email
        },
        environment: this.environment,
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
      return { error: error.message, environment: this.environment };
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