// AuthUI.js - Handles authentication UI components and forms
// Depends on: AuthManager, UIManager

class AuthUI {
  constructor(authManager, uiManager) {
    this.authManager = authManager;
    this.uiManager = uiManager;
    this.currentMode = 'signin'; // 'signin', 'signup', 'reset'
    this.isLoading = false;
  }

  // Render the main authentication container
  renderAuthContainer() {
    return `
      <div id="auth-container" style="
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        background: #09090b;
        color: #fafafa;
      ">
        <div style="
          width: 100%;
          max-width: 320px;
          text-align: center;
        ">
          <!-- Auth Header -->
          <div style="
            margin-bottom: 32px;
          ">
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin-bottom: 16px;
            ">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style="color: #6366f1;">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span style="
                font-size: 24px;
                font-weight: 700;
                color: #fafafa;
              ">n9n</span>
            </div>
            <h2 id="auth-title" style="
              margin: 0 0 8px 0;
              font-size: 20px;
              font-weight: 600;
              color: #fafafa;
            ">Welcome Back</h2>
            <p id="auth-subtitle" style="
              margin: 0;
              font-size: 14px;
              color: #a1a1aa;
              line-height: 1.5;
            ">Sign in to access your AI copilot</p>
          </div>

          <!-- Auth Forms Container -->
          <div id="auth-forms">
            ${this.renderSignInForm()}
          </div>

          <!-- Auth Mode Toggle -->
          <div id="auth-toggle" style="
            margin-top: 24px;
            text-align: center;
          ">
            ${this.renderAuthToggle()}
          </div>

          <!-- Error Display -->
          <div id="auth-error" style="
            margin-top: 16px;
            padding: 12px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            color: #fca5a5;
            font-size: 14px;
            display: none;
          "></div>
        </div>
      </div>
    `;
  }

  // Render sign-in form
  renderSignInForm() {
    return `
      <form id="signin-form" style="
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
        <div style="
          display: flex;
          flex-direction: column;
          gap: 6px;
        ">
          <label for="signin-email" style="
            font-size: 14px;
            font-weight: 500;
            color: #fafafa;
          ">Email</label>
          <input
            id="signin-email"
            type="email"
            required
            placeholder="Enter your email"
            style="
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 12px 16px;
              color: #fafafa;
              font-size: 14px;
              outline: none;
              transition: all 0.2s;
              font-family: inherit;
            "
          >
        </div>

        <div style="
          display: flex;
          flex-direction: column;
          gap: 6px;
        ">
          <label for="signin-password" style="
            font-size: 14px;
            font-weight: 500;
            color: #fafafa;
          ">Password</label>
          <input
            id="signin-password"
            type="password"
            required
            placeholder="Enter your password"
            style="
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 12px 16px;
              color: #fafafa;
              font-size: 14px;
              outline: none;
              transition: all 0.2s;
              font-family: inherit;
            "
          >
        </div>

        <button
          id="signin-submit"
          type="submit"
          style="
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: none;
            border-radius: 8px;
            padding: 12px 16px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            margin-top: 8px;
          "
        >
          <span id="signin-submit-text">Sign In</span>
          <div id="signin-loading" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
        </button>

        <button
          id="forgot-password-link"
          type="button"
          style="
            background: none;
            border: none;
            color: #6366f1;
            font-size: 14px;
            cursor: pointer;
            text-decoration: underline;
            font-family: inherit;
            margin-top: 8px;
          "
        >
          Forgot your password?
        </button>
      </form>
    `;
  }

  // Render sign-up form
  renderSignUpForm() {
    return `
      <form id="signup-form" style="
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
        <div style="
          display: flex;
          flex-direction: column;
          gap: 6px;
        ">
          <label for="signup-email" style="
            font-size: 14px;
            font-weight: 500;
            color: #fafafa;
          ">Email</label>
          <input
            id="signup-email"
            type="email"
            required
            placeholder="Enter your email"
            style="
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 12px 16px;
              color: #fafafa;
              font-size: 14px;
              outline: none;
              transition: all 0.2s;
              font-family: inherit;
            "
          >
        </div>

        <div style="
          display: flex;
          flex-direction: column;
          gap: 6px;
        ">
          <label for="signup-password" style="
            font-size: 14px;
            font-weight: 500;
            color: #fafafa;
          ">Password</label>
          <input
            id="signup-password"
            type="password"
            required
            placeholder="Create a password"
            minlength="6"
            style="
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 12px 16px;
              color: #fafafa;
              font-size: 14px;
              outline: none;
              transition: all 0.2s;
              font-family: inherit;
            "
          >
        </div>

        <div style="
          display: flex;
          flex-direction: column;
          gap: 6px;
        ">
          <label for="signup-confirm-password" style="
            font-size: 14px;
            font-weight: 500;
            color: #fafafa;
          ">Confirm Password</label>
          <input
            id="signup-confirm-password"
            type="password"
            required
            placeholder="Confirm your password"
            minlength="6"
            style="
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 12px 16px;
              color: #fafafa;
              font-size: 14px;
              outline: none;
              transition: all 0.2s;
              font-family: inherit;
            "
          >
        </div>

        <div style="
          font-size: 12px;
          color: #a1a1aa;
          line-height: 1.4;
          margin-top: 4px;
        ">
          Password must be at least 6 characters long
        </div>

        <button
          id="signup-submit"
          type="submit"
          style="
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: none;
            border-radius: 8px;
            padding: 12px 16px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            margin-top: 8px;
          "
        >
          <span id="signup-submit-text">Create Account</span>
          <div id="signup-loading" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
        </button>
      </form>
    `;
  }

