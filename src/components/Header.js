export class Header {
  constructor(state, onAction) {
    this.state = state;
    this.onAction = onAction;
  }

  render() {
    return `
      <div class="n9n-header">
        <div class="n9n-logo">
          <div class="n9n-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="n9n-logo-text">n9n</span>
        </div>
        ${this.renderUserMenu()}
      </div>
    `;
  }

  renderUserMenu() {
    if (this.state.isAuthenticated) {
      return `
        <div class="n9n-user-menu">
          <img src="${this.state.user?.user_metadata?.avatar_url || this.getDefaultAvatar()}" alt="User" class="n9n-avatar">
          <button class="n9n-menu-btn" data-action="toggle-menu">
            ${this.getHamburgerIcon()}
          </button>
        </div>
      `;
    } else {
      return `
        <button class="n9n-menu-btn" data-action="toggle-menu">
          ${this.getHamburgerIcon()}
        </button>
      `;
    }
  }

  getDefaultAvatar() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xMiAxNmEzIDMgMCAwIDEtMy0zaDZhMyAzIDAgMCAxLTMgMyIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Im0xNSA5YTMgMyAwIDEgMS02IDAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
  }

  getHamburgerIcon() {
    return `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
}
