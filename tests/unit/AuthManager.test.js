/**
 * AuthManager Unit Tests
 * 
 * Comprehensive unit tests for the AuthManager class covering:
 * - Constructor and initialization
 * - Authentication methods (signUp, signIn, signOut, getSession)
 * - Error handling utilities
 * - Session management
 * - State change notifications
 */

const { TEST_CONFIG } = require('../setup/test-config');

// Mock Chrome APIs for testing
global.chrome = {
  storage: {
    local: {
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue(undefined)
    }
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock console methods to suppress logging during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Import AuthManager after mocks are set up
const AuthManagerCode = require('fs').readFileSync(
  require('path').join(process.cwd(), 'modules/AuthManager.js'), 
  'utf8'
);

// Execute the AuthManager code to define the class
eval(AuthManagerCode.replace('window.AuthManager = AuthManager;', 'global.AuthManager = AuthManager;'));

describe('AuthManager', () => {
  let authManager;
  
  // Helper function to generate unique test emails
  const generateTestEmail = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test-${timestamp}-${random}@example.com`;
  };
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Create fresh instance
    authManager = new global.AuthManager();
  });
  
  afterEach(() => {
    // Clean up
    authManager = null;
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(authManager.supabaseUrl).toBe('https://pvxfiwdtbukopfjrutzq.supabase.co');
      expect(authManager.supabaseKey).toBeDefined();
      expect(authManager.authStateChangeCallbacks).toEqual([]);
      expect(authManager.currentUser).toBeNull();
      expect(authManager.currentSession).toBeNull();
      // isInitialized will be true after constructor runs init()
      expect(authManager.isInitialized).toBe(true);
    });

    test('should have all required methods', () => {
      expect(typeof authManager.signUp).toBe('function');
      expect(typeof authManager.signIn).toBe('function');
      expect(typeof authManager.signOut).toBe('function');
      expect(typeof authManager.getSession).toBe('function');
      expect(typeof authManager.resetPassword).toBe('function');
      expect(typeof authManager.isAuthenticated).toBe('function');
      expect(typeof authManager.getCurrentUser).toBe('function');
      expect(typeof authManager.onAuthStateChange).toBe('function');
      expect(typeof authManager.offAuthStateChange).toBe('function');
    });

    test('should initialize and check for existing session', async () => {
      // Mock getSession to resolve
      authManager.getSession = jest.fn().mockResolvedValue(null);
      
      await authManager.init();
      
      expect(authManager.getSession).toHaveBeenCalled();
      expect(authManager.isInitialized).toBe(true);
    });
  });

  describe('signUp method', () => {
    test('should successfully sign up a new user', async () => {
      const testEmail = generateTestEmail();
      const mockResponse = {
        user: {
          id: 'user-123',
          email: testEmail
        },
        session: {
          access_token: 'token-123',
          refresh_token: 'refresh-123',
          expires_at: Date.now() / 1000 + 3600
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      authManager.storeSession = jest.fn().mockResolvedValue(undefined);
      authManager.notifyAuthStateChange = jest.fn();

      const result = await authManager.signUp(testEmail, 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockResponse.user);
      expect(result.message).toBe('Account created successfully');
      expect(authManager.currentUser).toEqual(mockResponse.user);
      expect(authManager.currentSession).toEqual(mockResponse.session);
      expect(authManager.storeSession).toHaveBeenCalledWith(mockResponse.session);
      expect(authManager.notifyAuthStateChange).toHaveBeenCalled();
    });

    test('should handle signup failure with proper error message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          error_description: 'User already registered'
        })
      });

      const testEmail = generateTestEmail();
      const result = await authManager.signUp(testEmail, 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('An account with this email already exists');
      expect(result.operation).toBe('signup');
    });

    test('should handle network errors during signup', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const testEmail = generateTestEmail();
      const result = await authManager.signUp(testEmail, 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('signIn method', () => {
    test('should successfully sign in an existing user', async () => {
      const testEmail = generateTestEmail();
      const mockResponse = {
        user: {
          id: 'user-123',
          email: testEmail
        },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        expires_at: Date.now() / 1000 + 3600
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      authManager.storeSession = jest.fn().mockResolvedValue(undefined);
      authManager.notifyAuthStateChange = jest.fn();

      const result = await authManager.signIn(testEmail, 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockResponse.user);
      expect(result.message).toBe('Signed in successfully');
      expect(authManager.currentUser).toEqual(mockResponse.user);
      expect(authManager.storeSession).toHaveBeenCalled();
      expect(authManager.notifyAuthStateChange).toHaveBeenCalled();
    });

    test('should handle invalid credentials', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          error_description: 'Invalid login credentials'
        })
      });

      const testEmail = generateTestEmail();
      const result = await authManager.signIn(testEmail, 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
      expect(result.operation).toBe('signin');
    });
  });

  describe('signOut method', () => {
    test('should successfully sign out user', async () => {
      // Set up authenticated state
      authManager.currentSession = {
        access_token: 'token-123'
      };
      authManager.currentUser = { id: 'user-123' };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      authManager.clearSession = jest.fn().mockResolvedValue(undefined);
      authManager.notifyAuthStateChange = jest.fn();

      const result = await authManager.signOut();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Signed out successfully');
      expect(authManager.currentUser).toBeNull();
      expect(authManager.currentSession).toBeNull();
      expect(authManager.clearSession).toHaveBeenCalled();
      expect(authManager.notifyAuthStateChange).toHaveBeenCalled();
    });

    test('should handle signout even if server request fails', async () => {
      authManager.currentSession = {
        access_token: 'token-123'
      };

      fetch.mockRejectedValueOnce(new Error('Network error'));
      authManager.clearSession = jest.fn().mockResolvedValue(undefined);
      authManager.notifyAuthStateChange = jest.fn();

      const result = await authManager.signOut();

      expect(result.success).toBe(true);
      expect(authManager.currentUser).toBeNull();
      expect(authManager.currentSession).toBeNull();
    });
  });

  describe('getSession method', () => {
    test('should return current session if valid', async () => {
      const validSession = {
        access_token: 'token-123',
        expires_at: (Date.now() / 1000) + 3600, // 1 hour from now
        user: { id: 'user-123' }
      };

      authManager.currentSession = validSession;
      authManager.isSessionValid = jest.fn().mockReturnValue(true);

      const result = await authManager.getSession();

      expect(result).toEqual(validSession);
    });

    test('should return null if no valid session exists', async () => {
      authManager.getStoredSession = jest.fn().mockResolvedValue(null);
      authManager.clearSession = jest.fn().mockResolvedValue(undefined);

      const result = await authManager.getSession();

      expect(result).toBeNull();
      expect(authManager.currentSession).toBeNull();
      expect(authManager.currentUser).toBeNull();
    });

    test('should refresh session if refresh token is available', async () => {
      const expiredSession = {
        access_token: 'old-token',
        refresh_token: 'refresh-123',
        expires_at: (Date.now() / 1000) - 3600 // 1 hour ago
      };

      authManager.getStoredSession = jest.fn().mockResolvedValue(expiredSession);
      authManager.isSessionValid = jest.fn().mockReturnValue(false);
      authManager.refreshSession = jest.fn().mockResolvedValue({
        success: true,
        session: { access_token: 'new-token' }
      });

      const result = await authManager.getSession();

      expect(authManager.refreshSession).toHaveBeenCalledWith('refresh-123');
    });
  });

  describe('Session Management', () => {
    test('should store session in Chrome storage', async () => {
      const session = { access_token: 'token-123' };

      await authManager.storeSession(session);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        'n9n_auth_session': session
      });
    });

    test('should fallback to localStorage if Chrome storage fails', async () => {
      const session = { access_token: 'token-123' };
      chrome.storage.local.set.mockRejectedValueOnce(new Error('Storage error'));

      await authManager.storeSession(session);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'n9n_auth_session',
        JSON.stringify(session)
      );
    });

    test('should get stored session from Chrome storage', async () => {
      const session = { access_token: 'token-123' };
      chrome.storage.local.get.mockResolvedValueOnce({
        'n9n_auth_session': session
      });

      const result = await authManager.getStoredSession();

      expect(result).toEqual(session);
      expect(chrome.storage.local.get).toHaveBeenCalledWith(['n9n_auth_session']);
    });

    test('should fallback to localStorage if Chrome storage fails', async () => {
      const session = { access_token: 'token-123' };
      chrome.storage.local.get.mockRejectedValueOnce(new Error('Storage error'));
      localStorage.getItem.mockReturnValue(JSON.stringify(session));

      const result = await authManager.getStoredSession();

      expect(result).toEqual(session);
      expect(localStorage.getItem).toHaveBeenCalledWith('n9n_auth_session');
    });

    test('should clear session from both Chrome storage and localStorage', async () => {
      await authManager.clearSession();

      expect(chrome.storage.local.remove).toHaveBeenCalledWith(['n9n_auth_session']);
      expect(localStorage.removeItem).toHaveBeenCalledWith('n9n_auth_session');
    });
  });

  describe('Session Validation', () => {
    test('should validate session with valid expiration', () => {
      const validSession = {
        access_token: 'token-123',
        expires_at: (Date.now() / 1000) + 3600 // 1 hour from now
      };

      const result = authManager.isSessionValid(validSession);

      expect(result).toBe(true);
    });

    test('should invalidate expired session', () => {
      const expiredSession = {
        access_token: 'token-123',
        expires_at: (Date.now() / 1000) - 3600 // 1 hour ago
      };

      const result = authManager.isSessionValid(expiredSession);

      expect(result).toBe(false);
    });

    test('should invalidate session missing required fields', () => {
      const invalidSession = {
        access_token: 'token-123'
        // missing expires_at
      };

      const result = authManager.isSessionValid(invalidSession);

      expect(result).toBe(false);
    });

    test('should account for buffer time in validation', () => {
      // Session expires in 4 minutes (less than 5 minute buffer)
      const soonToExpireSession = {
        access_token: 'token-123',
        expires_at: (Date.now() / 1000) + 240 // 4 minutes from now
      };

      const result = authManager.isSessionValid(soonToExpireSession);

      expect(result).toBe(false);
    });
  });

  describe('Authentication State', () => {
    test('should return true for authenticated user with valid session', () => {
      authManager.currentUser = { id: 'user-123' };
      authManager.currentSession = {
        access_token: 'token-123',
        expires_at: (Date.now() / 1000) + 3600
      };
      authManager.isSessionValid = jest.fn().mockReturnValue(true);

      const result = authManager.isAuthenticated();

      expect(result).toBe(true);
    });

    test('should return false for unauthenticated user', () => {
      authManager.currentUser = null;
      authManager.currentSession = null;

      const result = authManager.isAuthenticated();

      expect(result).toBe(false);
    });

    test('should return current user', () => {
      const testEmail = generateTestEmail();
      const user = { id: 'user-123', email: testEmail };
      authManager.currentUser = user;

      const result = authManager.getCurrentUser();

      expect(result).toEqual(user);
    });
  });

  describe('Auth State Change Callbacks', () => {
    test('should register auth state change callback', () => {
      const callback = jest.fn();

      authManager.onAuthStateChange(callback);

      expect(authManager.authStateChangeCallbacks).toContain(callback);
    });

    test('should remove auth state change callback', () => {
      const callback = jest.fn();
      authManager.onAuthStateChange(callback);

      authManager.offAuthStateChange(callback);

      expect(authManager.authStateChangeCallbacks).not.toContain(callback);
    });

    test('should notify all callbacks on auth state change', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      authManager.onAuthStateChange(callback1);
      authManager.onAuthStateChange(callback2);
      
      authManager.currentUser = { id: 'user-123' };
      authManager.currentSession = { access_token: 'token-123' };
      authManager.isSessionValid = jest.fn().mockReturnValue(true);

      authManager.notifyAuthStateChange();

      expect(callback1).toHaveBeenCalledWith({
        isAuthenticated: true,
        user: { id: 'user-123' },
        session: { access_token: 'token-123' }
      });
      expect(callback2).toHaveBeenCalledWith({
        isAuthenticated: true,
        user: { id: 'user-123' },
        session: { access_token: 'token-123' }
      });
    });

    test('should handle callback errors gracefully', () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });
      const goodCallback = jest.fn();
      
      authManager.onAuthStateChange(errorCallback);
      authManager.onAuthStateChange(goodCallback);

      // Should not throw
      expect(() => authManager.notifyAuthStateChange()).not.toThrow();
      expect(goodCallback).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid login credentials error', () => {
      const error = new Error('Invalid login credentials');
      
      const result = authManager.handleAuthError(error, 'signin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
      expect(result.operation).toBe('signin');
    });

    test('should handle user already registered error', () => {
      const error = new Error('User already registered');
      
      const result = authManager.handleAuthError(error, 'signup');

      expect(result.success).toBe(false);
      expect(result.error).toBe('An account with this email already exists');
    });

    test('should handle email not confirmed error', () => {
      const error = new Error('Email not confirmed');
      
      const result = authManager.handleAuthError(error, 'signin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please check your email and confirm your account');
    });

    test('should handle password length error', () => {
      const error = new Error('Password should be at least 6 characters');
      
      const result = authManager.handleAuthError(error, 'signup');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters long');
    });

    test('should handle invalid email error', () => {
      const error = new Error('Invalid email format');
      
      const result = authManager.handleAuthError(error, 'signup');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });

    test('should handle network errors', () => {
      const error = new Error('fetch failed');
      
      const result = authManager.handleAuthError(error, 'signin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error. Please check your connection and try again');
    });

    test('should handle generic errors', () => {
      const error = new Error('Some unexpected error');
      
      const result = authManager.handleAuthError(error, 'signin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Some unexpected error');
    });

    test('should handle errors without message', () => {
      const error = new Error();
      
      const result = authManager.handleAuthError(error, 'signin');

      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred');
    });
  });

  describe('API Request Handling', () => {
    test('should make successful auth request', async () => {
      const mockResponse = { success: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authManager.makeAuthRequest('POST', 'test', { data: 'test' });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'https://pvxfiwdtbukopfjrutzq.supabase.co/auth/v1/test',
        {
          method: 'POST',
          headers: {
            'apikey': authManager.supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: 'test' })
        }
      );
    });

    test('should handle auth request with additional headers', async () => {
      const mockResponse = { success: true };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      await authManager.makeAuthRequest('POST', 'test', {}, {
        'Authorization': 'Bearer token-123'
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token-123'
          })
        })
      );
    });

    test('should handle auth request errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          error_description: 'Invalid request'
        })
      });

      await expect(authManager.makeAuthRequest('POST', 'test')).rejects.toThrow('Invalid request');
    });
  });

  describe('Password Reset', () => {
    test('should successfully send password reset email', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      const testEmail = generateTestEmail();
      const result = await authManager.resetPassword(testEmail);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent. Please check your inbox.');
    });

    test('should handle password reset errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          error_description: 'Invalid email'
        })
      });

      const result = await authManager.resetPassword('invalid-email');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
    });
  });
});