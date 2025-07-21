// ============================================================================
// ChatService - Handles chat functionality
// ============================================================================


export class ChatService {
    private messages: any[] = [];
    private currentConversationId: string | null = null;

    constructor() {
      // Load messages from localStorage if available
      const savedMessages   = localStorage.getItem('n9n_chat_messages');
      this.messages = savedMessages ? JSON.parse(savedMessages) : [];
      this.currentConversationId = null;
    }
  
    async initializeChat() {
      // Mock initialization
      return {
        email: 'demo@example.com',
        user_metadata: {
          full_name: 'Demo User',
          avatar_url: null
        }
      };
    }
  
    getMessages() {
      return this.messages;
    }
  
    async sendMessage(content) {
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: content,
        timestamp: new Date().toISOString()
      };
  
      this.messages.push(userMessage);
      
      // Save messages to localStorage after user message
      localStorage.setItem('n9n_chat_messages', JSON.stringify(this.messages));
  
      // Generate AI response with actual workflow JSON
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate workflow based on user request
      const workflow = this.generateWorkflow(content);
      const currentWorkflow = this.getCurrentWorkflowContext();
      
      // Create context-aware response
      let contextText = '';
      if (currentWorkflow && currentWorkflow.hasNodes) {
        contextText = `I can see you're working on "${currentWorkflow.name}" which has ${currentWorkflow.nodeCount} nodes. `;
      } else if (currentWorkflow && currentWorkflow.isEmptyWorkflow) {
        contextText = `I can see you have an empty workflow ready. `;
      }
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: `${contextText}Here's your custom n8n workflow:
  
  \`\`\`json
  ${JSON.stringify(workflow, null, 2)}
  \`\`\`
  
  **${workflow.name}** is ready to use! Click **⚡ Inject** to add this workflow to your n8n instance.`,
        timestamp: new Date().toISOString()
      };
  
      this.messages.push(aiResponse);
      
      // Save messages to localStorage after each AI response
      localStorage.setItem('n9n_chat_messages', JSON.stringify(this.messages));
    }
  
    async startNewConversation() {
      this.messages = [];
      this.currentConversationId = Date.now().toString();
      localStorage.removeItem('n9n_chat_messages');
    }
  
    async clearHistory() {
      this.messages = [];
      localStorage.removeItem('n9n_chat_messages');
    }
  
  
  
    generateWorkflow(userMessage) {
      const message = userMessage.toLowerCase();
      
      // Get current workflow context
      const currentWorkflow = this.getCurrentWorkflowContext();
      
      // Extract workflow name if specified
      let workflowName = 'AI Generated Workflow';
      if (message.includes('name it')) {
        const nameMatch = message.match(/name it (.+?)(?:\.|$)/i);
        if (nameMatch) {
          workflowName = nameMatch[1].trim();
        }
      }
      
      // If user is asking to modify/extend existing workflow
      if (currentWorkflow && (message.includes('add') || message.includes('modify') || message.includes('extend') || message.includes('update'))) {
        return this.modifyExistingWorkflow(currentWorkflow, userMessage, workflowName);
      }
      
      // Generate new workflow based on request
      if (message.includes('simple') || message.includes('basic')) {
        return this.createSimpleWorkflow(workflowName);
      } else if (message.includes('email')) {
        return this.createEmailWorkflow(workflowName);
      } else if (message.includes('webhook')) {
        return this.createWebhookWorkflow(workflowName);
      } else if (message.includes('schedule') || message.includes('cron')) {
        return this.createScheduledWorkflow(workflowName);
      } else {
        return this.createSimpleWorkflow(workflowName);
      }
    }
    
    getCurrentWorkflowContext() {
      try {
        // Try to detect current workflow from n8n interface
        const workflowCanvas = document.querySelector('[data-test-id="workflow-canvas"]') || 
                             document.querySelector('.workflow-canvas') ||
                             document.querySelector('#workflow-canvas');
        
        if (workflowCanvas) {
          // Try to get workflow name from title or heading
          const titleElement = document.querySelector('h1') || 
                              document.querySelector('[data-test-id="workflow-name"]') ||
                              document.querySelector('.workflow-title');
          
          const workflowName = titleElement ? titleElement.textContent?.trim() : 'Current Workflow';
          
          // Try to detect existing nodes (very basic detection)
          const nodeElements = document.querySelectorAll('[data-test-id*="node"]') || [];
          
          return {
            name: workflowName,
            hasNodes: nodeElements.length > 0,
            nodeCount: nodeElements.length,
            isEmptyWorkflow: nodeElements.length === 0,
            url: window.location.href
          };
        }
        
        return null;
      } catch (error) {
        console.log('Failed to get workflow context:', error);
        return null;
      }
    }
    
    modifyExistingWorkflow(currentWorkflow, userMessage, workflowName) {
      const message = userMessage.toLowerCase();
      const baseName = workflowName || currentWorkflow.name || 'Modified Workflow';
      
      if (message.includes('email')) {
        return this.createEmailWorkflow(`${baseName} - Email Added`);
      } else if (message.includes('webhook')) {
        return this.createWebhookWorkflow(`${baseName} - Webhook Added`);
      } else if (message.includes('schedule')) {
        return this.createScheduledWorkflow(`${baseName} - Scheduled`);
      } else {
        // Add a generic processing node
        return this.createSimpleWorkflow(`${baseName} - Extended`);
      }
    }
  
    createSimpleWorkflow(name) {
      return {
        name: name,
        nodes: [
          {
            parameters: {},
            id: "manual-trigger-1",
            name: "Manual Trigger",
            type: "n8n-nodes-base.manualTrigger",
            typeVersion: 1,
            position: [250, 300]
          },
          {
            parameters: {
              functionCode: "// Process your data here\nconst result = {\n  timestamp: new Date().toISOString(),\n  message: 'Workflow executed successfully!',\n  data: $input.all()\n};\n\nreturn [{ json: result }];"
            },
            id: "function-1",
            name: "Process Data",
            type: "n8n-nodes-base.function",
            typeVersion: 1,
            position: [450, 300]
          }
        ],
        connections: {
          "Manual Trigger": {
            main: [
              [
                {
                  node: "Process Data",
                  type: "main",
                  index: 0
                }
              ]
            ]
          }
        },
        active: false,
        settings: {
          executionOrder: "v1"
        }
      };
    }
  
    createEmailWorkflow(name) {
      return {
        name: name,
        nodes: [
          {
            parameters: {},
            id: "manual-trigger-1",
            name: "Manual Trigger",
            type: "n8n-nodes-base.manualTrigger",
            typeVersion: 1,
            position: [250, 300]
          },
          {
            parameters: {
              toEmail: "recipient@example.com",
              subject: "Test Email from n8n",
              text: "This is a test email sent from your n8n workflow!"
            },
            id: "email-send-1",
            name: "Send Email",
            type: "n8n-nodes-base.emailSend",
            typeVersion: 2,
            position: [450, 300]
          }
        ],
        connections: {
          "Manual Trigger": {
            main: [[{ node: "Send Email", type: "main", index: 0 }]]
          }
        },
        active: false,
        settings: { executionOrder: "v1" }
      };
    }
  
    createWebhookWorkflow(name) {
      return {
        name: name,
        nodes: [
          {
            parameters: {
              httpMethod: "POST",
              path: "webhook-endpoint"
            },
            id: "webhook-1",
            name: "Webhook",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [250, 300]
          },
          {
            parameters: {
              values: {
                string: [
                  {
                    name: "response",
                    value: "Webhook received successfully!"
                  }
                ]
              }
            },
            id: "set-1",
            name: "Set Response",
            type: "n8n-nodes-base.set",
            typeVersion: 1,
            position: [450, 300]
          }
        ],
        connections: {
          "Webhook": {
            main: [[{ node: "Set Response", type: "main", index: 0 }]]
          }
        },
        active: false,
        settings: { executionOrder: "v1" }
      };
    }
  
    createScheduledWorkflow(name) {
      return {
        name: name,
        nodes: [
          {
            parameters: {
              triggerTimes: {
                item: [{ hour: 9, minute: 0 }]
              }
            },
            id: "cron-1",
            name: "Cron",
            type: "n8n-nodes-base.cron",
            typeVersion: 1,
            position: [250, 300]
          },
          {
            parameters: {
              functionCode: "// Scheduled task\nconst now = new Date();\nreturn [{\n  json: {\n    executedAt: now.toISOString(),\n    message: 'Scheduled task executed'\n  }\n}];"
            },
            id: "function-1",
            name: "Scheduled Task",
            type: "n8n-nodes-base.function",
            typeVersion: 1,
            position: [450, 300]
          }
        ],
        connections: {
          "Cron": {
            main: [[{ node: "Scheduled Task", type: "main", index: 0 }]]
          }
        },
        active: false,
        settings: { executionOrder: "v1" }
      };
    }
  
    async loadConversation(conversationId) {
      // Mock conversation loading
      this.currentConversationId = conversationId;
      return true;
    }
  };    