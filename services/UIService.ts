// ============================================================================
// UIService - Handles all UI rendering and interactions
// ============================================================================

export class UIService {
    private container: HTMLElement;

    constructor(container: HTMLElement) {
      this.container = container;
    }
  
    renderHeader(isAuthenticated, user) {
      return `
        <div class="n9n-header">
          <div class="n9n-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            <span>n9n AI Copilot</span>
          </div>
          <div style="display: flex; gap: 2px;">
            <button class="n9n-new-chat-btn" data-action="new-chat" title="New Chat" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 6px; border-radius: 4px; transition: all 0.2s;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <button class="n9n-settings-btn" data-action="open-settings" title="API Settings" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 6px; border-radius: 4px; transition: all 0.2s;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button class="n9n-hamburger" data-action="close-panel" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 6px; border-radius: 4px; transition: all 0.2s;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
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
          <div class="n9n-messages" id="messages-container">
            ${messages.length > 0 ? messages.map(msg => this.renderMessage(msg)).join('') : this.renderEmptyState()}
          </div>
          ${this.renderInputArea()}
        </div>
      `;
    }
  
    renderEmptyState() {
      return `
        <div class="n9n-empty-state">
          <h3>Ready to build amazing workflows?</h3>
          <p>Describe what you want to automate and I'll help you create the perfect n8n workflow.</p>
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
              `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="background: #404040; border-radius: 50%; padding: 6px;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="#9ca3af" stroke-width="2"/>
              </svg>` :
              // @ts-ignore - chrome.runtime.getURL is not defined in the content script
              `<img src="${chrome.  runtime.getURL('assets/void.png')}" alt="AI" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`
            }
          </div>
          <div class="n9n-message-content">
            <div class="n9n-message-text">${this.formatMessageContent(message.content)}</div>
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
        </div>
      `;
    }
  
    // FIXED: renderInputArea with proper bottom positioning and NO suggestions
    renderInputArea() {
      return `
        <div class="n9n-input-area">
          <div class="n9n-input-container">
            <textarea 
              placeholder="What should this workflow do?" 
              id="chat-input"
              rows="1"
              maxlength="2000"
            ></textarea>
            <button class="n9n-send-btn" id="send-btn" data-action="send-message" disabled>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    }
  
    // Helper methods
    formatMessageContent(content) {
      // Handle JSON code blocks specially
      content = content.replace(/```json\n([\s\S]*?)\n```/g, (match, jsonContent) => {
        try {
          // Parse and prettify the JSON
          const parsed = JSON.parse(jsonContent);
          const lines = JSON.stringify(parsed, null, 2).split('\n');
          
          // Show only first 5 lines if it's long
          let displayContent;
          if (lines.length > 8) {
            displayContent = lines.slice(0, 5).join('\n') + '\n  ...\n}';
          } else {
            displayContent = lines.join('\n');
          }
          
          return `<div class="n9n-code-block">
            <pre><code>${this.escapeHtml(displayContent)}</code></pre>
          </div>`;
        } catch (e) {
          // If JSON parsing fails, show as-is
          return `<div class="n9n-code-block">
            <pre><code>${this.escapeHtml(jsonContent)}</code></pre>
          </div>`;
        }
      });
      
      // Handle other formatting
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    }
    
    escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  
    getTimeAgo(timestamp) {
      const now = new Date();
      const time = new Date(timestamp);
      const diffMs = now.getTime() - time.getTime();
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
        indicator.innerHTML = '<div class="n9n-typing-dots"><span></span><span></span><span></span></div>';
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
  