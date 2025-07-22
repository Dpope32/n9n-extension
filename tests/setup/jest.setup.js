/**
 * Jest Setup File
 * 
 * This file runs after the test framework is set up but before each test file.
 * It configures global test utilities, polyfills, and common test setup.
 */

const { TEST_CONFIG, validateConfig } = require('./test-config');

// Validate test configuration
validateConfig();

// Global test timeout
jest.setTimeout(TEST_CONFIG.supabase.timeout * 2);

// Global test utilities
global.TEST_CONFIG = TEST_CONFIG;

// Console logging control
if (TEST_CONFIG.logging.level === 'error') {
  // Suppress console.log and console.warn in tests
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };
}

// Global test helpers
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

global.generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for tests
global.handleTestError = (error, context = '') => {
  console.error(`Test Error ${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  throw error;
};

console.log('🧪 Jest setup complete - Test environment ready');