// Test script for remote agents implementation
// Just copy and paste this entire script into browser console on an n8n page

console.log('🧪 Starting remote agents test suite...');

// Simple test runner - no classes needed!
let testCount = 0;
let passCount = 0;
const results = [];

function test(name, testFn) {
  testCount++;
  console.log(`\n🔍 Test ${testCount}: ${name}`);
  
  try {
    const result = testFn();
    if (result === true || (typeof result === 'object' && result.success)) {
      passCount++;
      console.log(`✅ PASS: ${name}`);
      results.push({ name, status: 'PASS', details: result.details || 'Test passed' });
    } else {
      console.log(`❌ FAIL: ${name} - ${result.error || 'Test failed'}`);
      results.push({ name, status: 'FAIL', details: result.error || 'Test failed' });
    }
  } catch (error) {
    console.log(`💥 ERROR: ${name} - ${error.message}`);
    results.push({ name, status: 'ERROR', details: error.message });
  }
}

async function asyncTest(name, testFn) {
  testCount++;
  console.log(`\n🔍 Test ${testCount}: ${name}`);
  
  try {
    const result = await testFn();
    if (result === true || (typeof result === 'object' && result.success)) {
      passCount++;
      console.log(`✅ PASS: ${name}`);
      results.push({ name, status: 'PASS', details: result.details || 'Test passed' });
    } else {
      console.log(`❌ FAIL: ${name} - ${result.error || 'Test failed'}`);
      results.push({ name, status: 'FAIL', details: result.error || 'Test failed' });
    }
  } catch (error) {
    console.log(`💥 ERROR: ${name} - ${error.message}`);
    results.push({ name, status: 'ERROR', details: error.message });
  }
}

