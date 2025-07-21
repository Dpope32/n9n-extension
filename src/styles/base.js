export const chatPanelStyles = `
  .n9n-chat-panel {
    width: 400px;
    height: 600px;
    background: linear-gradient(145deg, #0f0f0f 0%, #1a1a1a 100%);
    border-radius: 16px;
    border: 1px solid #2a2a2a;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    overflow: hidden;
  }

  /* Auth Styles */
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

  /* Chat Styles */
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

  /* Empty State */
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

  .n9n-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
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
`;
