// WorkflowDetector.js - Detects and extracts workflows from n8n interface
// Handles both workflow list view and individual workflow pages

class WorkflowDetector {
  constructor() {
    this.workflows = [];
    this.currentPage = null;
    this.isMonitoring = false;
    this.lastScan = null;
    this.scanInterval = null;
    this.lastWorkflowHash = null; // Track workflow changes
    this.scanInProgress = false; // Prevent concurrent scans
    this.scanCount = 0; // Track number of scans
    this.maxScansPerMinute = 12; // Maximum 12 scans per minute (every 5 seconds)
    this.lastMinuteScans = []; // Track scans in the last minute
  }

  // Initialize workflow detection
  initialize() {
    this.detectCurrentPage();
    this.startMonitoring();
    this.performInitialScan();
  }

  // Detect what type of n8n page we're on
  detectCurrentPage() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    if (pathname.includes('/workflows') || pathname.includes('/home/workflows')) {
      this.currentPage = 'workflow_list';
    } else if (pathname.includes('/workflow/') && !pathname.includes('/executions')) {
      this.currentPage = 'workflow_editor';
    } else if (pathname.includes('/executions')) {
      this.currentPage = 'executions';
    } else if (pathname.includes('/credentials')) {
      this.currentPage = 'credentials';
    } else {
      this.currentPage = 'unknown';
    }
    
