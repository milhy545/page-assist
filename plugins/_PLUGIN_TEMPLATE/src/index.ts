/**
 * CHANGEME Plugin Template
 *
 * Instructions:
 * 1. Copy this folder to plugins/your-plugin-name/
 * 2. Update package.json (name, description)
 * 3. Update manifest below
 * 4. Create your panel components
 * 5. Add to dashboard: import yourPlugin from '@page-assist/plugin-your-name'
 */

import { createPlugin } from '@page-assist/plugin-system'
import type { PluginManifest } from '@page-assist/plugin-system'
import { Sparkles } from 'lucide-react' // Choose your icon
import { MainPanel } from './panels/MainPanel'

export const manifest: PluginManifest = {
  // REQUIRED: Unique ID (lowercase, no spaces)
  id: 'CHANGEME',

  // REQUIRED: Display name
  name: 'CHANGEME Plugin',

  // REQUIRED: Semantic version
  version: '1.0.0',

  // REQUIRED: Short description
  description: 'Description of what your plugin does',

  // OPTIONAL: Author information
  author: {
    name: 'Your Name',
    email: 'your@email.com',
    url: 'https://your-website.com',
  },

  // REQUIRED: UI panels your plugin provides
  panels: [
    {
      id: 'main',
      title: 'Main Panel',
      description: 'Main panel of your plugin',
      icon: Sparkles, // lucide-react icon
      component: MainPanel, // Your React component
      position: 'main', // 'sidebar' | 'main' | 'floating' | 'modal'
      size: 'full', // 'small' | 'medium' | 'large' | 'full'
      closable: true,
      resizable: true,
      draggable: false,
      shortcut: 'Ctrl+Shift+Y', // Optional keyboard shortcut
    },
  ],

  // OPTIONAL: Menu items
  menuItems: [
    {
      id: 'action-1',
      label: 'Do Something',
      icon: Sparkles,
      action: 'yourplugin.doSomething',
      shortcut: 'Ctrl+K',
      mainMenu: true,
      toolbar: false,
      group: 'your-plugin',
      order: 1,
      enabled: true,
      visible: true,
    },
  ],

  // OPTIONAL: API methods exposed to other plugins
  api: {
    doSomething: {
      description: 'Does something useful',
      params: {
        param1: 'string',
        param2: 'number (optional)',
      },
      returns: 'Promise<string>',
      handler: async (param1: string, param2?: number) => {
        console.log('Doing something:', param1, param2)
        return `Result: ${param1}`
      },
    },

    getData: {
      description: 'Gets some data',
      returns: 'Promise<any>',
      handler: async () => {
        return { data: 'example' }
      },
    },
  },

  // OPTIONAL: Events your plugin emits
  events: {
    'yourplugin.action.completed': 'Emitted when action is completed',
    'yourplugin.data.changed': 'Emitted when data changes',
  },

  // OPTIONAL: Events your plugin listens to
  subscribesTo: [
    'theme.changed',
    'settings.changed',
    'monitoring.cpu.high',
  ],

  // OPTIONAL: Required permissions
  permissions: ['storage', 'network'],

  // OPTIONAL: Settings schema
  settings: {
    schema: {
      enabled: {
        type: 'boolean',
        label: 'Enable Plugin',
        description: 'Turn the plugin on or off',
        default: true,
      },
      apiKey: {
        type: 'string',
        label: 'API Key',
        description: 'Your API key',
        required: false,
      },
      threshold: {
        type: 'number',
        label: 'Threshold',
        description: 'Alert threshold',
        default: 80,
      },
      mode: {
        type: 'select',
        label: 'Mode',
        description: 'Operating mode',
        options: [
          { label: 'Mode 1', value: 'mode1' },
          { label: 'Mode 2', value: 'mode2' },
        ],
        default: 'mode1',
      },
    },
    defaults: {
      enabled: true,
      threshold: 80,
      mode: 'mode1',
    },
  },

  // OPTIONAL: Plugin dependencies
  dependencies: [], // e.g., ['page-assist']
  optionalDependencies: [], // e.g., ['monitoring']
}

export default createPlugin(manifest, {
  // Called when plugin is registered
  async initialize(context) {
    console.log('[CHANGEME Plugin] Initializing...')

    // Subscribe to events
    context.eventBus.on('theme.changed', (data: any) => {
      console.log('Theme changed:', data.theme)
    })

    context.eventBus.on('monitoring.cpu.high', async (data: any) => {
      console.log('CPU high:', data.usage)
      context.notify(`CPU usage: ${data.usage}%`, 'warning')
    })

    // Get settings
    const settings = context.getSettings()
    console.log('Settings:', settings)

    // Get other plugin's API
    const pageAssistAPI = context.getPluginAPI<{
      sendMessage: (msg: string) => Promise<string>
    }>('page-assist')

    if (pageAssistAPI) {
      // Use other plugin's API
      // const response = await pageAssistAPI.sendMessage('Hello!')
    }
  },

  // Called when plugin is activated
  async activate() {
    console.log('[CHANGEME Plugin] Activated')

    // Emit event
    await this.context?.eventBus.emit('yourplugin.action.completed', {
      action: 'activate',
      timestamp: Date.now(),
    })
  },

  // Called when plugin is deactivated
  async deactivate() {
    console.log('[CHANGEME Plugin] Deactivated')
  },

  // Called when plugin is unregistered
  async cleanup() {
    console.log('[CHANGEME Plugin] Cleaning up...')

    // Clean up resources
    // Remove event listeners
    // Clear timers
    // etc.
  },
})
