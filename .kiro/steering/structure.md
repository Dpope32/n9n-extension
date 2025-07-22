# Project Structure & Organization

## File Organization Principles

### Root Level Files
- **manifest.json** - Extension configuration and permissions
- **background.js** - Service worker for extension lifecycle management
- **content-script-consolidated.js** - Main content script injected into n8n pages
- **content-styles.css** - CSS styles injected alongside content script

### Module Architecture (`/modules/`)
Shared JavaScript classes that provide core functionality:

- **ChatManager.js** - Handles chat persistence, Supabase integration, conversation management
- **UIManager.js** - Creates and manages the floating sidebar UI, event handling
- **Utils.js** - Utility functions for time formatting, clipboard operations, n8n detection
- **WorkflowManager.js** - n8n workflow operations and JSON generation
- **APIManager.js** - External API integrations and AI model communication

### Component Structure (`/components/`)
- **popup/** - Extension popup interface (shown when clicking extension icon)
- **panel/** - Chat panel components for the floating sidebar

### Source Files (`/src/`)
- **popup.js** - Popup window logic and status management
- **sidebar.html** - Standalone sidebar HTML template
- **welcome.html** - Welcome/onboarding page
- **services/** - Service layer abstractions
- **components/** - Reusable UI components
- **styles/** - CSS stylesheets organized by component
- **types/** - Type definitions and interfaces
- **utils/** - Additional utility functions

### Assets (`/assets/`)
- **void.png** - Placeholder/fallback images

## Code Organization Patterns

### Module Pattern
- Each module is a self-contained class exported to `window` object
- Dependencies are clearly documented at the top of each file
- Modules communicate through well-defined interfaces

### Event-Driven Architecture
- UI events handled through addEventListener patterns
- Chrome extension messaging for cross-context communication
- Async/await for all asynchronous operations

### Error Handling
- Try-catch blocks around all async operations
- Graceful fallbacks (localStorage when Supabase fails)
- Extensive console logging for debugging

### Naming Conventions
- **Classes**: PascalCase (e.g., `ChatManager`, `UIManager`)
- **Functions**: camelCase (e.g., `addMessage`, `toggleSidebar`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SUPABASE_URL`)
- **CSS Classes**: kebab-case (e.g., `chat-input`, `sidebar-container`)
- **IDs**: kebab-case (e.g., `messages-container`, `send-btn`)

## File Dependencies

### Content Script Load Order
1. `modules/Utils.js` - Base utilities
2. `modules/ChatManager.js` - Chat functionality
3. `modules/UIManager.js` - UI management
4. `src/services/ChatService.js` - Service layer
5. `src/services/UIService.js` - UI service layer
6. `content-script-consolidated.js` - Main orchestrator

### Global Objects
- `window.Utils` - Utility functions
- `window.ChatManager` - Chat management class
- `window.UIManager` - UI management class
- `window.n9nCopilot` - Main copilot instance

## Development Guidelines

### Adding New Features
1. Create module in `/modules/` if it's core functionality
2. Create component in `/src/components/` if it's UI-focused
3. Update content script load order in manifest.json if needed
4. Follow existing error handling and logging patterns

### Styling Approach
- Inline styles for dynamic/programmatic styling
- CSS files for static component styles
- Dark theme with consistent color palette
- Responsive design for different screen sizes