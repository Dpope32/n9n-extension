/**
 * Global Jest Setup
 * 
 * Runs once before all tests. Used for global test environment setup,
 * test database initialization, and other one-time setup tasks.
 */

const { TEST_CONFIG } = require('./test-config');

module.exports = async () => {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.SUPABASE_URL = TEST_CONFIG.supabase.url;
    process.env.SUPABASE_ANON_KEY = TEST_CONFIG.supabase.key;
    
    // Log test configuration (without sensitive data)
    console.log('📋 Test Configuration:');
    console.log(`   - Environment: ${process.env.NODE_ENV}`);
    console.log(`   - Supabase URL: ${TEST_CONFIG.supabase.url.replace(/\/\/.*@/, '//***@')}`);
    console.log(`   - Test Schema: ${TEST_CONFIG.supabase.testSchema}`);
    console.log(`   - Cleanup Mode: ${TEST_CONFIG.testData.cleanupAfterEach ? 'Enabled' : 'Disabled'}`);
    
    // Validate required environment variables
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.warn('⚠️  Missing environment variables:', missing.join(', '));
      console.warn('   Tests may fail without proper Supabase configuration');
    }
    
    console.log('✅ Global test setup complete');
    
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
};