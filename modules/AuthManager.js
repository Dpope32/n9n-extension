// AuthManager.js - Handles user authentication with Supabase Auth
// Depends on: Utils

class AuthManager {
  constructor() {
    this.supabaseUrl = 'https://pvxfiwdtbukopfjrutzq.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eGZpd2R0YnVrb3BmanJ1dHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NTAzOTksImV4cCI6MjA2NjAyNjM5OX0.YypL3hkw4rAcWWuL7i80BC20gN7J9JZZx6cLZa8ISZc';
    this.authStateChangeCallbacks = [];
    this.currentUser = null;
    this.currentSession = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    try {
      // Only check for existing session if we have a token
      const token = localStorage.getItem('supabase.auth.token');
      if (token) {
        await this.getSession();
      }
      this.isInitialized = true;
      console.log('✅ AuthManager initialized');
    } catch (error) {
      console.error('❌ AuthManager initialization failed:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Sign up a new user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication result
   */
  async signUp(email, password) {
    try {
      const response = await this.makeAuthRequest('POST', 'signup', {
        email,
        password
      });

      if (response.user) {
        this.currentUser = response.user;
        this.currentSession = response.session;
        
        if (response.session) {
          await this.storeSession(response.session);
        }
        
        this.notifyAuthStateChange();
        console.log('✅ User signed up successfully:', response.user.email);
        
        return {
          success: true,
          user: response.user,
          session: response.session,
          message: 'Account created successfully'
        };
      } else {
        throw new Error('No user data returned from signup');
      }
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      return this.handleAuthError(error, 'signup');
    }
  }

  /**
   * Sign in an existing user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication result
   */
  async signIn(email, password) {
    try {
      const response = await this.makeAuthRequest('POST', 'token?grant_type=password', {
        email,
        password
      });

      if (response.user && response.access_token) {
        this.currentUser = response.user;
        this.currentSession = {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: response.expires_at,
          user: response.user
        };
        
        await this.storeSession(this.currentSession);
        this.notifyAuthStateChange();
        console.log('✅ User signed in successfully:', response.user.email);
        
        return {
          success: true,
          user: response.user,
          session: this.currentSession,
          message: 'Signed in successfully'
        };
      } else {
        throw new Error('Invalid credentials or no user data returned');
      }
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      return this.handleAuthError(error, 'signin');
    }
  }

  /**
   * Sign in with Google OAuth
   * @returns {Promise<Object>} Authentication result
   */
  async signInWithGoogle() {
    try {
      // Use the real Supabase client for Google OAuth
      if (!window.supabaseClient) {
        throw new Error('Supabase client not available');
      }

      const { data, error } = await window.supabaseClient.signInWithGoogle();
      
      if (error) {
        throw error;
      }

      // Get the current user after successful sign in
      const { user } = await window.supabaseClient.getCurrentUser();
      
      if (user) {
        this.currentUser = user;
        this.currentSession = {
          access_token: user.access_token,
          refresh_token: user.refresh_token,
          expires_at: user.expires_at,
          user: user
        };
        
        await this.storeSession(this.currentSession);
        this.notifyAuthStateChange();
        console.log('✅ User signed in with Google successfully:', user.email);
        
        return {
          success: true,
          user: user,
          session: this.currentSession,
          message: 'Signed in with Google successfully'
        };
      } else {
        throw new Error('No user data returned from Google sign in');
      }
    } catch (error) {
      console.error('❌ Google sign in failed:', error);
      return this.handleAuthError(error, 'google-signin');
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<Object>} Sign out result
   */
  async signOut() {
    try {
      // Use the real Supabase client for sign out
      if (window.supabaseClient) {
        await window.supabaseClient.signOut();
      }
      
      await this.clearSession();
      this.currentUser = null;
      this.currentSession = null;
      this.notifyAuthStateChange();
      
      console.log('✅ User signed out successfully');
      return {
        success: true,
        message: 'Signed out successfully'
      };
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      // Even if the server request fails, clear local session
      await this.clearSession();
      this.currentUser = null;
      this.currentSession = null;
      this.notifyAuthStateChange();
      
      return {
        success: true,
        message: 'Signed out successfully'
      };
    }
  }

  /**
   * Reset password for a user
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(email) {
    try {
      await this.makeAuthRequest('POST', 'recover', {
        email
      });
      
      console.log('✅ Password reset email sent to:', email);
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      return this.handleAuthError(error, 'reset');
    }
  }

  /**
   * Get current session from storage or validate existing session
   * @returns {Promise<Object|null>} Current session or null
   */
  async getSession() {
    try {
      // Use the real Supabase client to get session
      if (window.supabaseClient) {
        const { session } = await window.supabaseClient.getSession();
        if (session) {
          this.currentSession = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user: session.user
          };
          this.currentUser = session.user;
          return this.currentSession;
        }
      }
      
      // Fallback to storage-based approach
      // First check if we have a session in memory
      if (this.currentSession && this.isSessionValid(this.currentSession)) {
        return this.currentSession;
      }
      
      // Try to get session from storage
      const storedSession = await this.getStoredSession();
      if (storedSession && this.isSessionValid(storedSession)) {
        this.currentSession = storedSession;
        this.currentUser = storedSession.user;
        return storedSession;
      }
      
      // Try to refresh the session if we have a refresh token
      if (storedSession?.refresh_token) {
        const refreshResult = await this.refreshSession(storedSession.refresh_token);
        if (refreshResult.success) {
          return this.currentSession;
        }
      }
      
      // No valid session found
      await this.clearSession();
      this.currentSession = null;
      this.currentUser = null;
      return null;
    } catch (error) {
      // Handle extension context invalidation gracefully
      if (error.message.includes('Extension context invalidated')) {
        console.log('⚠️ Extension context invalidated, using localStorage fallback');
        try {
          const localSession = localStorage.getItem('n9n_session');
          if (localSession) {
            const parsed = JSON.parse(localSession);
            if (this.isSessionValid(parsed)) {
              this.currentSession = parsed;
              this.currentUser = parsed.user;
              return parsed;
            }
          }
        } catch (localError) {
          console.error('❌ Error reading from localStorage:', localError);
        }
      } else {
        console.error('❌ Error getting session:', error);
      }
      
      await this.clearSession();
      this.currentSession = null;
      this.currentUser = null;
      return null;
    }
  }

  /**
   * Refresh an expired session using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Refresh result
   */
  async refreshSession(refreshToken) {
    try {
      const response = await this.makeAuthRequest('POST', 'token?grant_type=refresh_token', {
        refresh_token: refreshToken
      });

      if (response.access_token) {
        this.currentSession = {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: response.expires_at,
          user: response.user
        };
        
        this.currentUser = response.user;
        await this.storeSession(this.currentSession);
        this.notifyAuthStateChange();
        
        console.log('✅ Session refreshed successfully');
        return {
          success: true,
          session: this.currentSession
        };
      } else {
        throw new Error('No access token returned from refresh');
      }
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      await this.clearSession();
      this.currentSession = null;
      this.currentUser = null;
      this.notifyAuthStateChange();
      
      return {
        success: false,
        error: 'Session refresh failed'
      };
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!(this.currentUser && this.currentSession && this.isSessionValid(this.currentSession));
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} Current user or null
   */
  async getCurrentUser() {
    try {
      // Use the real Supabase client to get current user
      if (window.supabaseClient) {
        const { user } = await window.supabaseClient.getCurrentUser();
        if (user) {
          this.currentUser = user;
          return user;
        }
      }
      
      // Fallback to session-based approach
      if (!this.currentUser) {
        await this.getSession();
      }
      return this.currentUser;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get the current session's ID token (access token)
   * @returns {Promise<string|null>} ID token or null if not authenticated
   */
  async getIdToken() {
    // If we don't have a current session, try to get it first
    if (!this.currentSession) {
      await this.getSession();
    }
    
    if (this.currentSession && this.isSessionValid(this.currentSession)) {
      return this.currentSession.access_token;
    }
    
    return null;
  }

  /**
   * Register callback for authentication state changes
   * @param {Function} callback - Callback function to call on auth state change
   */
  onAuthStateChange(callback) {
    if (typeof callback === 'function') {
      this.authStateChangeCallbacks.push(callback);
    }
  }

  /**
   * Remove authentication state change callback
   * @param {Function} callback - Callback function to remove
   */
  offAuthStateChange(callback) {
    const index = this.authStateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.authStateChangeCallbacks.splice(index, 1);
    }
  }

  // Private methods

  /**
   * Make authenticated request to Supabase Auth API
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} additionalHeaders - Additional headers
   * @returns {Promise<Object>} API response
   */
  async makeAuthRequest(method, endpoint, data = {}, additionalHeaders = {}) {
    const url = `${this.supabaseUrl}/auth/v1/${endpoint}`;
    const headers = {
      'apikey': this.supabaseKey,
      'Content-Type': 'application/json',
      ...additionalHeaders
    };

    const options = {
      method,
      headers
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorMessage = `Auth request failed: ${response.status} ${response.statusText}`;
      try {
        const errorBody = await response.json();
        if (errorBody.error_description) {
          errorMessage = errorBody.error_description;
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * Store session in Chrome storage
   * @param {Object} session - Session to store
   */
  async storeSession(session) {
    try {
      // Check if chrome.storage is available (extension context might be invalidated)
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({
          'n9n_auth_session': session
        });
        console.log('✅ Session stored successfully');
      } else {
        throw new Error('Chrome storage not available');
      }
    } catch (error) {
      console.error('❌ Failed to store session:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem('n9n_session', JSON.stringify(session));
        console.log('✅ Session stored in localStorage fallback');
      } catch (e) {
        console.error('❌ Failed to store session in localStorage:', e);
      }
    }
  }

  /**
   * Get stored session from Chrome storage
   * @returns {Promise<Object|null>} Stored session or null
   */
  async getStoredSession() {
    try {
      // Check if chrome.storage is available (extension context might be invalidated)
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(['n9n_session']);
        return result.n9n_session || null;
      } else {
        throw new Error('Chrome storage not available');
      }
    } catch (error) {
      // Handle extension context invalidation gracefully
      if (error.message.includes('Extension context invalidated')) {
        console.log('⚠️ Extension context invalidated, trying localStorage fallback');
        try {
          const stored = localStorage.getItem('n9n_session');
          return stored ? JSON.parse(stored) : null;
        } catch (localError) {
          console.error('❌ Error reading from localStorage:', localError);
          return null;
        }
      } else {
        console.error('❌ Failed to get stored session:', error);
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem('n9n_session');
          return stored ? JSON.parse(stored) : null;
        } catch (e) {
          console.error('❌ Failed to get session from localStorage:', e);
          return null;
        }
      }
    }
  }

  /**
   * Clear session from storage
   * @returns {Promise<void>}
   */
  async clearSession() {
    try {
      // Clear from chrome.storage
      if (chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove(['n9n_session', 'n9n_user']);
        console.log('✅ Session cleared from storage');
      }
    } catch (error) {
      // Handle extension context invalidation gracefully
      if (error.message.includes('Extension context invalidated')) {
        console.log('⚠️ Extension context invalidated, clearing local storage only');
      } else {
        console.error('❌ Error clearing session from storage:', error);
      }
    }

    try {
      // Clear from localStorage as fallback
      localStorage.removeItem('n9n_session');
      localStorage.removeItem('n9n_user');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refresh_token');
      console.log('✅ Session cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing session from localStorage:', error);
    }
  }

  /**
   * Check if session is valid (not expired)
   * @param {Object} session - Session to validate
   * @returns {boolean} Session validity
   */
  isSessionValid(session) {
    if (!session || !session.access_token || !session.expires_at) {
      return false;
    }
    
    const expiresAt = new Date(session.expires_at * 1000); // Convert to milliseconds
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    return expiresAt.getTime() > (now.getTime() + bufferTime);
  }

  /**
   * Handle authentication errors and return standardized error response
   * @param {Error} error - Error object
   * @param {string} operation - Operation that failed
   * @returns {Object} Standardized error response
   */
  handleAuthError(error, operation) {
    let message = 'An unexpected error occurred';
    
    if (error.message.includes('Invalid login credentials')) {
      message = 'Invalid email or password';
    } else if (error.message.includes('Email not confirmed')) {
      message = 'Please check your email and confirm your account';
    } else if (error.message.includes('User already registered')) {
      message = 'An account with this email already exists';
    } else if (error.message.includes('Password should be at least')) {
      message = 'Password must be at least 6 characters long';
    } else if (error.message.includes('Invalid email')) {
      message = 'Please enter a valid email address';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      message = 'Network error. Please check your connection and try again';
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      error: message,
      operation
    };
  }

  /**
   * Notify all registered callbacks about authentication state changes
   */
  notifyAuthStateChange() {
    const authState = {
      isAuthenticated: this.isAuthenticated(),
      user: this.currentUser,
      session: this.currentSession
    };

    this.authStateChangeCallbacks.forEach(callback => {
      try {
        callback(authState);
      } catch (error) {
        console.error('❌ Error in auth state change callback:', error);
      }
    });
  }
}

// Export for use in other modules
window.AuthManager = AuthManager;