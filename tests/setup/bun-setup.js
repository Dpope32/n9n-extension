/**
 * Bun Test Setup File
 * 
 * This file sets up the global test environment for Bun test runner.
 * It initializes global utilities, test configuration, and environment variables.
 */

const { TEST_CONFIG, validateConfig } = require('./test-config');

// Validate test configuration
validateConfig();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = TEST_CONFIG.supabase.url;
process.env.SUPABASE_ANON_KEY = TEST_CONFIG.supabase.key;

// Global test utilities
global.TEST_CONFIG = TEST_CONFIG;

// Global test helpers
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

global.generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Global error handler for tests
global.handleTestError = (error, context = '') => {
  console.error(`Test Error ${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  throw error;
};

// Console logging control
if (TEST_CONFIG.logging.level === 'error') {
  // Suppress console.log and console.warn in tests for Bun
  const originalConsole = global.console;
  global.console = {
    ...originalConsole,
    log: () => {},
    warn: () => {},
    info: () => {},
    debug: () => {}
  };
}

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('🧪 Bun test setup complete - Test environment ready');