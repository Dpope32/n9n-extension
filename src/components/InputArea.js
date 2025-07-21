export class InputArea {
  constructor(onAction) {
    this.onAction = onAction;
  }

  render() {
    return `
      <div class="n9n-input-area">
        <div class="n9n-input-container">
          <div class="n9n-input-wrapper">
            <textarea 
              placeholder="Describe the workflow you want to build..." 
              id="chat-input"
              rows="1"
              maxlength="2000"
            ></textarea>
            <button class="n9n-send-btn" id="send-btn" disabled>
              ${this.getSendIcon()}
            </button>
          </div>
        </div>
        <div class="n9n-suggestions">
          ${this.renderSuggestions()}
        </div>
      </div>
    `;
  }

  renderSuggestions() {
    const suggestions = [
      {
        text: "📊 Daily email reports",
        prompt: "Create a workflow that sends daily email reports"
      },
      {
        text: "🔄 Sync Google Sheets ↔ Airtable", 
        prompt: "Build a workflow to sync data between Google Sheets and Airtable"
      },
      {
        text: "🔔 Website change monitor",
        prompt: "Make a workflow that monitors website changes and sends Slack notifications"
      }
    ];

    return suggestions.map(suggestion => 
      `<button class="n9n-suggestion" data-suggestion="${suggestion.prompt}">${suggestion.text}</button>`
    ).join('');
  }

  setupEventListeners(container) {
    const input = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#send-btn');
    const suggestions = container.querySelectorAll('.n9n-suggestion');

    if (input) {
      input.addEventListener('input', (e) => this.handleInput(e, container));
      input.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.onAction('send-message'));
    }

    suggestions.forEach(suggestion => {
      suggestion.addEventListener('click', (e) => {
        input.value = e.target.dataset.suggestion;
        input.focus();
        sendBtn.disabled = false;
        input.dispatchEvent(new Event('input'));
      });
    });
  }

  handleInput(event, container) {
    const input = event.target;
    const sendBtn = container.querySelector('#send-btn');
    const wrapper = input.closest('.n9n-input-wrapper');
    
    // COMPLETELY ELIMINATE SCROLLBAR - Auto-resize without any scroll
    input.style.height = 'auto';
    const newHeight = Math.min(Math.max(input.scrollHeight, 40), 120);
    input.style.height = newHeight + 'px';
    
    // Update wrapper height to match perfectly
    if (wrapper) {
      wrapper.style.height = newHeight + 16 + 'px'; // 16px for padding
    }
    
    // Enable/disable send button
    if (sendBtn) {
      sendBtn.disabled = !input.value.trim();
    }
  }

  handleKeydown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onAction('send-message');
    }
  }

  clearInput(container) {
    const input = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#send-btn');
    const wrapper = container.querySelector('.n9n-input-wrapper');

    if (input) {
      input.value = '';
      input.style.height = '40px';
    }
    if (wrapper) {
      wrapper.style.height = '56px'; // 40px + 16px padding
    }
    if (sendBtn) {
      sendBtn.disabled = true;
    }
  }

  getSendIcon() {
    return `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  }
}
