// ChatManager.js - Handles all chat functionality
// Depends on: Utils

class ChatManager {
  constructor() {
    this.messages = JSON.parse(localStorage.getItem('n9n_chat_messages') || '[]');
    this.currentConversationId = null;
  }

  getMessages() {
    return this.messages;
  }

  addMessage(role, content) {
    const message = {
      id: Date.now().toString() + (role === 'assistant' ? '_ai' : ''),
      role,
      content,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(message);
    this.saveMessages();
    return message;
  }

  saveMessages() {
    localStorage.setItem('n9n_chat_messages', JSON.stringify(this.messages));
    console.log('💾 Saved', this.messages.length, 'messages to localStorage');
  }

  clearMessages() {
    this.messages = [];
    this.currentConversationId = null;
    localStorage.removeItem('n9n_chat_messages');
  }

  // Conversation management
  getRecentConversations() {
    const conversations = JSON.parse(localStorage.getItem('n9n_conversations') || '[]');
    return conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
  }

  saveConversation(title) {
    const conversations = this.getRecentConversations();
    const newConversation = {
      id: Date.now().toString(),
      title: title.substring(0, 50) + (title.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString(),
      messageCount: this.messages.length,
      messages: this.messages
    };
    
    conversations.unshift(newConversation);
    localStorage.setItem('n9n_conversations', JSON.stringify(conversations.slice(0, 20)));
    return newConversation.id;
  }

  loadConversation(conversationId) {
    const conversations = this.getRecentConversations();
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      this.messages = conversation.messages || [];
      this.currentConversationId = conversationId;
      return true;
    }
    return false;
  }

  updateConversation() {
    if (!this.currentConversationId) return;
    
    const conversations = this.getRecentConversations();
    const index = conversations.findIndex(c => c.id === this.currentConversationId);
    
    if (index !== -1) {
      conversations[index].messageCount = this.messages.length;
      conversations[index].messages = this.messages;
      conversations[index].timestamp = new Date().toISOString();
      localStorage.setItem('n9n_conversations', JSON.stringify(conversations));
    }
  }

  startNewConversation() {
    this.messages = [];
    this.currentConversationId = null;
  }

  // Auto-save conversation after exchanges
  handleMessageExchange(userMessage) {
    // Save conversation after first exchange
    if (this.messages.length === 2 && !this.currentConversationId) {
      this.currentConversationId = this.saveConversation(userMessage);
    } else if (this.currentConversationId) {
      this.updateConversation();
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