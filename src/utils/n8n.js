// n8n Utilities - Non-module version
// Handles n8n workflow interactions and storage

(function() {
  'use strict';
  
  // Simple storage manager for browser extension
  window.StorageManager = {
    async get(key) {
      try {
        const result = await chrome.storage.local.get([key]);
        return result[key];
      } catch (error) {
        console.error('Failed to get from storage:', error);
        return null;
      }
    },
    
    async set(key, value) {
      try {
        await chrome.storage.local.set({ [key]: value });
        return true;
      } catch (error) {
        console.error('Failed to set in storage:', error);
        return false;
      }
    },
    
    async remove(key) {
      try {
        await chrome.storage.local.remove([key]);
        return true;
      } catch (error) {
        console.error('Failed to remove from storage:', error);
        return false;
      }
    }
  };

  // Workflow injector for n8n pages
  window.WorkflowInjector = {
    async injectWorkflow(workflowData) {
      if (!workflowData) return false;
      
      try {
        // Try to find n8n canvas elements
        const canvasSelectors = [
          '[data-test-id="workflow-canvas"]',
          '.workflow-canvas',
          '.node-editor',
          '#n8n-workflow-editor',
          '.canvas-container'
        ];

        let canvas = null;
        for (const selector of canvasSelectors) {
          canvas = document.querySelector(selector);
          if (canvas) break;
        }

        if (canvas) {
          // Dispatch custom event for n8n to handle
          const event = new CustomEvent('n9n-inject-workflow', {
            detail: { workflow: workflowData }
          });
          
          canvas.dispatchEvent(event);
          console.log('Workflow injection event dispatched');
          return true;
        } else {
          console.warn('No n8n canvas found for workflow injection');
          return false;
        }
      } catch (error) {
        console.error('Failed to inject workflow:', error);
        return false;
      }
    }
  };

})();