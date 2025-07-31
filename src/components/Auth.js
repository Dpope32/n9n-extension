export class Auth {
  constructor(onAction) {
    this.onAction = onAction;
  }

  render() {
    return `
      <div class="n9n-auth">
        <div class="n9n-auth-content">
          <h3>Welcome to n9n Copilot</h3>
          <p>Authentication is now handled directly in the chat panel</p>
          <button class="n9n-btn n9n-btn-primary" data-action="open-chat">
            Open Chat Panel
          </button>
        </div>
      </div>
    `;
  }
}
