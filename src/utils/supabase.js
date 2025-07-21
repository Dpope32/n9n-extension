// Supabase Client - Non-module version
// Mock implementation for demo purposes

(function() {
  'use strict';
  
  // Mock Supabase client for demo
  window.supabaseClient = {
    async getCurrentUser() {
      // Return mock user for demo
      return {
        user: {
          id: 'demo-user',
          email: 'demo@example.com',
          user_metadata: {
            full_name: 'Demo User',
            avatar_url: null
          }
        }
      };
    },
    
    async signInWithGoogle() {
      // Mock sign in
      console.log('Mock Google sign in');
      return { user: { email: 'demo@example.com' } };
    },
    
    async signOut() {
      // Mock sign out
      console.log('Mock sign out');
      return { error: null };
    }
  };

  // Mock conversation service
  window.conversationService = {
    async createConversation(data) {
      return {
        data: {
          id: 'conv_' + Date.now(),
          title: data.title,
          created_at: new Date().toISOString()
        }
      };
    },
    
    async getConversationMessages(conversationId) {
      // Return empty for demo
      return { data: [] };
    },
    
    async addMessage(messageData) {
      return {
        data: {
          id: 'msg_' + Date.now(),
          ...messageData,
          created_at: new Date().toISOString()
        }
      };
    },
    
    async deleteConversation(conversationId) {
      return { data: null };
    }
  };

  // Mock AI service
  window.aiService = {
    async chatWithAI(message, conversationId) {
      // Mock AI response
      return {
        data: {
          message: `I'll help you create that workflow! Here's a sample n8n workflow for your request: "${message}"`,
          content: 'AI response content'
        }
      };
    }
  };

})();