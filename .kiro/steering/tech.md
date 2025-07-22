# Technology Stack

## Extension Architecture

**Chrome Extension (Manifest V3)** - Modern service worker-based extension architecture

### Core Technologies
- **JavaScript (ES6+)** - Primary language for all components
- **Chrome Extension APIs** - Runtime messaging, storage, tabs, scripting
- **HTML5/CSS3** - UI components and styling
- **Supabase** - Backend database and authentication

### Key Libraries & Services
- **Supabase REST API** - Chat persistence and user management
- **Chrome Storage API** - Local data caching and settings
- **Fetch API** - HTTP requests to external services

## Project Structure

```
├── manifest.json          # Extension configuration
├── background.js          # Service worker (background script)
├── content-script-consolidated.js  # Main content script
├── content-styles.css     # Injected styles
├── modules/               # Shared JavaScript modules
│   ├── ChatManager.js     # Chat and conversation management
│   ├── UIManager.js       # UI creation and event handling
│   ├── Utils.js           # Utility functions
│   └── WorkflowManager.js # n8n workflow operations
├── components/            # UI components
│   ├── popup/             # Extension popup
│   └── panel/             # Chat panel components
└── src/                   # Source files
    ├── services/          # Service layer
    ├── components/        # Reusable components
    └── styles/            # CSS stylesheets
```

## Build System

**No build system required** - Pure JavaScript implementation that runs directly in the browser.

### Development Commands
- **Load Extension**: Chrome → Extensions → Developer mode → Load unpacked
- **Reload Extension**: Click reload button in Chrome extensions page
- **Debug**: Use Chrome DevTools for content scripts and popup debugging
- **Background Debug**: chrome://extensions → Inspect views: service worker

### Testing
- **Manual Testing**: Load extension and test on n8n instances
- **Console Logging**: Extensive console.log statements for debugging
- **Chrome DevTools**: Network tab for API calls, Console for errors

## Deployment

1. **Package Extension**: Zip the entire project directory
2. **Chrome Web Store**: Upload via Chrome Developer Dashboard
3. **Version Management**: Update version in manifest.json

## Environment Configuration

### Required Permissions
- `activeTab` - Access to current tab
- `storage` - Local data persistence  
- `identity` - Authentication flows
- `scripting` - Dynamic script injection

### Host Permissions
- `*://*.n8n.cloud/*` - n8n cloud instances
- `*://localhost:*/*` - Local development
- `*://127.0.0.1:*/*` - Local IP
- `*://*.supabase.co/*` - Backend API access