function printResults() {
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${testCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${testCount - passCount}`);
  console.log(`Success Rate: ${Math.round((passCount / testCount) * 100)}%`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '💥';
    console.log(`${icon} ${index + 1}. ${result.name}: ${result.details}`);
  });
}

// Test 1: Check if copilot is loaded
test('Copilot Initialization', () => {
  if (typeof N9NCopilot !== 'undefined' && window.copilot) {
    return { success: true, details: 'N9NCopilot class and instance found' };
  }
  return { success: false, error: 'N9NCopilot not found or not initialized' };
});

// Test 2: Check if WorkflowDetector is loaded
test('WorkflowDetector Module', () => {
  if (typeof WorkflowDetector !== 'undefined' && window.WorkflowDetector) {
    return { success: true, details: 'WorkflowDetector class available' };
  }
  return { success: false, error: 'WorkflowDetector not loaded' };
});

// Test 3: Check if WorkflowDetector instance is created
test('WorkflowDetector Instance', () => {
  if (window.workflowDetector && window.workflowDetector instanceof WorkflowDetector) {
    return { success: true, details: 'WorkflowDetector instance found' };
  }
  return { success: false, error: 'WorkflowDetector instance not created' };
});

// Test 4: Check if UIManager is loaded
test('UIManager Module', () => {
  if (typeof UIManager !== 'undefined' && window.UIManager) {
    return { success: true, details: 'UIManager class available' };
  }
  return { success: false, error: 'UIManager not loaded' };
});

// Test 5: Check if ChatManager is loaded
test('ChatManager Module', () => {
  if (typeof ChatManager !== 'undefined' && window.ChatManager) {
    return { success: true, details: 'ChatManager class available' };
  }
  return { success: false, error: 'ChatManager not loaded' };
});

// Test 6: Check if AuthManager is loaded
test('AuthManager Module', () => {
  if (typeof AuthManager !== 'undefined' && window.AuthManager) {
    return { success: true, details: 'AuthManager class available' };
  }
  return { success: false, error: 'AuthManager not loaded' };
});

// Test 7: Check page detection
test('Page Detection', () => {
  if (window.workflowDetector && window.workflowDetector.currentPage) {
    const pageType = window.workflowDetector.currentPage;
    return { success: true, details: `Detected page type: ${pageType}` };
  }
  return { success: false, error: 'Page detection not working' };
});

// Test 8: Check if sidebar elements exist
test('Sidebar Elements', () => {
  const toggleButton = document.getElementById('n9n-toggle-button');
  const overlay = document.getElementById('n9n-drawer-overlay');
  
  if (toggleButton && overlay) {
    return { success: true, details: 'Toggle button and overlay found' };
  }
  return { success: false, error: 'Sidebar elements missing' };
});

// Test 9: Test markdown formatting
test('Markdown Formatting', () => {
  if (window.uiManager && typeof window.uiManager.formatMessageContent === 'function') {
    const testMarkdown = '**Bold text** and *italic text* and `code` and 1. numbered list';
    const formatted = window.uiManager.formatMessageContent(testMarkdown);
    
    if (formatted.includes('<strong') && formatted.includes('<em') && formatted.includes('<code')) {
      return { success: true, details: 'Markdown formatting working' };
    }
    return { success: false, error: 'Markdown not properly formatted' };
  }
  return { success: false, error: 'UIManager formatMessageContent not available' };
});

// Test 10: Test authentication status
test('Authentication Status', () => {
  if (window.chatManager && typeof window.chatManager.isAuthenticated === 'function') {
    const isAuth = window.chatManager.isAuthenticated();
    return { success: true, details: `Authentication status: ${isAuth ? 'Authenticated' : 'Not authenticated'}` };
  }
  return { success: false, error: 'ChatManager authentication check not available' };
});

// Test 11: Test keyboard shortcuts
test('Keyboard Shortcuts', () => {
  const hasShortcuts = window.copilot && typeof window.copilot.setupKeyboardShortcuts === 'function';
  if (hasShortcuts) {
    return { success: true, details: 'Keyboard shortcuts setup method available' };
  }
  return { success: false, error: 'Keyboard shortcuts not set up' };
});

// Test 12: Test message listener
test('Message Listener', () => {
  const hasListener = window.copilot && typeof window.copilot.setupMessageListener === 'function';
  if (hasListener) {
    return { success: true, details: 'Message listener setup method available' };
  }
  return { success: false, error: 'Message listener not set up' };
});

// Test 13: Test workflow injection capability
test('Workflow Injection', () => {
  const hasInjection = window.copilot && typeof window.copilot.injectWorkflow === 'function';
  if (hasInjection) {
    return { success: true, details: 'Workflow injection method available' };
  }
  return { success: false, error: 'Workflow injection not available' };
});

// Run async tests
setTimeout(async () => {
  console.log('\n🔄 Running async tests...');
  
  // Test 14: Test workflow scanning
  await asyncTest('Workflow Scanning', async () => {
    if (window.workflowDetector) {
      try {
        await window.workflowDetector.scanForWorkflows();
        const workflows = window.workflowDetector.getWorkflows();
        return { success: true, details: `Found ${workflows.length} workflows` };
      } catch (error) {
        return { success: false, error: `Scanning failed: ${error.message}` };
      }
    }
    return { success: false, error: 'WorkflowDetector not available' };
  });

  // Test 15: Test workflow context generation
  await asyncTest('Workflow Context Generation', async () => {
    if (window.uiManager && typeof window.uiManager.getWorkflowContext === 'function') {
      try {
        const context = await window.uiManager.getWorkflowContext();
        return { 
          success: true, 
          details: `Context generated: ${context.detected.length} detected, ${context.backend.length} backend workflows` 
        };
      } catch (error) {
        return { success: false, error: `Context generation failed: ${error.message}` };
      }
    }
    return { success: false, error: 'UIManager getWorkflowContext not available' };
  });

  // Print results
  printResults();
  
  // Additional debugging info
  console.log('\n🐛 Debug Information:');
  console.log('Current URL:', window.location.href);
  console.log('Document ready state:', document.readyState);
  console.log('Available global objects:', {
    copilot: !!window.copilot,
    workflowDetector: !!window.workflowDetector,
    uiManager: !!window.uiManager,
    chatManager: !!window.chatManager,
    authManager: !!window.authManager,
    N9NCopilot: typeof N9NCopilot !== 'undefined',
    WorkflowDetector: typeof WorkflowDetector !== 'undefined',
    UIManager: typeof UIManager !== 'undefined',
    ChatManager: typeof ChatManager !== 'undefined',
    AuthManager: typeof AuthManager !== 'undefined'
  });
  
  if (window.workflowDetector) {
    console.log('WorkflowDetector status:', {
      currentPage: window.workflowDetector.currentPage,
      isMonitoring: window.workflowDetector.isMonitoring,
      workflowCount: window.workflowDetector.workflows.length,
      lastScan: window.workflowDetector.lastScan
    });
  }
  
  console.log('\n✅ Remote agents test suite complete!');
}, 2000);