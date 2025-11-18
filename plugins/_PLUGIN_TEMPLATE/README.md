# Plugin Template

Use this template to create your own Page Assist plugin!

## Quick Start

1. **Copy the template:**
   ```bash
   cp -r plugins/_PLUGIN_TEMPLATE plugins/my-plugin
   cd plugins/my-plugin
   ```

2. **Update package.json:**
   - Change `@page-assist/plugin-CHANGEME` to `@page-assist/plugin-my-plugin`
   - Update description
   - Update author

3. **Update src/index.ts:**
   - Change plugin ID: `id: 'CHANGEME'` → `id: 'my-plugin'`
   - Update name, description
   - Add your panels, API methods, events

4. **Create your panels:**
   - Edit `src/panels/MainPanel.tsx`
   - Or create new panel components

5. **Register in dashboard:**
   ```typescript
   // apps/dashboard/src/App.tsx
   import myPlugin from '@page-assist/plugin-my-plugin'

   await pluginManager.registerPlugin(myPlugin)
   ```

6. **Build and run:**
   ```bash
   pnpm build
   pnpm dashboard:dev
   ```

## What's Included

### Manifest
- Plugin metadata (id, name, version, description)
- Panels configuration
- Menu items
- API methods
- Events
- Settings schema
- Dependencies

### Lifecycle Hooks
- `initialize()` - Setup code
- `activate()` - When plugin starts
- `deactivate()` - When plugin stops
- `cleanup()` - Resource cleanup

### Context API
- `eventBus` - Event communication
- `getPluginAPI()` - Access other plugins
- `getSettings()` - Get plugin settings
- `updateSettings()` - Update settings
- `notify()` - Show notifications
- `navigate()` - Navigate routes
- `openPanel()` - Open panels
- `storage` - Persistent storage

### Example Panel
- React component with TypeScript
- Uses shared UI components
- Demonstrates API usage
- Shows event handling

## Documentation

See the main documentation:
- [UNIFIED_DASHBOARD.md](../../UNIFIED_DASHBOARD.md) - Complete guide
- [UNIFIED_DASHBOARD_ARCHITECTURE.md](../../UNIFIED_DASHBOARD_ARCHITECTURE.md) - Architecture

## Tips

1. Keep your plugin focused on one feature
2. Use events for loose coupling
3. Expose APIs for other plugins
4. Handle errors gracefully
5. Add TypeScript types
6. Test your plugin

## Example Plugins

Check out existing plugins for reference:
- `plugins/page-assist-plugin/` - AI chat
- `plugins/monitoring-plugin/` - Performance monitoring
