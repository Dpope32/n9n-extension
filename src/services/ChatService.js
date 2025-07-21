// Chat Service - Handles all chat-related logic
// Non-module version for browser extension compatibility

(function() {
  'use strict';
  
  window.ChatService = class ChatService {
    constructor() {
      this.currentConversationId = null;
      this.messages = [];
    }

    async initializeChat() {
      try {
        // For now, return a mock user since we don't have supabase setup
        const mockUser = {
          id: 'demo-user',
          email: 'demo@example.com',
          user_metadata: {
            full_name: 'Demo User',
            avatar_url: null
          }
        };

        // Load messages from localStorage as fallback
        const savedMessages = localStorage.getItem('n9n_chat_messages');
        if (savedMessages) {
          this.messages = JSON.parse(savedMessages);
        }

        return mockUser;
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        throw error;
      }
    }

    async sendMessage(content) {
      if (!content.trim()) return null;

      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: content,
        timestamp: new Date().toISOString()
      };
      
      this.messages.push(userMessage);

      try {
        // Mock AI response for demo
        const responses = [
          "I'll help you create that workflow! Here's a sample n8n workflow for your request:",
          "Great idea! Let me generate a workflow that handles that automation:",
          "Perfect! I can create a workflow for that. Here's what I suggest:",
          "Excellent use case! Here's a workflow that should meet your needs:"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const assistantMessage = {
          id: Date.now().toString() + '_ai',
          role: 'assistant',
          content: `${randomResponse}

\`\`\`json
{
  "nodes": [
    {
      "id": "start",
      "type": "n8n-nodes-base.manualTrigger",
      "name": "Manual Trigger",
      "position": [250, 300]
    },
    {
      "id": "process",
      "type": "n8n-nodes-base.function",
      "name": "Process Data",
      "position": [450, 300],
      "parameters": {
        "functionCode": "// Your workflow logic here\\nreturn items;"
      }
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [["Process Data"]]
    }
  }
}
\`\`\`

This workflow includes a manual trigger and processing step. You can modify it to fit your specific needs!`,
          timestamp: new Date().toISOString()
        };
        
        this.messages.push(assistantMessage);
        
        // Save to localStorage
        localStorage.setItem('n9n_chat_messages', JSON.stringify(this.messages));
        
        return assistantMessage;
      } catch (error) {
        console.error('Chat error:', error);
        
        const errorMessage = {
          id: Date.now().toString() + '_error',
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString()
        };
        
        this.messages.push(errorMessage);
        return errorMessage;
      }
    }

    async startNewConversation() {
      this.currentConversationId = null;
      this.messages = [];
      localStorage.removeItem('n9n_chat_messages');
    }

    async clearHistory() {
      this.messages = [];
      localStorage.removeItem('n9n_chat_messages');
    }

    getMessages() {
      return this.messages;
    }

    getCurrentConversationId() {
      return this.currentConversationId;
    }
  };

})();