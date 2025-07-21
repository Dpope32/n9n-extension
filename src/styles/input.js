export const inputStyles = `
  /* Input Area Styles */
  .n9n-input-area {
    border-top: 1px solid #2a2a2a;
    background: rgba(255, 255, 255, 0.02);
    padding: 16px 20px;
  }

  .n9n-input-container {
    margin-bottom: 12px;
  }

  .n9n-input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 8px 16px;
    min-height: 56px;
    transition: all 0.2s ease;
  }

  .n9n-input-wrapper:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .n9n-input-wrapper textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 14px;
    font-family: inherit;
    resize: none;
    min-height: 40px;
    max-height: 120px;
    line-height: 1.4;
    
    /* COMPLETELY ELIMINATE ALL SCROLLBARS */
    overflow: hidden !important;
    overflow-y: hidden !important;
    overflow-x: hidden !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }

  /* Extra insurance - hide any scrollbars that might appear */
  .n9n-input-wrapper textarea::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }

  .n9n-input-wrapper textarea::placeholder {
    color: #6b7280;
  }

  .n9n-send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .n9n-send-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .n9n-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Suggestions */
  .n9n-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .n9n-suggestion {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    color: #d1d5db;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .n9n-suggestion:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    transform: translateY(-1px);
  }

  /* Header Styles */
  .n9n-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid #2a2a2a;
    min-height: 56px;
  }

  .n9n-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #ffffff;
    font-weight: 600;
    font-size: 16px;
  }

  .n9n-logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 8px;
    color: white;
  }

  .n9n-logo-text {
    font-weight: 700;
    letter-spacing: -0.5px;
  }

  .n9n-user-menu {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .n9n-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .n9n-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #9ca3af;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .n9n-menu-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
`;
