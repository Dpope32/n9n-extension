/**
 * Test Configuration for Supabase Backend Testing
 * 
 * This configuration provides test environment settings for the n9n AI Copilot
 * server-side testing suite. It includes Supabase test database configuration,
 * test data management settings, and performance testing parameters.
 */

// Test environment configuration
const TEST_CONFIG = {
  // Supabase test environment
  supabase: {
    // Use environment variables or fallback to test defaults
    url: process.env.SUPABASE_TEST_URL || 'https://your-test-project.supabase.co',
    key: process.env.SUPABASE_TEST_ANON_KEY || 'your-test-anon-key',
    
    // Test schema for data isolation
    testSchema: 'test_n9n',
    
    // API configuration
    apiVersion: 'v1',
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },
  
  // Test data management
  testData: {
    // Cleanup settings
    cleanupAfterEach: true,
    cleanupBeforeAll: true,
    cleanupAfterAll: true,
    
    // Data seeding
    seedData: false,
    maxTestRecords: 1000,
    
    // Test user configuration
    testUserId: '00000000-0000-0000-0000-000000000001',
    testUserEmail: 'test@n9n-copilot.test'
  },
  
  // Performance testing parameters
  performance: {
    // Load testing
    concurrentUsers: 10,
    messagesPerSecond: 50,
    conversationsPerUser: 5,
    testDuration: 30000, // 30 seconds
    
    // Response time thresholds (milliseconds)
    thresholds: {
      create: 1000,
      read: 500,
      update: 1000,
      delete: 500,
      bulk: 5000
    },
    
    // Stress testing
    maxConcurrentOperations: 100,
    rampUpTime: 5000, // 5 seconds
    sustainTime: 10000 // 10 seconds
  },
  
  // Test database tables
  tables: {
    conversations: 'ai_conversations',
    messages: 'ai_messages'
  },
  
  // Test data templates
  templates: {
    conversation: {
      title: 'Test Conversation',
      status: 'active',
      total_messages: 0,
      ai_credits_used: 0
    },
    
    message: {
      role: 'user',
      content: 'Test message content',
      metadata: {}
    }
  },
  
  // Error simulation settings
  errorSimulation: {
    networkFailureRate: 0.1, // 10% failure rate for network tests
    timeoutDuration: 5000, // 5 seconds
    retryScenarios: true
  },
  
  // Logging configuration
  logging: {
    level: process.env.TEST_LOG_LEVEL || 'info',
    enableConsole: true,
    enableFile: false,
    logFile: 'tests/logs/test.log'
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'ci') {
  // CI environment adjustments
  TEST_CONFIG.supabase.timeout = 15000;
  TEST_CONFIG.performance.testDuration = 10000;
  TEST_CONFIG.logging.level = 'error';
}

if (process.env.NODE_ENV === 'development') {
  // Development environment adjustments
  TEST_CONFIG.logging.level = 'debug';
  TEST_CONFIG.testData.cleanupAfterEach = false; // Keep data for debugging
}

// Validation function
function validateConfig() {
  const required = [
    'supabase.url',
    'supabase.key'
  ];
  
  for (const path of required) {
    const value = path.split('.').reduce((obj, key) => obj?.[key], TEST_CONFIG);
    if (!value || value.includes('your-test-')) {
      console.warn(`⚠️  Test configuration missing: ${path}`);
      console.warn('   Please set environment variables or update test-config.js');
    }
  }
}

// Export configuration
module.exports = {
  TEST_CONFIG,
  validateConfig
};