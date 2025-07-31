// WorkflowManager.js - Handles workflow injection and canvas operations
// Depends on: Utils

class WorkflowManager {
  constructor() {
    this.canvas = null;
  }

  async injectWorkflowFromMessage(messageId) {
    try {
      const message = this.findMessageById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const workflow = this.extractWorkflowFromMessage(message.content);
      if (!workflow) {
        throw new Error('No workflow found in message');
      }

      await this.injectIntoN8nCanvas(workflow, message.content);
      this.showNotification('Workflow injected successfully!', 'success');
    } catch (error) {
      console.error('Error injecting workflow:', error);
      this.showNotification('Failed to inject workflow', 'error');
    }
  }

  findMessageById(messageId) {
    // This would need to be implemented based on how messages are stored
    // For now, we'll assume it's available in the current context
    return window.chatManager?.messages?.find(m => m.id === messageId);
  }

  extractWorkflowFromMessage(content) {
    // Look for JSON code blocks that contain workflow data
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const workflow = JSON.parse(jsonMatch[1]);
        if (workflow.nodes && Array.isArray(workflow.nodes)) {
          return workflow;
        }
      } catch (error) {
        console.error('Error parsing workflow JSON:', error);
      }
    }

    // Look for workflow object in the content
    const workflowMatch = content.match(/workflow:\s*({[\s\S]*?})/i);
    if (workflowMatch) {
      try {
        const workflow = JSON.parse(workflowMatch[1]);
        if (workflow.nodes && Array.isArray(workflow.nodes)) {
          return workflow;
        }
      } catch (error) {
        console.error('Error parsing workflow object:', error);
      }
    }

    return null;
  }

  async injectIntoN8nCanvas(workflow, rawJson) {
    try {
      // Find the n8n canvas
      this.canvas = this.findN8nCanvas();
      if (!this.canvas) {
        throw new Error('n8n canvas not found');
      }

      // Clear existing workflow
      await this.clearCanvas();

      // Inject the new workflow
      await this.injectWorkflow(workflow);

      // Show success message
      this.showNotification('Workflow loaded successfully!', 'success');
    } catch (error) {
      console.error('Error injecting into canvas:', error);
      throw error;
    }
  }

  findN8nCanvas() {
    // Look for the main n8n canvas element
    const selectors = [
      '[data-test-id="canvas"]',
      '.canvas',
      '#canvas',
      '[class*="canvas"]',
      '[class*="Canvas"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }

    // If no specific canvas found, look for the main content area
    return document.querySelector('main') || document.querySelector('[role="main"]');
  }

  async clearCanvas() {
    if (!this.canvas) return;

    // Try to find and click the "New Workflow" button
    const newWorkflowBtn = document.querySelector('[data-test-id="new-workflow-button"]') ||
                          document.querySelector('button[title*="New"]') ||
                          document.querySelector('button[title*="new"]');

    if (newWorkflowBtn) {
      newWorkflowBtn.click();
      // Wait a bit for the canvas to clear
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async injectWorkflow(workflow) {
    if (!this.canvas) return;

    // This is a simplified implementation
    // In a real scenario, you'd need to interact with n8n's internal API
    // or trigger the appropriate events to load the workflow

    // For now, we'll try to trigger a custom event that n8n might listen to
    const event = new CustomEvent('n9n-workflow-load', {
      detail: { workflow }
    });
    document.dispatchEvent(event);

    // Alternative: try to find and use n8n's internal workflow loading mechanism
    if (window.n8n && window.n8n.workflow) {
      try {
        await window.n8n.workflow.load(workflow);
      } catch (error) {
        console.error('Error loading workflow via n8n API:', error);
      }
    }

    // If n8n has a global workflow manager
    if (window.workflowManager) {
      try {
        await window.workflowManager.loadWorkflow(workflow);
      } catch (error) {
        console.error('Error loading workflow via workflow manager:', error);
      }
    }
  }

  showTextCopyModal(text) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 24px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      color: #fafafa;
    `;

    modalContent.innerHTML = `
      <div style="text-align: center;">
        <h3 style="margin: 0 0 16px; color: #fafafa;">Workflow JSON</h3>
        <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 14px;">
          Copy this JSON and paste it into your n8n workflow editor
        </p>
        
        <div style="
          background: #27272a;
          border: 1px solid #3f3f46;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          position: relative;
        ">
          <pre style="
            margin: 0;
            color: #fafafa;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.4;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 300px;
            overflow-y: auto;
          ">${this.escapeHtml(text)}</pre>
          
          <button id="copy-json-btn" style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: #3b82f6;
            border: 1px solid #60a5fa;
            border-radius: 4px;
            color: white;
            font-size: 12px;
            padding: 4px 8px;
            cursor: pointer;
            transition: all 0.2s;
          ">Copy</button>
        </div>
        
        <div style="display: flex; gap: 12px;">
          <button id="inject-workflow-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: #3b82f6;
            border: 1px solid #60a5fa;
            border-radius: 6px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Inject into Canvas</button>
          <button id="close-modal-btn" style="
            flex: 1;
            padding: 10px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 6px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Close</button>
        </div>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Setup event listeners
    const copyBtn = modal.querySelector('#copy-json-btn');
    const injectBtn = modal.querySelector('#inject-workflow-btn');
    const closeBtn = modal.querySelector('#close-modal-btn');

    copyBtn?.addEventListener('click', async () => {
      try {
        await this.copyToClipboard(text);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 2000);
        this.showNotification('JSON copied to clipboard!', 'success');
      } catch (error) {
        this.showNotification('Failed to copy JSON', 'error');
      }
    });

    injectBtn?.addEventListener('click', async () => {
      try {
        const workflow = JSON.parse(text);
        await this.injectIntoN8nCanvas(workflow, text);
        modal.remove();
      } catch (error) {
        this.showNotification('Failed to inject workflow', 'error');
      }
    });

    closeBtn?.addEventListener('click', () => {
      modal.remove();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
  }

  showNotification(message, type = 'info') {
    if (window.modalManager) {
      window.modalManager.showNotification(message, type);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkflowManager;
}

// Expose globally for browser extension
window.WorkflowManager = WorkflowManager;