    return this.currentPage;
  }

  // Start monitoring for workflow changes
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor URL changes (for SPA navigation)
    this.originalPushState = history.pushState;
    this.originalReplaceState = history.replaceState;
    
    history.pushState = (...args) => {
      this.originalPushState.apply(history, args);
      this.handleNavigationChange();
    };
    
    history.replaceState = (...args) => {
      this.originalReplaceState.apply(history, args);
      this.handleNavigationChange();
    };
    
    window.addEventListener('popstate', () => this.handleNavigationChange());
    
    // Monitor DOM changes
    this.observer = new MutationObserver((mutations) => {
      this.handleDOMChanges(mutations);
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-test-id']
    });
    
    // Periodic scan for missed changes (reduced frequency)
    this.scanInterval = setInterval(() => {
      this.scanForWorkflows();
    }, 30000); // Changed from 5000 to 30000 (30 seconds)
  }

  // Handle navigation changes
  handleNavigationChange() {
    setTimeout(() => {
      this.detectCurrentPage();
      this.scanForWorkflows();
    }, 2000); // Reduced from 5000 to 2000 (2 seconds)
  }

  // Handle DOM changes
  handleDOMChanges(mutations) {
    let shouldRescan = false;
    
    for (const mutation of mutations) {
      // Check for workflow-related elements
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (this.isWorkflowElement(node)) {
              shouldRescan = true;
              break;
            }
          }
        }
      }
    }
    
    if (shouldRescan) {
      clearTimeout(this.rescanTimeout);
      this.rescanTimeout = setTimeout(() => {
        this.scanForWorkflows();
      }, 15000); // Increased from 10000 to 15000 (15 seconds)
    }
  }

  // Check if element is workflow-related
  isWorkflowElement(element) {
    const workflowIndicators = [
      'workflow',
      'card_cardLink',
      'resources-list',
      'workflow-canvas',
      'canvas'
    ];
    
    const elementStr = element.outerHTML?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';
    const testId = element.getAttribute?.('data-test-id') || '';
    
    return workflowIndicators.some(indicator => 
      elementStr.includes(indicator) || 
      className.includes(indicator) || 
      testId.includes(indicator)
    );
  }

  // Perform initial scan
  performInitialScan() {
    setTimeout(() => {
      this.scanForWorkflows();
    }, 5000); // Reduced from 10000 to 5000 (5 seconds)
  }

  // Main workflow scanning function
  async scanForWorkflows() {
    // Prevent concurrent scans
    if (this.scanInProgress) {
      return;
    }

    if (this.lastScan && Date.now() - this.lastScan < 5000) {
      return;
    }
    
    const now = Date.now();
    this.lastMinuteScans = this.lastMinuteScans.filter(time => now - time < 60000);
    
    if (this.lastMinuteScans.length >= this.maxScansPerMinute) {
      return;
    }
    
    this.lastMinuteScans.push(now);
    this.scanInProgress = true;
    
    try {
      
      let detectedWorkflows = [];
      
      switch (this.currentPage) {
        case 'workflow_list':
          detectedWorkflows = await this.scanWorkflowListPage();
          break;
        case 'workflow_editor':
          detectedWorkflows = await this.scanWorkflowEditorPage();
          break;
        case 'executions':
          detectedWorkflows = await this.scanExecutionsPage();
          break;  
        default:
          detectedWorkflows = await this.scanGenericPage();
      }
      
      if (detectedWorkflows.length > 0) {
        // Check if workflows have actually changed
        const currentHash = this.generateWorkflowHash(detectedWorkflows);
        
        if (currentHash === this.lastWorkflowHash) {
        } else {
          this.workflows = detectedWorkflows;
          this.lastWorkflowHash = currentHash;
          this.lastScan = Date.now();
          
          // Notify other parts of the extension about workflow changes
          this.notifyWorkflowsChanged();
          
          // Optionally sync to backend
          await this.syncWorkflowsToBackend();
        }
      } 
      
    } catch (error) {
    } finally {
      this.scanInProgress = false;
    }
  }

  // Scan workflow list page (dashboard/home)
  async scanWorkflowListPage() {
    const workflows = [];
    
    // Multiple selectors for different n8n versions
    const workflowSelectors = [
      '[data-test-id="resources-list-item-workflow"]',  // New n8n
      '.workflow-card',                                  // Legacy
      '[data-test-id*="workflow"]',                     // Generic workflow elements
      '.card_cardLink',                                 // Based on screenshot
      '[class*="cardLink"]'                             // Class pattern matching
    ];
    
    for (const selector of workflowSelectors) {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        try {
          const workflow = await this.extractWorkflowFromListItem(element);
          if (workflow && !workflows.find(w => w.id === workflow.id)) {
            workflows.push(workflow);
          }
        } catch (error) {
          console.warn('⚠️ Failed to extract workflow from element:', error);
        }
      }
    }

    if (workflows.length === 0) {     
      const cardElements = document.querySelectorAll('[class*="card"], [class*="item"], [class*="row"]');
      
      for (const element of cardElements) {
        const text = element.textContent?.toLowerCase() || '';
        const html = element.outerHTML?.toLowerCase() || '';
        
        if (text.includes('workflow') || html.includes('workflow') || 
            text.includes('automation') || this.looksLikeWorkflowCard(element)) {
          try {
            const workflow = await this.extractWorkflowFromListItem(element);
            if (workflow && !workflows.find(w => w.id === workflow.id)) {
              workflows.push(workflow);
            }
          } catch (error) {
            console.warn('⚠️ Fallback extraction failed:', error);
          }
        }
      }
    }
    
    return workflows;
  }

  // Check if element looks like a workflow card
  looksLikeWorkflowCard(element) {
    const rect = element.getBoundingClientRect();
    const hasClickableArea = rect.width > 200 && rect.height > 80;
    const hasTitle = element.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="name"]');
    const hasMetadata = element.textContent?.includes('ago') || element.textContent?.includes('Created');
    
    return hasClickableArea && hasTitle && hasMetadata;
  }

  // Extract workflow info from list item
  async extractWorkflowFromListItem(element) {
    
    try {
      // Extract workflow name
      const nameSelectors = [
        '[data-test-id="card-content"] h3',           // Standard selector
        'h1, h2, h3, h4, h5, h6',                     // Any heading
        '[class*="title"]',                           // Title class
        '[class*="name"]',                            // Name class
        '[class*="header"]',                          // Header class
        'a[href*="workflow"]'                         // Link containing workflow
      ];
      
      let name = 'Unnamed Workflow';
      for (const selector of nameSelectors) {
        const nameEl = element.querySelector(selector);
        if (nameEl && nameEl.textContent?.trim()) {
          name = nameEl.textContent.trim();
          break;
        }
      }
      
      // Extract description
      const descSelectors = [
        '[class*="description"]',
        'p',
        '[class*="subtitle"]',
        '.workflow-description'
      ];
      
      let description = '';
      for (const selector of descSelectors) {
        const descEl = element.querySelector(selector);
        if (descEl && descEl.textContent?.trim() && descEl.textContent !== name) {
          description = descEl.textContent.trim();
          break;
        }
      }
      
      // Extract metadata (created date, etc.)
      let createdAt = null;
      let updatedAt = null;
      
      const metadataText = element.textContent || '';
      
      // Look for date patterns
      const dateMatches = metadataText.match(/(\d+)\s*(day|week|month|year|hour|minute)s?\s*ago/i);
      if (dateMatches) {
        const amount = parseInt(dateMatches[1]);
        const unit = dateMatches[2].toLowerCase();
        const now = new Date();
        
        switch (unit) {
          case 'minute':
            updatedAt = new Date(now - amount * 60 * 1000);
            break;
          case 'hour':
            updatedAt = new Date(now - amount * 60 * 60 * 1000);
            break;
          case 'day':
            updatedAt = new Date(now - amount * 24 * 60 * 60 * 1000);
            break;
          case 'week':
            updatedAt = new Date(now - amount * 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            updatedAt = new Date(now - amount * 30 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            updatedAt = new Date(now - amount * 365 * 24 * 60 * 60 * 1000);
            break;
        }
      }
      
      // Extract workflow ID from URL or generate
      let workflowId = null;
      const linkEl = element.querySelector('a[href*="workflow"]');
      if (linkEl) {
        const href = linkEl.getAttribute('href');
        const idMatch = href.match(/workflow\/([^\/\?]+)/);
        if (idMatch) {
          workflowId = idMatch[1];
        }
      }
      
      if (!workflowId) {
        // Generate ID from name
        workflowId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
      }
      
      // Extract tags if available
      const tags = [];
      const tagElements = element.querySelectorAll('[class*="tag"], [class*="badge"], [class*="chip"]');
      for (const tagEl of tagElements) {
        const tagText = tagEl.textContent?.trim();
        if (tagText && tagText.length < 20) {
          tags.push(tagText);
        }
      }
      
      // Check if workflow is active/published
      const isActive = !element.textContent?.toLowerCase().includes('draft') &&
                      !element.classList.contains('disabled') &&
                      !element.classList.contains('inactive');
      
      const workflow = {
        id: workflowId,
        name: name,
        description: description,
        createdAt: createdAt,
        updatedAt: updatedAt || new Date(),
        tags: tags,
        isActive: isActive,
        source: 'n8n_ui',
        url: linkEl?.getAttribute('href') || null,
        elementSnapshot: {
          className: element.className,
          textContent: element.textContent?.substring(0, 200),
          innerHTML: element.innerHTML?.substring(0, 500)
        }
      };
      
      return workflow;
      
    } catch (error) {
      console.error('💥 Error extracting workflow from element:', error);
      return null;
    }
  }

  // Scan workflow editor page
  async scanWorkflowEditorPage() {
    const workflows = [];
    
    try {
      // Try to get workflow info from the editor
      const workflow = await this.extractWorkflowFromEditor();
      if (workflow) {
        workflows.push(workflow);
      }
    } catch (error) {
      console.error('💥 Error scanning editor page:', error);
    }
    
    return workflows;
  }

  // Extract workflow from editor
  async extractWorkflowFromEditor() {
    
    try {
      // Get workflow name from title
      const titleSelectors = [
        '[data-test-id="workflow-name-input"]',
        'input[placeholder*="workflow name"]',
        'input[placeholder*="Workflow name"]',
        '.workflow-name input',
        'h1, h2, h3'
      ];
      
      let name = 'Current Workflow';
      for (const selector of titleSelectors) {
        const titleEl = document.querySelector(selector);
        if (titleEl) {
          name = titleEl.value || titleEl.textContent?.trim() || name;
          if (name !== 'Current Workflow') break;
        }
      }
      
      // Get workflow ID from URL
      const urlMatch = window.location.pathname.match(/workflow\/([^\/\?]+)/);
      const workflowId = urlMatch ? urlMatch[1] : 'current-workflow';
      
      // Try to extract nodes count
      let nodeCount = 0;
      const nodeElements = document.querySelectorAll('[data-test-id*="node"], .node-element, [class*="node"]');
      nodeCount = nodeElements.length;
      
      // Try to get workflow data from n8n API or globals
      let workflowData = null;
      if (window.n8n && window.n8n.getWorkflow) {
        try {
          workflowData = await window.n8n.getWorkflow();
        } catch (error) {
          console.warn('⚠️ Could not get workflow data from n8n API:', error);
        }
      }
      
      const workflow = {
        id: workflowId,
        name: name,
        description: `Workflow with ${nodeCount} nodes`,
        nodeCount: nodeCount,
        isActive: true,
        source: 'n8n_editor',
        url: window.location.href,
        workflowData: workflowData,
        updatedAt: new Date()
      };
      
      return workflow;
      
    } catch (error) {
      console.error('💥 Error extracting from editor:', error);
      return null;
    }
  }

  // Scan executions page
  async scanExecutionsPage() {
    return []; // For now, just return empty array
  }

  // Generic page scan
  async scanGenericPage() {
    return []; // For now, just return empty array
  }

  // Generate hash to detect workflow changes
  generateWorkflowHash(workflows) {
    const workflowData = workflows.map(w => ({
      id: w.id,
      name: w.name,
      updatedAt: w.updatedAt?.toISOString() || ''
    }));
    
    return JSON.stringify(workflowData);
  }

  // Notify other parts of extension about workflow changes
  notifyWorkflowsChanged() {
    
    // Dispatch custom event
    const event = new CustomEvent('n9n-workflows-changed', {
      detail: {
        workflows: this.workflows,
        count: this.workflows.length,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(event);
    
    // Update global context
    window.n9nWorkflows = this.workflows;
    
    // Store in sessionStorage for quick access
    try {
      sessionStorage.setItem('n9n_detected_workflows', JSON.stringify(this.workflows));
    } catch (error) {
      console.warn('⚠️ Could not store workflows in sessionStorage:', error);
    }
  }

  // Sync workflows to backend
  async syncWorkflowsToBackend() {
    try {
      
      // Debug authentication status
      if (!window.chatManager) {
        console.log('❌ No chatManager available');
        return;
      }
      
      // Check if authManager exists and isAuthenticated method exists
      if (!window.authManager) {
        console.log('❌ No authManager available');
        return;
      }
      
      if (typeof window.authManager.isAuthenticated !== 'function') {
        console.log('❌ authManager.isAuthenticated is not a function');
        return;
      }
      
      const isAuth = window.authManager.isAuthenticated();
      
      if (!isAuth) {
        
        if (window.authManager) {
          
          
          // Try to get session
          try {
            const session = await window.authManager.getSession();
            if (session) {
            }
          } catch (error) {
          }
        }
        
        return;
      }
      
      
      for (const workflow of this.workflows) {
        try {
          // Check if workflow already exists in backend
          if (!window.chatManager.getUserWorkflows) {
            return;
          }
          
          const existingWorkflows = await window.chatManager.getUserWorkflows();
          const exists = existingWorkflows.find(w => w.name === workflow.name || w.id === workflow.id);
          
          if (!exists) {
            // Convert to backend format
            const backendWorkflow = {
              id: workflow.id,
              name: workflow.name,
              description: workflow.description || '',
              n8n_workflow_json: workflow.workflowData || {
                meta: {
                  source: 'n8n_ui_detection',
                  detectedAt: new Date().toISOString(),
                  nodeCount: workflow.nodeCount
                }
              }
            };
            
            if (!window.chatManager.syncWorkflowToSupabase) {
              return;
            }
            
            await window.chatManager.syncWorkflowToSupabase(backendWorkflow);
          }
        } catch (error) {
          console.warn('⚠️ Failed to sync individual workflow:', workflow.name, error);
        }
      }
      
    } catch (error) {
      console.error('💥 Error syncing workflows to backend:', error);
    }
  }

  // Get current workflows
  getWorkflows() {
    return this.workflows;
  }

  // Get workflows formatted for AI context
  getWorkflowsForAI() {
    return {
      count: this.workflows.length,
      lastScan: this.lastScan ? new Date(this.lastScan).toISOString() : null,
      currentPage: this.currentPage,
      workflows: this.workflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        nodeCount: w.nodeCount,
        isActive: w.isActive,
        updatedAt: w.updatedAt,
        tags: w.tags
      }))
    };
  }

  // Force refresh workflows
  async refreshWorkflows() {
    await this.scanForWorkflows();
    return this.workflows;
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    // Restore original history methods
    if (this.originalPushState) {
      history.pushState = this.originalPushState;
    }
    if (this.originalReplaceState) {
      history.replaceState = this.originalReplaceState;
    }
    
    // Stop observing DOM changes
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Clear interval
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    
    // Clear timeouts
    if (this.rescanTimeout) {
      clearTimeout(this.rescanTimeout);
    }
    
    // Reset scan tracking
    this.scanInProgress = false;
    this.lastMinuteScans = [];
    this.scanCount = 0;
  }

  // Cleanup
  destroy() {
    this.stopMonitoring();
    this.workflows = [];
    this.currentPage = null;
    this.lastScan = null;
    this.lastWorkflowHash = null;
    this.scanCount = 0;
    this.lastMinuteScans = [];
  }
}

// Export for use in other modules
window.WorkflowDetector = WorkflowDetector;