  // Render password reset form
  renderPasswordResetForm() {
    return `
      <form id="reset-form" style="
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
        <div style="
          display: flex;
          flex-direction: column;
          gap: 6px;
        ">
          <label for="reset-email" style="
            font-size: 14px;
            font-weight: 500;
            color: #fafafa;
          ">Email</label>
          <input
            id="reset-email"
            type="email"
            required
            placeholder="Enter your email"
            style="
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 8px;
              padding: 12px 16px;
              color: #fafafa;
              font-size: 14px;
              outline: none;
              transition: all 0.2s;
              font-family: inherit;
            "
          >
        </div>

        <div style="
          font-size: 12px;
          color: #a1a1aa;
          line-height: 1.4;
          margin-top: 4px;
        ">
          We'll send you a link to reset your password
        </div>

        <button
          id="reset-submit"
          type="submit"
          style="
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border: none;
            border-radius: 8px;
            padding: 12px 16px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            margin-top: 8px;
          "
        >
          <span id="reset-submit-text">Send Reset Link</span>
          <div id="reset-loading" style="display: none;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          </div>
        </button>

        <button
          id="back-to-signin-link"
          type="button"
          style="
            background: none;
            border: none;
            color: #6366f1;
            font-size: 14px;
            cursor: pointer;
            text-decoration: underline;
            font-family: inherit;
            margin-top: 8px;
          "
        >
          Back to Sign In
        </button>
      </form>
    `;
  }

  // Render auth mode toggle buttons
  renderAuthToggle() {
    if (this.currentMode === 'reset') {
      return ''; // No toggle for reset mode
    }

    const isSignIn = this.currentMode === 'signin';
    return `
      <div style="
        font-size: 14px;
        color: #a1a1aa;
      ">
        ${isSignIn ? "Don't have an account?" : "Already have an account?"}
        <button
          id="auth-mode-toggle"
          type="button"
          style="
            background: none;
            border: none;
            color: #6366f1;
            font-size: 14px;
            cursor: pointer;
            text-decoration: underline;
            font-family: inherit;
            margin-left: 4px;
          "
        >
          ${isSignIn ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    `;
  }

  // Switch between authentication modes
  switchMode(mode) {
    this.currentMode = mode;
    this.clearError();
    
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const authForms = document.getElementById('auth-forms');
    const authToggle = document.getElementById('auth-toggle');

    if (!authTitle || !authSubtitle || !authForms || !authToggle) {
      console.error('Auth UI elements not found');
      return;
    }

    // Update title and subtitle
    switch (mode) {
      case 'signin':
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Sign in to access your AI copilot';
        authForms.innerHTML = this.renderSignInForm();
        break;
      case 'signup':
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Join n9n to start building workflows';
        authForms.innerHTML = this.renderSignUpForm();
        break;
      case 'reset':
        authTitle.textContent = 'Reset Password';
        authSubtitle.textContent = 'Enter your email to receive a reset link';
        authForms.innerHTML = this.renderPasswordResetForm();
        break;
    }

    // Update toggle
    authToggle.innerHTML = this.renderAuthToggle();

    // Setup new event listeners
    this.setupFormEventListeners();
  }

  // Setup event listeners for forms
  setupFormEventListeners() {
    // Mode toggle
    const modeToggle = document.getElementById('auth-mode-toggle');
    if (modeToggle) {
      modeToggle.addEventListener('click', () => {
        const newMode = this.currentMode === 'signin' ? 'signup' : 'signin';
        this.switchMode(newMode);
      });
    }

    // Forgot password link
    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) {
      forgotLink.addEventListener('click', () => {
        this.switchMode('reset');
      });
    }

    // Back to sign in link
    const backLink = document.getElementById('back-to-signin-link');
    if (backLink) {
      backLink.addEventListener('click', () => {
        this.switchMode('signin');
      });
    }

    // Form submissions
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const resetForm = document.getElementById('reset-form');

