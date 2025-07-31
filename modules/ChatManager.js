// ChatManager.js - Handles chat operations, message rendering, and AI responses
// Depends on: Utils, ChatService

class ChatManager {
  constructor() {
    this.currentConversationId = null;
    this.messages = [];
    this.isTyping = false;
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (!input || !sendBtn) return;

    const message = input.value.trim();
    if (!message) return;

    // Disable input and button
    input.disabled = true;
    sendBtn.disabled = true;

    try {
      // Add user message to UI
      const userMessage = {
        id: Date.now().toString(),
        content: message,
        role: 'user',
        timestamp: new Date().toISOString()
      };

      this.messages.push(userMessage);
      this.renderMessage(userMessage);

      // Clear input
      input.value = '';
      input.style.height = 'auto';

      // Generate AI response
      await this.generateAIResponse(message);
    } catch (error) {
      console.error('Error sending message:', error);
      this.showNotification('Failed to send message', 'error');
    } finally {
      // Re-enable input and button
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  async generateAIResponse(userMessage) {
    try {
      this.addTypingIndicator();

      const response = await window.chatService?.sendMessage(userMessage, this.messages);
      
      if (response) {
        const aiMessage = {
          id: Date.now().toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date().toISOString()
        };

        this.messages.push(aiMessage);
        this.renderMessage(aiMessage);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      this.showNotification('Failed to generate response', 'error');
    } finally {
      this.removeTypingIndicator();
    }
  }

  isAskingAboutWorkflows(message) {
    const workflowKeywords = [
      'workflow', 'workflows', 'automation', 'node', 'nodes', 'trigger', 'action',
      'n8n', 'n9n', 'canvas', 'execution', 'run', 'execute'
    ];
    
    const lowerMessage = message.toLowerCase();
    return workflowKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  isAskingToCreateWorkflow(message) {
    const createKeywords = [
      'create', 'make', 'build', 'set up', 'setup', 'new workflow',
      'automate', 'automation', 'workflow for', 'workflow to'
    ];
    
    const lowerMessage = message.toLowerCase();
    return createKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  async getWorkflowContext() {
    try {
      if (!window.workflowDetector) {
        return { workflows: [], currentWorkflow: null };
      }

      const workflows = await window.workflowDetector.getWorkflows();
      const currentWorkflow = await window.workflowDetector.getCurrentWorkflow();

      return {
        workflows: workflows || [],
        currentWorkflow: currentWorkflow || null
      };
    } catch (error) {
      console.error('Error getting workflow context:', error);
      return { workflows: [], currentWorkflow: null };
    }
  }

  generateWorkflowListResponse(context) {
    const { workflows, currentWorkflow } = context;
    
    if (!workflows || workflows.length === 0) {
      return "I don't see any workflows in your n9n instance. You can create a new workflow by clicking the '+' button in the top left corner of the n9n interface.";
    }

    let response = `I found ${workflows.length} workflow${workflows.length === 1 ? '' : 's'} in your n9n instance:\n\n`;

    workflows.forEach((workflow, index) => {
      const isActive = workflow.active ? '🟢 Active' : '🔴 Inactive';
      const isCurrent = currentWorkflow && currentWorkflow.id === workflow.id ? ' (Current)' : '';
      
      response += `${index + 1}. **${workflow.name}**${isCurrent} - ${isActive}\n`;
      if (workflow.description) {
        response += `   ${workflow.description}\n`;
      }
      response += `   ID: \`${workflow.id}\`\n\n`;
    });

    if (currentWorkflow) {
      response += `You're currently viewing: **${currentWorkflow.name}**\n\n`;
    }

    response += "You can ask me to:\n";
    response += "• Explain any workflow in detail\n";
    response += "• Help you create a new workflow\n";
    response += "• Modify existing workflows\n";
    response += "• Troubleshoot workflow issues\n";

    return response;
  }

  generateWorkflowCreationResponse(userMessage, context) {
    const { workflows, currentWorkflow } = context;
    
    let response = "I'd be happy to help you create a new workflow! Here are some tips:\n\n";
    
    response += "**Workflow Creation Steps:**\n";
    response += "1. Click the '+' button in the top left to create a new workflow\n";
    response += "2. Add a trigger node (like HTTP Request, Schedule, or Manual)\n";
    response += "3. Add action nodes to process your data\n";
    response += "4. Connect the nodes to create your automation flow\n\n";
    
    response += "**Common Trigger Nodes:**\n";
    response += "• **HTTP Request** - Trigger via webhook\n";
    response += "• **Schedule** - Run on a schedule (cron)\n";
    response += "• **Manual** - Manual execution\n";
    response += "• **Webhook** - Real-time triggers\n\n";
    
    response += "**Popular Action Nodes:**\n";
    response += "• **HTTP Request** - Make API calls\n";
    response += "• **Set** - Set variables and data\n";
    response += "• **IF** - Conditional logic\n";
    response += "• **Code** - Custom JavaScript/Python\n";
    response += "• **Email** - Send emails\n\n";
    
    response += "Could you tell me more about what you want to automate? For example:\n";
    response += "• What should trigger the workflow?\n";
    response += "• What actions should it perform?\n";
    response += "• What data will it work with?\n";
    
    return response;
  }

  generateGeneralResponse(userMessage, context) {
    const { workflows, currentWorkflow } = context;
    
    let response = "I'm here to help you with your n9n workflows! Here's what I can do:\n\n";
    
    response += "**Workflow Management:**\n";
    response += `• You have ${workflows.length} workflow${workflows.length === 1 ? '' : 's'} in your instance\n`;
    if (currentWorkflow) {
      response += `• You're currently viewing: **${currentWorkflow.name}**\n`;
    }
    response += "• I can help you understand, modify, or create workflows\n\n";
    
    response += "**What I can help with:**\n";
    response += "• **Workflow Analysis** - Explain how workflows work\n";
    response += "• **Workflow Creation** - Help you build new automations\n";
    response += "• **Troubleshooting** - Debug workflow issues\n";
    response += "• **Optimization** - Improve workflow performance\n";
    response += "• **Node Configuration** - Help with specific node settings\n\n";
    
    response += "**Try asking me:**\n";
    response += "• \"Show me my workflows\"\n";
    response += "• \"Create a workflow to send emails\"\n";
    response += "• \"How does this workflow work?\"\n";
    response += "• \"Help me fix this error\"\n";
    
    return response;
  }

  generateFallbackResponse() {
    return "I'm sorry, I couldn't understand your request. I'm here to help you with n9n workflows! You can ask me to:\n\n" +
           "• Show your workflows\n" +
           "• Explain how workflows work\n" +
           "• Help create new workflows\n" +
           "• Troubleshoot issues\n" +
           "• Configure nodes\n\n" +
           "What would you like to know about your workflows?";
  }

  async renderInitialContent() {
    console.log('🎨 Rendering initial content...');
    try {
      // Check if authManager exists and is initialized
      if (!window.authManager) {
        console.log('⚠️ AuthManager not available, showing welcome message');
        this.renderWelcomeMessage();
        return;
      }

      const user = await window.authManager.getCurrentUser();
      console.log('👤 Current user:', user);
      
      if (user) {
        // User is authenticated, show recent conversations
        const conversations = await this.getRecentConversations();
        if (conversations && conversations.length > 0) {
          this.renderRecentConversationsView(conversations);
        } else {
          this.renderAuthenticatedWelcome(user);
        }
      } else {
        // User is not authenticated, show welcome message
        console.log('🔐 No authenticated user, showing welcome message');
        this.renderWelcomeMessage();
      }
    } catch (error) {
      console.error('❌ Error rendering initial content:', error);
      // Always show welcome message on error
      this.renderWelcomeMessage();
    }
  }

  async getRecentConversations() {
    try {
      // Check if authManager and conversationService are available
      if (!window.authManager || !window.conversationService) {
        console.log('❌ AuthManager or conversationService not available');
        return [];
      }

      const user = await window.authManager.getCurrentUser();
      if (!user) return [];

      // Use the real conversation service
      const { data: conversations } = await window.conversationService.getConversations(user.id);
      return conversations ? conversations.slice(0, 5) : []; // Show last 5 conversations
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getUserWorkflows() {
    try {
      // Check if authManager and supabaseClient are available
      if (!window.authManager || !window.supabaseClient) {
        console.log('❌ AuthManager or supabaseClient not available');
        return [];
      }

      const user = await window.authManager.getCurrentUser();
      if (!user) return [];

      // Use the real Supabase client to get user workflows
      const { data: workflows, error } = await window.supabaseClient.client
        .from('user_workflows')
        .select('*')
        .eq('user_id', user.id)
        .execute();
      
      if (error) {
        console.error('Error fetching user workflows:', error);
        return [];
      }
      
      return workflows || [];
    } catch (error) {
      console.error('Error fetching user workflows:', error);
      return [];
    }
  }

  async syncWorkflowToSupabase(workflow) {
    try {
      // Check if authManager and supabaseClient are available
      if (!window.authManager || !window.supabaseClient) {
        console.log('❌ AuthManager or supabaseClient not available');
        throw new Error('Authentication not available');
      }

      const user = await window.authManager.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Use the real Supabase client to sync workflow
      const { data, error } = await window.supabaseClient.client
        .from('user_workflows')
        .upsert([{
          id: workflow.id,
          user_id: user.id,
          name: workflow.name,
          description: workflow.description,
          n8n_workflow_json: workflow.n8n_workflow_json,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'id'
        })
        .execute();
      
      if (error) {
        console.error('Error syncing workflow to Supabase:', error);
        throw new Error('Failed to sync workflow to backend');
      }

      return data;
    } catch (error) {
      console.error('Error syncing workflow to backend:', error);
      throw error;
    }
  }

  renderRecentConversationsView(conversations) {
    const contentArea = document.querySelector('#messages-container');
    if (!contentArea) return;

    let html = `
      <div style="
        padding: 20px;
        height: 100%;
        overflow-y: auto;
      ">
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px; color: #fafafa; font-size: 16px;">Recent Conversations</h3>
          <p style="margin: 0; color: #a1a1aa; font-size: 14px;">Continue where you left off</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
    `;

    conversations.forEach(conversation => {
      html += this.renderConversationItem(conversation);
    });

    html += `
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #27272a;">
          <button id="new-conversation-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: #3b82f6;
            border: 1px solid #60a5fa;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
          ">Start New Conversation</button>
        </div>
      </div>
    `;

    contentArea.innerHTML = html;
    this.setupConversationHandlers();
  }

  renderConversationItem(conversation) {
    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
    const preview = lastMessage?.content?.substring(0, 100) || 'No messages yet';
    const timeAgo = this.getTimeAgo(conversation.updated_at || conversation.created_at);

    return `
      <div class="conversation-item" data-conversation-id="${conversation.id}" style="
        padding: 12px;
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        ">
          <h4 style="
            margin: 0;
            color: #fafafa;
            font-size: 14px;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
          ">${conversation.title || 'Untitled Conversation'}</h4>
          <span style="
            color: #71717a;
            font-size: 12px;
            flex-shrink: 0;
            margin-left: 8px;
          ">${timeAgo}</span>
        </div>
        <p style="
          margin: 0;
          color: #a1a1aa;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        ">${preview}${preview.length >= 100 ? '...' : ''}</p>
      </div>
    `;
  }

  setupConversationHandlers() {
    const conversationItems = document.querySelectorAll('.conversation-item');
    const newConversationBtn = document.getElementById('new-conversation-btn');

    conversationItems.forEach(item => {
      item.addEventListener('click', async () => {
        const conversationId = item.dataset.conversationId;
        await this.loadConversation(conversationId);
      });

      item.addEventListener('mouseenter', () => {
        item.style.background = '#27272a';
        item.style.borderColor = '#3f3f46';
      });

      item.addEventListener('mouseleave', () => {
        item.style.background = '#18181b';
        item.style.borderColor = '#27272a';
      });
    });

    newConversationBtn?.addEventListener('click', () => {
      this.startNewChat();
    });
  }

  async loadConversation(conversationId) {
    try {
      // Check if authManager and conversationService are available
      if (!window.authManager || !window.conversationService) {
        console.log('❌ AuthManager or conversationService not available');
        return;
      }

      const user = await window.authManager.getCurrentUser();
      if (!user) return;

      // Use the real conversation service
      const { data: messages } = await window.conversationService.getConversationMessages(conversationId);
      
      if (messages) {
        this.currentConversationId = conversationId;
        this.messages = messages || [];
        this.renderMessages(this.messages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      this.showNotification('Failed to load conversation', 'error');
    }
  }

  renderWelcomeMessage() {
    console.log('👋 Rendering welcome message...');
    const contentArea = document.querySelector('#messages-container');
    if (!contentArea) {
      console.error('❌ Could not find #messages-container');
      return;
    }
    console.log('✅ Found messages container:', contentArea);

    const html = `
      <div style="
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      ">
        
        <h2 style="
          margin: 0 0 12px;
          color: #fafafa;
          font-size: 24px;
          font-weight: 700;
        ">Welcome to n9n Copilot</h2>
        
        <p style="
          margin: 0 0 24px;
          color: #a1a1aa;
          font-size: 14px;
        ">Sign in to access your conversations and settings</p>

        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px;">
          <button id="google-signin-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 12px;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #27272a;">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              Don't have an account? 
              <button id="show-signup-btn" style="
                background: none;
                border: none;
                color: #3b82f6;
                cursor: pointer;
                font-size: 12px;
                text-decoration: underline;
              ">Sign up</button>
            </p>
          </div>
        </div>
        
      </div>
    `;

    contentArea.innerHTML = html;

    // Setup event listeners
    const googleBtn = document.getElementById('google-signin-btn');
    const showSignupBtn = document.getElementById('show-signup-btn');

    googleBtn?.addEventListener('click', async () => {
      try {
        googleBtn.textContent = 'Signing in...';
        googleBtn.disabled = true;
        
        await window.authManager?.signInWithGoogle();
        
        // Show success message directly in the chat panel
        this.showSuccessMessage('Signed in successfully! Welcome to n9n Copilot!');
        
        // Refresh the chat panel after a short delay
        setTimeout(async () => {
          await this.renderInitialContent();
        }, 1500);
      } catch (error) {
        this.showErrorMessage('Failed to sign in. Please try again.');
        googleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        `;
        googleBtn.disabled = false;
      }
    });

    showSignupBtn?.addEventListener('click', () => {
      this.renderSignUpMessage();
    });

    console.log('✅ Welcome message rendered successfully');
  }

  renderSignUpMessage() {
    console.log('👋 Rendering sign up message...');
    const contentArea = document.querySelector('#messages-container');
    if (!contentArea) {
      console.error('❌ Could not find #messages-container');
      return;
    }

    const html = `
      <div style="
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      ">
        
        <h2 style="
          margin: 0 0 16px;
          color: #fafafa;
          font-size: 24px;
          font-weight: 700;
        ">Create Account</h2>
        
        <p style="
          margin: 0 0 24px;
          color: #a1a1aa;
          font-size: 14px;
        ">Sign up to start using n9n Copilot</p>

        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px;">
          <button id="google-signup-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 12px;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
          
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #27272a;">
            <p style="margin: 0; color: #71717a; font-size: 12px;">
              Already have an account? 
              <button id="show-signin-btn" style="
                background: none;
                border: none;
                color: #3b82f6;
                cursor: pointer;
                font-size: 12px;
                text-decoration: underline;
              ">Sign in</button>
            </p>
          </div>
        </div>
        
      </div>
    `;

    contentArea.innerHTML = html;

    // Setup event listeners
    const googleBtn = document.getElementById('google-signup-btn');
    const showSigninBtn = document.getElementById('show-signin-btn');

    googleBtn?.addEventListener('click', async () => {
      try {
        googleBtn.textContent = 'Creating account...';
        googleBtn.disabled = true;
        
        await window.authManager?.signInWithGoogle();
        
        // Show success message directly in the chat panel
        this.showSuccessMessage('Account created successfully! Welcome to n9n Copilot!');
        
        // Refresh the chat panel after a short delay
        setTimeout(async () => {
          await this.renderInitialContent();
        }, 1500);
      } catch (error) {
        this.showErrorMessage('Failed to create account. Please try again.');
        googleBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        `;
        googleBtn.disabled = false;
      }
    });

    showSigninBtn?.addEventListener('click', () => {
      this.renderWelcomeMessage();
    });

    console.log('✅ Sign up message rendered successfully');
  }

  renderAuthenticatedWelcome(user) {
    console.log('👋 Rendering authenticated welcome message...');
    const contentArea = document.querySelector('#messages-container');
    if (!contentArea) {
      console.error('❌ Could not find #messages-container');
      return;
    }

    const html = `
      <div style="
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      ">
        
        <div style="
          width: 64px;
          height: 64px;
          background: #09090b;
          border-radius: 50%;
          border: 1px solid #27272a;
          border-radius: 8px;
          border-color: #27272a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
          color: white;
          font-weight: 600;
        ">${user.email?.charAt(0).toUpperCase() || 'U'}</div>
        
        <h2 style="
          margin: 0 0 8px;
          color: #fafafa;
          font-size: 20px;
          font-weight: 600;
        ">Welcome back, ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}!</h2>
        
        <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 280px;">
          <button id="new-chat-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: #131313;
            border: 1px solid #60a5fa;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2"/>
            </svg>
            Start New Conversation
          </button>
          
          <button id="explore-workflows-btn" style="
            width: 100%;
            padding: 12px 16px;
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 8px;
            color: #fafafa;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Explore My Workflows
          </button>
        </div>
        
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #27272a;">
          <p style="margin: 0; color: #71717a; font-size: 12px;">
            Signed in as ${user.email}
          </p>
        </div>
      </div>
    `;

    contentArea.innerHTML = html;

    // Setup event listeners
    const newChatBtn = document.getElementById('new-chat-btn');
    const exploreWorkflowsBtn = document.getElementById('explore-workflows-btn');

    newChatBtn?.addEventListener('click', () => {
      this.startNewChat();
    });

    exploreWorkflowsBtn?.addEventListener('click', () => {
      // This could trigger a workflow exploration feature
      this.showNotification('Workflow exploration coming soon!', 'info');
    });

    console.log('✅ Authenticated welcome message rendered successfully');
  }

  showSuccessMessage(message) {
    const contentArea = document.querySelector('#messages-container');
    if (!contentArea) return;

    const successHtml = `
      <div style="
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      ">
        <div style="
          width: 64px;
          height: 64px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 32px;
          color: white;
        ">✓</div>
        <h3 style="
          margin: 0 0 8px;
          color: #fafafa;
          font-size: 20px;
          font-weight: 600;
        ">Success!</h3>
        <p style="
          margin: 0;
          color: #a1a1aa;
          font-size: 14px;
        ">${message}</p>
      </div>
    `;

    contentArea.innerHTML = successHtml;
  }

  showErrorMessage(message) {
    const contentArea = document.querySelector('#messages-container');
    if (!contentArea) return;

    const errorHtml = `
      <div style="
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      ">
        <div style="
          width: 64px;
          height: 64px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 32px;
          color: white;
        ">✕</div>
        <h3 style="
          margin: 0 0 8px;
          color: #fafafa;
          font-size: 20px;
          font-weight: 600;
        ">Error</h3>
        <p style="
          margin: 0;
          color: #a1a1aa;
          font-size: 14px;
        ">${message}</p>
        <button id="retry-auth-btn" style="
          margin-top: 16px;
          padding: 8px 16px;
          background: #3b82f6;
          border: 1px solid #60a5fa;
          border-radius: 6px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        ">Try Again</button>
      </div>
    `;

    contentArea.innerHTML = errorHtml;

    // Add retry button listener
    const retryBtn = document.getElementById('retry-auth-btn');
    retryBtn?.addEventListener('click', () => {
      this.renderWelcomeMessage();
    });
  }

  startNewChat() {
    this.currentConversationId = null;
    this.messages = [];
    this.clearMessages();
    this.renderWelcomeMessage();
  }

  closeCurrentConversation() {
    this.currentConversationId = null;
    this.messages = [];
    this.clearMessages();
  }

  clearMessages() {
    const contentArea = document.querySelector('#messages-container');
    if (contentArea) {
      contentArea.innerHTML = '';
    }
  }

  renderMessages(messages) {
    const contentArea = document.querySelector('#messages-container');
    if (!contentArea) return;

    let html = `
      <div style="
        padding: 20px;
        height: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
    `;

    messages.forEach(message => {
      html += this.renderMessage(message);
    });

    html += '</div>';
    contentArea.innerHTML = html;
    this.setupMessageButtonListeners();
  }

  renderMessage(message) {
    const isUser = message.role === 'user';
    const timeAgo = this.getTimeAgo(message.timestamp);
    const formattedContent = this.formatMessageContent(message.content);

    return `
      <div style="
        display: flex;
        flex-direction: column;
        gap: 8px;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        ">
          <div style="
            width: 32px;
            height: 32px;
            background: ${isUser ? '#3b82f6' : '#8b5cf6'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              ${isUser ? 
                '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' :
                '<path d="M12 2L2 7L12 12L22 7L12 2Z"/><path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/>'
              }
            </svg>
          </div>
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
          ">
            <span style="
              color: #fafafa;
              font-size: 14px;
              font-weight: 600;
            ">${isUser ? 'You' : 'n9n Copilot'}</span>
            <span style="
              color: #71717a;
              font-size: 12px;
            ">${timeAgo}</span>
          </div>
          ${!isUser ? `
            <button class="copy-message-btn" data-message-id="${message.id}" style="
              background: none;
              border: none;
              color: #71717a;
              cursor: pointer;
              padding: 4px;
              border-radius: 4px;
              transition: all 0.2s;
            " title="Copy message">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          ` : ''}
        </div>
        
        <div style="
          margin-left: 40px;
          padding: 12px 16px;
          background: ${isUser ? '#3b82f6' : '#18181b'};
          border: 1px solid ${isUser ? '#60a5fa' : '#27272a'};
          border-radius: 8px;
          color: ${isUser ? 'white' : '#fafafa'};
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        ">${formattedContent}</div>
      </div>
    `;
  }

  formatMessageContent(content) {
    if (!content) return '';

    // Escape HTML
    let formatted = this.escapeHtml(content);

    // Convert markdown-style formatting
    formatted = formatted
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre style="background: #27272a; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0;"><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background: #27272a; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>')
      // Lists
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul style="margin: 8px 0; padding-left: 20px;">$1</ul>')
      // Numbered lists
      .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol style="margin: 8px 0; padding-left: 20px;">$1</ol>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #3b82f6; text-decoration: underline;">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return formatted;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getTimeAgo(timestamp) {
    if (!timestamp) return '';

    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }

  addTypingIndicator() {
    if (this.isTyping) return;
    
    this.isTyping = true;
    const contentArea = document.querySelector('#messages-container');
    if (!contentArea) return;

    const typingHtml = `
      <div id="typing-indicator" style="
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 40px;
        padding: 12px 16px;
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 8px;
        width: fit-content;
      ">
        <div style="
          width: 32px;
          height: 32px;
          background: #8b5cf6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
        </div>
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span style="color: #fafafa; font-size: 14px; font-weight: 600;">n9n Copilot</span>
          <span style="color: #71717a; font-size: 12px;">is typing</span>
        </div>
        <div style="
          display: flex;
          gap: 2px;
          margin-left: 8px;
        ">
          <div class="typing-dot" style="
            width: 4px;
            height: 4px;
            background: #71717a;
            border-radius: 50%;
            animation: typing 1.4s infinite;
          "></div>
          <div class="typing-dot" style="
            width: 4px;
            height: 4px;
            background: #71717a;
            border-radius: 50%;
            animation: typing 1.4s infinite 0.2s;
          "></div>
          <div class="typing-dot" style="
            width: 4px;
            height: 4px;
            background: #71717a;
            border-radius: 50%;
            animation: typing 1.4s infinite 0.4s;
          "></div>
        </div>
      </div>
    `;

    contentArea.insertAdjacentHTML('beforeend', typingHtml);

    // Add typing animation if not already present
    if (!document.getElementById('typing-animation')) {
      const style = document.createElement('style');
      style.id = 'typing-animation';
      style.textContent = `
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    // Scroll to bottom
    contentArea.scrollTop = contentArea.scrollHeight;
  }

  removeTypingIndicator() {
    this.isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  setupMessageButtonListeners() {
    const copyButtons = document.querySelectorAll('.copy-message-btn');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', async () => {
        const messageId = button.dataset.messageId;
        const message = this.messages.find(m => m.id === messageId);
        
        if (message) {
          try {
            await this.copyToClipboard(message.content);
            this.showNotification('Message copied to clipboard!', 'success');
          } catch (error) {
            this.showNotification('Failed to copy message', 'error');
          }
        }
      });

      button.addEventListener('mouseenter', () => {
        button.style.background = '#27272a';
        button.style.color = '#fafafa';
      });

      button.addEventListener('mouseleave', () => {
        button.style.background = 'none';
        button.style.color = '#71717a';
      });
    });
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
  module.exports = ChatManager;
}

// Expose globally for browser extension
window.ChatManager = ChatManager;