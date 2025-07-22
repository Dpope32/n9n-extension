/**
 * Global Jest Teardown
 * 
 * Runs once after all tests complete. Used for global cleanup,
 * test database cleanup, and final test environment teardown.
 */

const { TEST_CONFIG } = require('./test-config');

module.exports = async () => {
  console.log('🧹 Starting global test teardown...');
  
  try {
    // Log test completion
    console.log('📊 Test execution summary:');
    console.log(`   - Environment: ${process.env.NODE_ENV}`);
    console.log(`   - Timestamp: ${new Date().toISOString()}`);
    
    // Cleanup environment variables
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    
    console.log('✅ Global test teardown complete');
    
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
};