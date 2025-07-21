// Utils.js - Utility functions and helpers
// No dependencies

class Utils {
  static getTimeAgo(timestamp) {
    const diffMins = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  }

  static formatContent(content) {
    return content
      .replace(/```json\n([\s\S]*?)\n```/g, '<pre style="background: #1a1a1a; border: 1px solid #333333; padding: 12px; border-radius: 6px; overflow-x: hidden; font-size: 11px; margin: 8px 0; color: #ffffff; white-space: pre-wrap; word-wrap: break-word;"><code>$1</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  static async copyToClipboard(text) {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback to document.execCommand
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

  static getUserAvatar() {
    // Try to get user profile picture or first initial from email
    const userEmail = localStorage.getItem('n9n_user_email') || 'user@example.com';
    const userPfp = localStorage.getItem('n9n_user_avatar');
    
    if (userPfp && userPfp !== 'null') {
      return `<img src="${userPfp}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" alt="User">`;
    }
    
    // Return first initial of email
    return userEmail.charAt(0).toUpperCase();
  }

  static detectN8NPage() {
    const url = window.location.href;
    const indicators = [
      'n8n.io',
      '/workflow',
      '/executions',
      'n8n',
      () => document.querySelector('[data-test-id="workflow-canvas"]'),
      () => document.querySelector('.workflow-canvas'),
      () => document.querySelector('#n8n-root'),
      () => document.title.toLowerCase().includes('n8n')
    ];

    return indicators.some(indicator => {
      if (typeof indicator === 'string') {
        return url.includes(indicator);
      } else if (typeof indicator === 'function') {
        try {
          return indicator();
        } catch (e) {
          return false;
        }
      }
      return false;
    });
  }

  static detectN8nBaseUrl() {
    const currentUrl = window.location.href;
    
    // Extract base URL from current page
    if (currentUrl.includes('n8n.cloud')) {
      return currentUrl.split('/workflow')[0];
    } else if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
      const urlObj = new URL(currentUrl);
      return `${urlObj.protocol}//${urlObj.host}`;
    } else if (currentUrl.match(/\d+\.\d+\.\d+\.\d+/)) {
      // IP address
      const urlObj = new URL(currentUrl);
      return `${urlObj.protocol}//${urlObj.host}`;
    }
    
    return null;
  }

  static findButtonByText(text) {
    // Helper function to find buttons by text content
    const buttons = document.querySelectorAll('button');
    for (const button of buttons) {
      if (button.textContent.toLowerCase().includes(text.toLowerCase())) {
        return button;
      }
    }
    return null;
  }

  static showNotification(text) {
    const notification = document.createElement('div');
    notification.textContent = text;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2a2a2a;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      border: 1px solid #404040;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Export for use in other modules
window.Utils = Utils;