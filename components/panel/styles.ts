export function loadStyles() {
    if (document.querySelector('#n9n-chat-styles')) return;

    const style = document.createElement('style');
    style.id = 'n9n-chat-styles';
    
    // Embedded CSS - no need to fetch from file
    style.textContent = `
/* n9n AI Copilot Chat Panel Styles */
.n9n-chat-panel {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #0f0f0f   0%, #1a1a1a 100%);
  border: none;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.n9n-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid #2a2a2a;
}

.n9n-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
}

.n9n-logo svg {
  color: #6366f1;
}

.n9n-user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.n9n-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.n9n-menu-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.n9n-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.n9n-auth {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.n9n-auth-content {
  text-align: center;
  color: #ffffff;
}

.n9n-auth-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.n9n-auth-content p {
  margin: 0 0 24px 0;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.5;
}

.n9n-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.n9n-btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #ffffff;
}

.n9n-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.n9n-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.n9n-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.n9n-messages::-webkit-scrollbar {
  width: 6px;
}

.n9n-messages::-webkit-scrollbar-track {
  background: transparent;
}

.n9n-messages::-webkit-scrollbar-thumb {
  background: #3a3a3a;
  border-radius: 3px;
}

.n9n-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #ffffff;
  padding: 40px 20px;
}

.n9n-empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
}

.n9n-empty-state p {
  margin: 0 0 24px 0;
  color: #9ca3af;
  font-size: 14px;
  line-height: 1.5;
}

.n9n-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s;
}

.n9n-message:hover {
  background: rgba(255, 255, 255, 0.04);
}

.n9n-message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.n9n-message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.n9n-assistant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.n9n-message-content {
  flex: 1;
  min-width: 0;
}

.n9n-message-text {
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.n9n-message-text code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'SF Mono', Consolas, monospace;
  font-size: 13px;
}

.n9n-message-time {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

.n9n-workflow-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.n9n-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  color: #d1d5db;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.n9n-action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4a4a4a;
  color: #ffffff;
}

.n9n-typing-dots {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.n9n-typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6b7280;
  animation: n9n-typing 1.4s infinite ease-in-out;
}

.n9n-typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.n9n-typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes n9n-typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.n9n-input-area {
  border-top: 1px solid #2a2a2a;
  background: rgba(255, 255, 255, 0.02);
}

.n9n-input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
}

.n9n-input-container textarea {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 13px;
  line-height: 1.3;
  resize: none;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.n9n-input-container textarea::-webkit-scrollbar {
  display: none;
}

.n9n-input-container textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.n9n-input-container textarea::placeholder {
  color: #6b7280;
}

.n9n-send-btn {
  background: #6366f1;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.n9n-send-btn:hover:not(:disabled) {
  background: #5b21b6;
  transform: translateY(-1px);
}

.n9n-send-btn:disabled {
  background: #3a3a3a;
  cursor: not-allowed;
  opacity: 0.5;
}

.n9n-suggestions {
  display: flex;
  gap: 8px;
  padding: 0 20px 16px;
  flex-wrap: wrap;
}

.n9n-suggestion {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3a3a3a;
  border-radius: 16px;
  padding: 6px 12px;
  color: #d1d5db;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.n9n-suggestion:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4a4a4a;
  color: #ffffff;
}

.n9n-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  z-index: 10000;
  transform: translateX(400px);
  transition: transform 0.3s ease;
  max-width: 300px;
}

.n9n-notification-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: 1px solid #065f46;
}

.n9n-notification-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 1px solid #991b1b;
}

.n9n-notification-show {
  transform: translateX(0);
}

.n9n-hamburger:hover,
.n9n-settings-btn:hover,
.n9n-new-chat-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

/* Code block styles */
.n9n-code-block {
  margin: 4px 0;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.n9n-code-block pre {
  margin: 0;
  padding: 8px 10px;
  overflow: hidden;
  background: transparent;
}

.n9n-code-block code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.4;
  color: #e5e7eb;
  background: transparent;
  padding: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
    `;
    
    document.head.appendChild(style);
  }