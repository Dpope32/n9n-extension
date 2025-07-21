// UI Service - Handles all UI rendering and interactions
// Non-module version for browser extension compatibility

(function() {
  'use strict';
  
  window.UIService = class UIService {
    constructor(container) {
      this.container = container;
    }

    renderHeader(isAuthenticated, user) {
      return `
        <div class="n9n-header">
          <div class="n9n-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            <span>n9n AI Copilot</span>
          </div>
          ${isAuthenticated ? `
            <div class="n9n-user-menu">
              <img src="${user?.user_metadata?.avatar_url || this.getDefaultAvatar()}" alt="User" class="n9n-avatar">
              <button class="n9n-menu-btn" data-action="toggle-menu">⋮</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    renderAuth() {
      return `
        <div class="n9n-auth">
          <div class="n9n-auth-content">
            <h3>Welcome to n9n AI Copilot</h3>
            <p>AI-powered workflow assistant for n8n</p>
            <button class="n9n-btn n9n-btn-primary" data-action="sign-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Demo
            </button>
          </div>
        </div>
      `;
    }

    renderChat(messages) {
      return `
        <div class="n9n-chat">
          ${this.renderRecentConversations()}
          <div class="n9n-messages" id="messages-container">
            ${messages.length > 0 ? messages.map(msg => this.renderMessage(msg)).join('') : this.renderEmptyState()}
          </div>
          ${this.renderInputArea()}
        </div>
      `;
    }

    renderRecentConversations() {
      // Get recent conversations from localStorage or service
      const recentConversations = this.getRecentConversations();
      
      return `
        <div class="n9n-recent-conversations">
          <div class="n9n-conversations-header">
            <h3>Recent Conversations</h3>
          </div>
          <div class="n9n-conversations-list">
            ${recentConversations.length > 0 ? 
              recentConversations.map(conv => this.renderConversationItem(conv)).join('') :
              '<div class="n9n-no-conversations">No recent conversations</div>'
            }
          </div>
        </div>
      `;
    }

    renderConversationItem(conversation) {
      return `
        <div class="n9n-conversation-item" data-conversation-id="${conversation.id}">
          <div class="n9n-conversation-title">${conversation.title}</div>
          <div class="n9n-conversation-meta">
            <span class="n9n-conversation-time">${this.getTimeAgo(conversation.lastActivity)}</span>
            <span class="n9n-conversation-messages">${conversation.messageCount} messages</span>
          </div>
        </div>
      `;
    }

    getRecentConversations() {
      // Mock data for now - replace with actual service call
      return [
        {
          id: '1',
          title: 'Build me a basic workflow that prints todays date',
          lastActivity: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), // 28 hours ago
          messageCount: 2
        }
      ];
    }

    renderEmptyState() {
      return `
        <div class="n9n-empty-state">
          <h3>Ready to build amazing workflows?</h3>
          <p>Describe what you want to automate and I'll help you create the perfect n8n workflow.</p>
          <div class="n9n-example-prompts">
            <div class="n9n-prompt-card">
              <span class="n9n-prompt-icon">📧</span>
              <span>Send automated emails based on triggers</span>
            </div>
            <div class="n9n-prompt-card">
              <span class="n9n-prompt-icon">🔄</span>
              <span>Sync data between different apps</span>
            </div>
            <div class="n9n-prompt-card">
              <span class="n9n-prompt-icon">📊</span>
              <span>Generate reports and dashboards</span>
            </div>
          </div>
        </div>
      `;
    }

    renderMessage(message) {
      const isUser = message.role === 'user';
      const timeAgo = this.getTimeAgo(message.timestamp);
      
      return `
        <div class="n9n-message ${isUser ? 'n9n-message-user' : 'n9n-message-assistant'}">
          <div class="n9n-message-avatar">
            ${isUser ? 
              `<img src="${this.getDefaultAvatar()}" alt="You">` :
              `<div class="n9n-assistant-avatar">🤖</div>`
            }
          </div>
          <div class="n9n-message-content">
            <div class="n9n-message-text">${this.formatMessageContent(message.content)}</div>
            <div class="n9n-message-time">${timeAgo}</div>
            ${!isUser && message.content.includes('workflow') ? this.renderWorkflowActions(message) : ''}
          </div>
        </div>
      `;
    }

    renderWorkflowActions(message) {
      return `
        <div class="n9n-workflow-actions">
          <button class="n9n-action-btn" data-action="inject-workflow" data-message-id="${message.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Add to n8n
          </button>
          <button class="n9n-action-btn" data-action="copy-workflow" data-message-id="${message.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
            </svg>
            Copy JSON
          </button>
          <button class="n9n-action-btn" data-action="modify-workflow" data-message-id="${message.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Modify
          </button>
        </div>
      `;
    }

    renderInputArea() {
      return `
        <div class="n9n-input-area">
          <div class="n9n-input-container">
            <textarea 
              placeholder="Describe the workflow you want to build..." 
              id="chat-input"
              rows="1"
              maxlength="2000"
            ></textarea>
            <button class="n9n-send-btn" id="send-btn" disabled>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="n9n-suggestions">
            <button class="n9n-suggestion" data-suggestion="Make a workflow that monitors website changes and sends Slack notifications">🔔 Website change monitor</button>
          </div>
        </div>
      `;
    }

    renderUserDropdown() {
      return `
        <div class="n9n-user-dropdown">
          <div class="n9n-dropdown-item" data-action="profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Profile
          </div>
          <div class="n9n-dropdown-item" data-action="new-conversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m7-7H5" stroke="currentColor" stroke-width="2"/>
            </svg>
            New Conversation
          </div>
          <div class="n9n-dropdown-item" data-action="clear-history">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Clear History
          </div>
          <div class="n9n-dropdown-divider"></div>
          <div class="n9n-dropdown-item" data-action="sign-out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2"/>
            </svg>
            Sign Out
          </div>
        </div>
      `;
    }

    renderTypingIndicator() {
      return `
        <div class="n9n-typing-indicator">
          <div class="n9n-message n9n-message-assistant">
            <div class="n9n-message-avatar">
              <div class="n9n-assistant-avatar">🤖</div>
            </div>
            <div class="n9n-message-content">
              <div class="n9n-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Helper methods
    formatMessageContent(content) {
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/```json\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>')
        .replace(/\n/g, '<br>');
    }

    getTimeAgo(timestamp) {
      const now = new Date();
      const time = new Date(timestamp);
      const diffMs = now - time;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return time.toLocaleDateString();
    }

    getDefaultAvatar() {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xMiAxNmEzIDMgMCAwIDEtMy0zaDZhMyAzIDAgMCAxLTMgMyIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Im0xNSA5YTMgMyAwIDEgMS02IDAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
    }

    showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `n9n-notification n9n-notification-${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('n9n-notification-show');
      }, 100);
      
      setTimeout(() => {
        notification.classList.remove('n9n-notification-show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    updateMessages(messages) {
      const messagesContainer = this.container.querySelector('#messages-container');
      if (messagesContainer) {
        messagesContainer.innerHTML = messages.length > 0 ? 
          messages.map(msg => this.renderMessage(msg)).join('') : 
          this.renderEmptyState();
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    addTypingIndicator() {
      const messagesContainer = this.container.querySelector('#messages-container');
      if (messagesContainer) {
        const indicator = document.createElement('div');
        indicator.innerHTML = this.renderTypingIndicator();
        indicator.className = 'n9n-typing-indicator';
        
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    removeTypingIndicator() {
      const indicator = this.container.querySelector('.n9n-typing-indicator');
      if (indicator) {
        indicator.remove();
      }
    }
  };

})();