    if (signinForm) {
      signinForm.addEventListener('submit', (e) => this.handleSignIn(e));
    }

    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignUp(e));
    }

    if (resetForm) {
      resetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
    }

    // Input focus effects
    this.setupInputEffects();
  }

  // Setup input focus and validation effects
  setupInputEffects() {
    const inputs = document.querySelectorAll('#auth-container input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = '#6366f1';
        input.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
      });

      input.addEventListener('blur', () => {
        input.style.borderColor = '#27272a';
        input.style.boxShadow = 'none';
      });

      // Real-time validation for password confirmation
      if (input.id === 'signup-confirm-password') {
        input.addEventListener('input', () => {
          const password = document.getElementById('signup-password');
          if (password && input.value && password.value !== input.value) {
            input.style.borderColor = '#ef4444';
          } else {
            input.style.borderColor = '#27272a';
          }
        });
      }
    });
  }

  // Handle sign in form submission
  async handleSignIn(e) {
    e.preventDefault();
    
    const email = document.getElementById('signin-email')?.value;
    const password = document.getElementById('signin-password')?.value;

    if (!email || !password) {
      this.showError('Please fill in all fields');
      return;
    }

    this.setLoading('signin', true);
    this.clearError();

    try {
      await this.authManager.signIn(email, password);
      // Success will be handled by auth state change listener
    } catch (error) {
      console.error('Sign in error:', error);
      this.showError(error.message || 'Failed to sign in');
    } finally {
      this.setLoading('signin', false);
    }
  }

  // Handle sign up form submission
  async handleSignUp(e) {
    e.preventDefault();
    
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;

    if (!email || !password || !confirmPassword) {
      this.showError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters long');
      return;
    }

    this.setLoading('signup', true);
    this.clearError();

    try {
      await this.authManager.signUp(email, password);
      // Success will be handled by auth state change listener
    } catch (error) {
      console.error('Sign up error:', error);
      this.showError(error.message || 'Failed to create account');
    } finally {
      this.setLoading('signup', false);
    }
  }

  // Handle password reset form submission
  async handlePasswordReset(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email')?.value;

    if (!email) {
      this.showError('Please enter your email address');
      return;
    }

    this.setLoading('reset', true);
    this.clearError();

    try {
      await this.authManager.resetPassword(email);
      this.showSuccess('Password reset link sent to your email');
      
      // Switch back to sign in after a delay
      setTimeout(() => {
        this.switchMode('signin');
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      this.showError(error.message || 'Failed to send reset email');
    } finally {
      this.setLoading('reset', false);
    }
  }

  // Set loading state for forms
  setLoading(formType, isLoading) {
    this.isLoading = isLoading;
    
    const submitBtn = document.getElementById(`${formType}-submit`);
    const submitText = document.getElementById(`${formType}-submit-text`);
    const loadingIcon = document.getElementById(`${formType}-loading`);

    if (submitBtn && submitText && loadingIcon) {
      submitBtn.disabled = isLoading;
      submitBtn.style.opacity = isLoading ? '0.7' : '1';
      submitText.style.display = isLoading ? 'none' : 'inline';
      loadingIcon.style.display = isLoading ? 'inline-flex' : 'none';
    }
  }

  // Show error message
  showError(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  // Show success message
  showSuccess(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.background = 'rgba(34, 197, 94, 0.1)';
      errorDiv.style.borderColor = 'rgba(34, 197, 94, 0.2)';
      errorDiv.style.color = '#86efac';
      errorDiv.style.display = 'block';
    }
  }

  // Clear error message
  clearError() {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
      errorDiv.style.display = 'none';
      errorDiv.style.background = 'rgba(239, 68, 68, 0.1)';
      errorDiv.style.borderColor = 'rgba(239, 68, 68, 0.2)';
      errorDiv.style.color = '#fca5a5';
    }
  }

  // Render user profile for authenticated state
  renderUserProfile(user) {
    return `
      <div id="user-profile" style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 8px;
        margin-bottom: 16px;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 600;
            font-size: 14px;
          ">
            ${user.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div style="
              font-size: 14px;
              font-weight: 500;
              color: #fafafa;
              margin-bottom: 2px;
            ">
              ${user.user_metadata?.display_name || 'User'}
            </div>
            <div style="
              font-size: 12px;
              color: #a1a1aa;
            ">
              ${user.email}
            </div>
          </div>
        </div>
        
        <button
          id="signout-btn"
          style="
            background: #27272a;
            border: 1px solid #3f3f46;
            border-radius: 6px;
            padding: 6px 12px;
            color: #a1a1aa;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
          "
        >
          Sign Out
        </button>
      </div>
    `;
  }

  // Setup user profile event listeners
  setupUserProfileListeners() {
    const signoutBtn = document.getElementById('signout-btn');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', async () => {
        try {
          await this.authManager.signOut();
          // Success will be handled by auth state change listener
        } catch (error) {
          console.error('Sign out error:', error);
          this.showError('Failed to sign out');
        }
      });

      // Hover effects
      signoutBtn.addEventListener('mouseenter', () => {
        signoutBtn.style.background = '#3f3f46';
        signoutBtn.style.color = '#fafafa';
      });

      signoutBtn.addEventListener('mouseleave', () => {
        signoutBtn.style.background = '#27272a';
        signoutBtn.style.color = '#a1a1aa';
      });
    }
  }
}

// Add CSS animations
const authStyles = document.createElement('style');
authStyles.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  #auth-container input:focus {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
  }
  
  #auth-container button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  #auth-container button:disabled {
    cursor: not-allowed;
  }
`;
document.head.appendChild(authStyles);

// Export to window for global access
window.AuthUI = AuthUI;