# n9n Copilot Extension - Development Guide

## Quick Start

### 1. Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked" and select the `extension/n9n-extension` folder
4. The extension should appear in your extensions list

### 2. Test the Extension
1. Go to your n8n instance (e.g., `http://100.78.164.43:5678`)
2. Open DevTools (F12) and check the console
3. You should see initialization messages from the extension

### 3. If You Get "Extension Context Invalidated" Errors

This is a common Chrome extension issue. Here's how to fix it:

#### Option A: Reload the Extension
1. Go to `chrome://extensions/`
2. Find "n9n AI Copilot" 
3. Click the refresh icon 🔄
4. Refresh your n8n page

#### Option B: Use the Reload Script
1. Open DevTools Console (F12)
2. Paste and run the reload script:
```javascript
// Copy and paste this into the console:
localStorage.clear();
if (window.authManager) window.authManager.currentUser = null;
if (window.chatManager) window.chatManager.currentConversation = null;
window.location.reload();
```

### 4. Test Authentication
1. Click the extension icon in your browser toolbar
2. Try "Continue with Google" 
3. Check the console for any errors

## Current Status

✅ **Working:**
- Extension loads and initializes
- Real Supabase client (no more mock data)
- Proper error handling for extension context invalidation
- Session management with fallbacks

🔄 **In Progress:**
- Google OAuth integration
- Database operations (conversations, workflows, API keys)

## Troubleshooting

### Common Issues

1. **"Extension context invalidated"**
   - Solution: Reload the extension from `chrome://extensions/`

2. **"Failed to fetch" errors**
   - Check your internet connection
   - Verify Supabase URL and keys are correct

3. **Authentication not working**
   - Clear browser cache and cookies
   - Try the reload script above

### Debug Mode

To enable debug logging, add this to the console:
```javascript
localStorage.setItem('n9n_debug', 'true');
window.location.reload();
```

## File Structure

```
extension/n9n-extension/
├── manifest.json              # Extension configuration
├── src/utils/supabase.js      # Real Supabase client
├── modules/
│   ├── AuthManager.js         # Authentication handling
│   ├── ChatManager.js         # Chat functionality
│   └── WorkflowDetector.js    # Workflow detection
├── auth-callback.html         # OAuth callback page
└── reload-extension.js        # Development helper
```

## Next Steps

1. **Test the extension** on your n8n instance
2. **Check the console** for any errors
3. **Try authentication** - click "Continue with Google"
4. **Report any issues** with specific error messages

The extension should now work with real Supabase integration instead of mock data! 