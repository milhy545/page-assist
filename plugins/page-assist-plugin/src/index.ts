/**
 * Page Assist Plugin for Unified Dashboard
 * Provides AI chat functionality
 */

import { createPlugin } from '@page-assist/plugin-system'
import type { PluginManifest } from '@page-assist/plugin-system'
import { MessageSquare, Settings, Sparkles } from 'lucide-react'
import { ChatPanel } from './panels/ChatPanel'
import { ModelsPanel } from './panels/ModelsPanel'

export const manifest: PluginManifest = {
  id: 'page-assist',
  name: 'Page Assist',
  version: '1.0.0',
  description: 'AI-powered chat assistant with support for multiple providers',
  author: {
    name: 'Page Assist Team',
  },

  panels: [
    {
      id: 'chat',
      title: 'AI Chat',
      description: 'Chat with AI models',
      icon: MessageSquare,
      component: ChatPanel,
      position: 'main',
      size: 'full',
      closable: true,
      shortcut: 'Ctrl+Shift+C',
    },
    {
      id: 'models',
      title: 'AI Models',
      description: 'Manage AI models and providers',
      icon: Sparkles,
      component: ModelsPanel,
      position: 'sidebar',
      size: 'medium',
      closable: true,
    },
  ],

  menuItems: [
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: MessageSquare,
      action: 'pageAssist.newChat',
      shortcut: 'Ctrl+N',
      mainMenu: true,
      toolbar: true,
      group: 'chat',
      order: 1,
    },
    {
      id: 'clear-history',
      label: 'Clear History',
      action: 'pageAssist.clearHistory',
      mainMenu: true,
      group: 'chat',
      order: 2,
    },
    {
      id: 'settings',
      label: 'AI Settings',
      icon: Settings,
      action: 'pageAssist.openSettings',
      shortcut: 'Ctrl+,',
      mainMenu: true,
      group: 'settings',
      order: 10,
    },
  ],

  api: {
    sendMessage: {
      description: 'Send a message to AI',
      params: {
        message: 'string',
        model: 'string (optional)',
      },
      returns: 'Promise<string>',
      handler: async (message: string, model?: string) => {
        // Implementation would interact with existing Page Assist logic
        console.log('Sending message:', message, 'to model:', model)
        return 'Response from AI'
      },
    },

    getModels: {
      description: 'Get available AI models',
      returns: 'Promise<Array<Model>>',
      handler: async () => {
        // Return available models
        return [
          { id: 'mercury-coder-mini', name: 'Mercury Coder Mini', provider: 'Mercury' },
          { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
          { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', provider: 'Groq' },
        ]
      },
    },

    getCurrentModel: {
      description: 'Get currently selected model',
      returns: 'Promise<Model>',
      handler: async () => {
        return { id: 'mercury-coder-mini', name: 'Mercury Coder Mini', provider: 'Mercury' }
      },
    },

    setModel: {
      description: 'Set active AI model',
      params: {
        modelId: 'string',
      },
      returns: 'Promise<void>',
      handler: async (modelId: string) => {
        console.log('Setting model to:', modelId)
      },
    },
  },

  events: {
    'message.sent': 'Emitted when user sends a message',
    'message.received': 'Emitted when AI responds',
    'model.changed': 'Emitted when active model changes',
    'chat.created': 'Emitted when new chat is created',
    'chat.cleared': 'Emitted when chat history is cleared',
  },

  subscribesTo: [
    'theme.changed',
    'settings.changed',
    'monitoring.cpu.high', // React to high CPU usage
    'monitoring.memory.high', // React to high memory usage
  ],

  permissions: ['storage', 'network'],

  settings: {
    schema: {
      defaultModel: {
        type: 'select',
        label: 'Default Model',
        description: 'The default AI model to use',
        options: [
          { label: 'Mercury Coder Mini', value: 'mercury-coder-mini' },
          { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
          { label: 'Llama 3.3 70B', value: 'llama-3.3-70b' },
        ],
      },
      temperature: {
        type: 'number',
        label: 'Temperature',
        description: 'Controls randomness in responses (0-1)',
        default: 0.7,
      },
      streaming: {
        type: 'boolean',
        label: 'Enable Streaming',
        description: 'Show responses as they are generated',
        default: true,
      },
      maxTokens: {
        type: 'number',
        label: 'Max Tokens',
        description: 'Maximum number of tokens to generate',
        default: 2048,
      },
    },
    defaults: {
      defaultModel: 'mercury-coder-mini',
      temperature: 0.7,
      streaming: true,
      maxTokens: 2048,
    },
  },
}

export default createPlugin(manifest, {
  async initialize(context) {
    console.log('[Page Assist Plugin] Initializing...')

    // Subscribe to monitoring events
    context.eventBus.on('monitoring.cpu.high', async (data: any) => {
      // Auto-suggest solutions when CPU is high
      console.log('[Page Assist] CPU usage high:', data.usage)
      context.notify(
        `CPU usage is high (${data.usage}%). Ask me for optimization tips!`,
        'warning'
      )
    })

    context.eventBus.on('monitoring.memory.high', async (data: any) => {
      console.log('[Page Assist] Memory usage high:', data.usage)
      context.notify(
        `Memory usage is high (${data.usage}MB). Need help optimizing?`,
        'warning'
      )
    })

    // Subscribe to theme changes
    context.eventBus.on('theme.changed', async (data: any) => {
      console.log('[Page Assist] Theme changed to:', data.theme)
    })
  },

  async activate() {
    console.log('[Page Assist Plugin] Activated')
  },

  async deactivate() {
    console.log('[Page Assist Plugin] Deactivated')
  },

  async cleanup() {
    console.log('[Page Assist Plugin] Cleaning up...')
  },
})
