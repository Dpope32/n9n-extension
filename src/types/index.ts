export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  ai_credits_remaining: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
}

export interface Workflow {
  id: string;
  created_at: string;
  name: string;
  description: string;
  user_id: string;
  workflow_data?: any;
  project_id?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  status: 'active' | 'completed' | 'failed';
  total_messages: number;
  ai_credits_used: number;
  generated_workflow_id?: string;
  created_at: string;
  completed_at?: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: any;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  user_id: string;
  execution_status: 'success' | 'failed' | 'running';
  execution_data?: any;
  error_message?: string;
  execution_time_ms?: number;
  n8n_execution_id?: string;
  started_at: string;
  completed_at?: string;
}

export interface ExtensionState {
  isAuthenticated: boolean;
  user: User | null;
  currentConversation: AIConversation | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isGenerating?: boolean;
}

export interface N8nDetection {
  isN8nPage: boolean;
  workflowId?: string;
  pageType: 'workflow' | 'executions' | 'templates' | 'unknown';
}