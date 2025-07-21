class PopupManager {
    constructor() {
        this.currentTab = null;
        this.authStatus = null;
        this.pageInfo = null;
        this.init();
    }
    
    async init() {
        try {
            await this.loadCurrentTab();
            await this.loadAuthStatus();
            await this.loadPageInfo();
            this.render();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to initialize popup:', error);
            this.renderError(error);
        }
    }
    
    async loadCurrentTab() {
        const [tab] = await chrome.tabs.query({ 
            active: true, 
            currentWindow: true 
        });
        this.currentTab = tab;
    }
    
    async loadAuthStatus() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_AUTH_STATUS'
            });
            this.authStatus = response;
        } catch (error) {
            console.error('Failed to get auth status:', error);
            this.authStatus = { isAuthenticated: false };
        }
    }
    
    async loadPageInfo() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'CHECK_N8N_PAGE'
            });
            this.pageInfo = response;
        } catch (error) {
            console.error('Failed to get page info:', error);
            this.pageInfo = { isN8NPage: false, isVisible: false };
        }
    }
    
    render() {
        const content = document.getElementById('popup-content');
        
        content.innerHTML = `
            <div class="status-section">
                <div class="section-title">Status</div>
                ${this.renderStatusItems()}
            </div>
            
            ${this.authStatus?.isAuthenticated ? this.renderUserSection() : this.renderAuthSection()}
            
            <div class="actions-section">
                <div class="section-title">Actions</div>
                ${this.renderActions()}
            </div>
        `;
    }
    
    renderStatusItems() {
        return `
            <div class="status-item">
                <div class="status-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Authentication
                </div>
                <div class="status-value ${this.authStatus?.isAuthenticated ? 'status-online' : 'status-offline'}">
                    ${this.authStatus?.isAuthenticated ? 'Connected' : 'Disconnected'}
                </div>
            </div>
            
            <div class="status-item">
                <div class="status-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    n8n Page
                </div>
                <div class="status-value ${this.pageInfo?.isN8NPage ? 'status-detected' : 'status-not-detected'}">
                    ${this.pageInfo?.isN8NPage ? 'Detected' : 'Not Found'}
                </div>
            </div>
            
            <div class="status-item">
                <div class="status-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Copilot
                </div>
                <div class="status-value ${this.pageInfo?.isVisible ? 'status-online' : 'status-offline'}">
                    ${this.pageInfo?.isVisible ? 'Active' : 'Hidden'}
                </div>
            </div>
        `;
    }
    
    renderUserSection() {
        const session = this.authStatus?.session;
        const user = session?.user;
        
        if (!user) return '';
        
        return `
            <div class="user-section">
                <div class="user-info">
                    <img src="${user.user_metadata?.avatar_url || this.getDefaultAvatar()}" 
                         alt="User" class="user-avatar">
                    <div class="user-details">
                        <div class="user-name">${user.user_metadata?.full_name || 'User'}</div>
                        <div class="user-email">${user.email}</div>
                    </div>
                </div>
                <button class="action-btn" id="sign-out-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Sign Out
                </button>
            </div>
        `;
    }
    
    renderAuthSection() {
        return `
            <div class="user-section">
                <p style="color: #9ca3af; font-size: 14px; margin-bottom: 16px;">
                    Sign in to start building workflows with AI assistance
                </p>
                <button class="action-btn action-btn-primary" id="sign-in-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    </svg>
                    Continue with Google
                </button>
            </div>
        `;
    }
    
    renderActions() {
        const actions = [];
        
        if (this.pageInfo?.isN8NPage) {
            actions.push(`
                <button class="action-btn action-btn-primary" id="toggle-copilot-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    ${this.pageInfo?.isVisible ? 'Hide' : 'Show'} Copilot
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn" id="open-n8n-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2"/>
                </svg>
                Open n8n.io
            </button>
        `);
        
        actions.push(`
            <button class="action-btn" id="refresh-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4a9 9 0 0 1-14.85 4.36L13 14" stroke="currentColor" stroke-width="2"/>
                </svg>
                Refresh Status
            </button>
        `);
        
        return actions.join('');
    }
    
    setupEventListeners() {
        // Toggle copilot
        const toggleBtn = document.getElementById('toggle-copilot-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', async () => {
                try {
                    await chrome.runtime.sendMessage({ type: 'TOGGLE_COPILOT' });
                    setTimeout(() => this.init(), 500);
                } catch (error) {
                    console.error('Failed to toggle copilot:', error);
                }
            });
        }
        
        // Open n8n
        const openN8nBtn = document.getElementById('open-n8n-btn');
        if (openN8nBtn) {
            openN8nBtn.addEventListener('click', () => {
                chrome.tabs.create({ url: 'https://n8n.io' });
                window.close();
            });
        }
        
        // Refresh status
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.init();
            });
        }
        
        // Sign in
        const signInBtn = document.getElementById('sign-in-btn');
        if (signInBtn) {
            signInBtn.addEventListener('click', () => {
                chrome.tabs.create({ 
                    url: chrome.runtime.getURL('src/auth.html')
                });
                window.close();
            });
        }
        
        // Sign out
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                try {
                    await chrome.runtime.sendMessage({
                        type: 'SUPABASE_AUTH',
                        data: { session: null }
                    });
                    this.init();
                } catch (error) {
                    console.error('Failed to sign out:', error);
                }
            });
        }
        
        // Footer links
        document.getElementById('help-link').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://github.com/yourusername/n9n-extension/wiki' });
            window.close();
        });
        
        document.getElementById('settings-link').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: chrome.runtime.getURL('src/settings.html') });
            window.close();
        });
        
        document.getElementById('feedback-link').addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://github.com/yourusername/n9n-extension/issues' });
            window.close();
        });
    }
    
    renderError(error) {
        const content = document.getElementById('popup-content');
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #ef4444;">
                <div style="font-size: 24px; margin-bottom: 16px;">⚠️</div>
                <h3 style="margin-bottom: 8px;">Error</h3>
                <p style="font-size: 14px; color: #9ca3af;">${error.message || 'Unknown error occurred'}</p>
                <button class="action-btn" id="retry-btn" style="margin-top: 16px;">
                    Retry
                </button>
            </div>
        `;
        
        // Add event listener for retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                location.reload();
            });
        }
    }
    
    getDefaultAvatar() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxwYXRoIGQ9Im0xMiAxNmEzIDMgMCAwIDEtMy0zaDZhMyAzIDAgMCAxLTMgMyIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Im0xNSA5YTMgMyAwIDEgMS02IDAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
    }
}

// Initialize popup manager
new PopupManager(); 