// ChatManager.js - Handles all chat functionality with Supabase REST API
// Depends on: Utils

class ChatManager {
  constructor() {
    this.messages = [];
    this.currentConversationId = null;
    this.supabaseUrl = 'https://pvxfiwdtbukopfjrutzq.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eGZpd2R0YnVrb3BmanJ1dHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAzOTksImV4cCI6MjA2NjAyNjM5OX0.YypL3hkw4rAcWWuL7i80BC20gN7J9JZZx6cLZa8ISZc';
    this.userId = null;
    this.initSupabase();
  }

  // Simple UUID generator since crypto.randomUUID() isn't available
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async initSupabase() {
    try {
      // Try to get or create an anonymous user
      await this.ensureUserExists();
      console.log('✅ Using user ID:', this.userId);
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      this.fallbackToLocalStorage();
    }
  }

  async ensureUserExists() {
    // Check if we have a stored user ID
    let storedUserId = localStorage.getItem('n9n_user_id');
    
    if (storedUserId) {
      // Verify the user still exists in Supabase
      try {
        const userData = await this.makeSupabaseRequest(
          'GET',
          'users',
          null,
          `?id=eq.${storedUserId}&limit=1`
        );
        
        if (userData && userData.length > 0) {
          this.userId = storedUserId;
          return;
        }
      } catch (error) {
        console.log('🔍 Stored user not found, creating new one');
      }
    }

    // Create a new anonymous user
    try {
      const newUserId = this.generateUUID();
      const userData = {
        id: newUserId,
        email: `anonymous-${newUserId}@n9n.local`,
        display_name: 'Anonymous User',
        is_anonymous: true
      };

      const createdUser = await this.makeSupabaseRequest('POST', 'users', userData);
      
      if (createdUser && createdUser.length > 0) {
        this.userId = createdUser[0].id;
        localStorage.setItem('n9n_user_id', this.userId);
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      // Fall back to localStorage-only mode
      this.userId = null;
    }
  }

  async makeSupabaseRequest(method, table, data = null, params = '') {
    try {
      const url = `${this.supabaseUrl}/rest/v1/${table}${params}`;
      const options = {
        method,
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      };

      if (data && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        // Get more detailed error information
        let errorDetails = '';
        try {
          const errorBody = await response.text();
          errorDetails = errorBody ? ` - ${errorBody}` : '';
        } catch (e) {
          // Ignore error parsing error body
        }
        
        throw new Error(`Supabase request failed: ${response.status} ${response.statusText}${errorDetails}`);
      }

      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      console.error('❌ Supabase request error:', error);
      console.error('Request details:', { method, table, data, params });
      throw error;
    }
  }

  fallbackToLocalStorage() {
    console.log('📱 Falling back to localStorage');
    this.messages = JSON.parse(localStorage.getItem('n9n_chat_messages') || '[]');
    this.userId = null;
  }

  async getMessages() {
    if (!this.userId || !this.currentConversationId) {
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
    if (this.userId && this.currentConversationId) {
      try {
        // Let Supabase auto-generate the ID for messages too
        const messageData = {
          conversation_id: this.currentConversationId,
          role,
          content,
          metadata
        };

        const savedMessage = await this.makeSupabaseRequest('POST', 'ai_messages', messageData);
        
        // Update the local message with the Supabase-generated ID
        if (savedMessage && savedMessage.length > 0) {
          message.id = savedMessage[0].id;
          // Update the message in the local array
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

  // Conversation management with Supabase REST API
  async getRecentConversations() {
    if (!this.userId) {
      const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
      return conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    }

    try {
      const data = await this.makeSupabaseRequest(
        'GET',
        'ai_conversations',
        null,
        `?user_id=eq.${this.userId}&order=created_at.desc&limit=10`
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
    if (!this.userId) {
      return this.saveConversationLocal(title);
    }

    // Check if a conversation with this title already exists
    const existingConversation = await this.findExistingConversation(title);
    if (existingConversation) {
      console.log('📋 Using existing conversation:', existingConversation.id);
      this.currentConversationId = existingConversation.id;
      return existingConversation.id;
    }

    // Retry logic for handling conflicts
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Let Supabase auto-generate the ID by not including it
        const conversationData = {
          user_id: this.userId,
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
        
        // If it's a 409 conflict, check if the conversation was created by another process
        if (error.message.includes('409')) {
          const existingAfterConflict = await this.findExistingConversation(title);
          if (existingAfterConflict) {
            console.log('📋 Found conversation created during conflict:', existingAfterConflict.id);
            this.currentConversationId = existingAfterConflict.id;
            return existingAfterConflict.id;
          }
          
          if (retryCount < maxRetries) {
            console.log(`⚠️ Conflict detected, retrying (${retryCount}/${maxRetries})...`);
            // Add a small delay before retry
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
    
    if (!this.userId) {
      const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        this.messages = conversation.messages || [];
        return true;
      }
      return false;
    }

    try {
      // Load conversation messages
      await this.getMessages();
      return true;
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      return false;
    }
  }

  async updateConversation() {
    if (!this.currentConversationId) return;
    
    if (!this.userId) {
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

  // Check if a conversation with similar title already exists
  async findExistingConversation(title) {
    if (!this.userId) {
      return null;
    }

    try {
      const truncatedTitle = title.substring(0, 50) + (title.length > 50 ? '...' : '');
      const data = await this.makeSupabaseRequest(
        'GET',
        'ai_conversations',
        null,
        `?user_id=eq.${this.userId}&title=eq.${encodeURIComponent(truncatedTitle)}&limit=1`
      );

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('❌ Error checking for existing conversation:', error);
      return null;
    }
  }

  // Auto-save conversation after exchanges
  async handleMessageExchange(userMessage) {
    // Save conversation after first exchange
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
window.ChatManager = ChatManager;