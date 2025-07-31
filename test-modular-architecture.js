// Test script for the new modular architecture
// Run this in the browser console to verify everything is working

console.log('🧪 Testing new modular architecture...');

// Test 1: Check if all modules are loaded
const moduleTests = {
  'SidebarManager': typeof SidebarManager !== 'undefined',
  'ModalManager': typeof ModalManager !== 'undefined', 
  'ChatManager': typeof ChatManager !== 'undefined',
  'WorkflowManager': typeof WorkflowManager !== 'undefined',
  'UIManager': typeof UIManager !== 'undefined',
  'Main': typeof Main !== 'undefined'
};

console.log('📦 Module availability:', moduleTests);

// Test 2: Check if Main can be instantiated
try {
  if (typeof Main !== 'undefined') {
    const main = new Main();
    console.log('✅ Main instantiation successful');
    console.log('Main instance:', main);
  } else {
    console.error('❌ Main not available');
  }
} catch (error) {
  console.error('❌ Main instantiation failed:', error);
}

// Test 3: Check if n9nCopilot is available
if (window.n9nCopilot) {
  console.log('✅ n9nCopilot available:', window.n9nCopilot);
  console.log('n9nCopilot.uiManager:', window.n9nCopilot.uiManager);
} else {
  console.warn('⚠️ n9nCopilot not available yet');
}

// Test 4: Check if individual managers are available
if (window.sidebarManager) {
  console.log('✅ SidebarManager available');
} else {
  console.warn('⚠️ SidebarManager not available');
}

if (window.modalManager) {
  console.log('✅ ModalManager available');
} else {
  console.warn('⚠️ ModalManager not available');
}

if (window.chatManager) {
  console.log('✅ ChatManager available');
} else {
  console.warn('⚠️ ChatManager not available');
}

if (window.workflowManager) {
  console.log('✅ WorkflowManager available');
} else {
  console.warn('⚠️ WorkflowManager not available');
}

// Test 5: Check if old UIManager methods are still accessible
if (window.uiManager) {
  console.log('✅ uiManager available');
  console.log('uiManager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.uiManager)));
} else {
  console.warn('⚠️ uiManager not available');
}

console.log('🎉 Modular architecture test complete!'); 