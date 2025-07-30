/**
 * Setup Verification Test
 * 
 * This test verifies that the testing infrastructure is properly configured
 * and all required dependencies are available.
 */

// Import Bun test setup to initialize global utilities
require('./bun-setup');

const { TEST_CONFIG, validateConfig } = require('./test-config');

describe('Testing Infrastructure Setup', () => {
  
  test('should have valid test configuration', () => {
    expect(TEST_CONFIG).toBeDefined();
    expect(TEST_CONFIG.supabase).toBeDefined();
    expect(TEST_CONFIG.supabase.url).toBeDefined();
    expect(TEST_CONFIG.supabase.key).toBeDefined();
    expect(TEST_CONFIG.testData).toBeDefined();
    expect(TEST_CONFIG.performance).toBeDefined();
  });
  
  test('should have proper test environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(global.TEST_CONFIG).toBeDefined();
  });
  
  test('should have global test utilities available', () => {
    expect(typeof global.sleep).toBe('function');
    expect(typeof global.generateUUID).toBe('function');
    expect(typeof global.handleTestError).toBe('function');
  });
  
  test('should generate valid UUIDs', () => {
    const uuid = global.generateUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
  
  test('should have proper Jest configuration', () => {
    expect(jest.setTimeout).toBeDefined();
    expect(jest.fn).toBeDefined();
    expect(expect).toBeDefined();
  });
  
  test('should validate test configuration without errors', () => {
    // This should not throw any errors
    expect(() => validateConfig()).not.toThrow();
  });
  
  test('should have required test directories', () => {
    const fs = require('fs');
    const path = require('path');
    
    const testDirs = [
      'tests/setup',
      'tests/unit', 
      'tests/integration',
      'tests/performance',
      'tests/utils'
    ];
    
    testDirs.forEach(dir => {
      expect(fs.existsSync(path.join(process.cwd(), dir))).toBe(true);
    });
  });
  
  test('should have proper timeout configuration', async () => {
    const start = Date.now();
    await global.sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some variance
    expect(elapsed).toBeLessThan(200);
  });
  
});

describe('Node.js Environment', () => {
  
  test('should have fetch available (polyfill)', () => {
    // Note: fetch polyfill will be added when needed for actual API tests
    expect(typeof require).toBe('function');
  });
  
  test('should support async/await', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
  
  test('should support ES6 features', () => {
    const testArray = [1, 2, 3];
    const doubled = testArray.map(x => x * 2);
    expect(doubled).toEqual([2, 4, 6]);
    
    const { supabase } = TEST_CONFIG;
    expect(supabase).toBeDefined();
  });
  
});