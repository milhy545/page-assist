/**
 * Monitoring Plugin for Unified Dashboard
 * Provides system performance monitoring
 */

import { createPlugin } from '@page-assist/plugin-system'
import type { PluginManifest } from '@page-assist/plugin-system'
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react'
import { MonitoringPanel } from './panels/MonitoringPanel'

export const manifest: PluginManifest = {
  id: 'monitoring',
  name: 'Performance Monitor',
  version: '1.0.0',
  description: 'Real-time performance monitoring for CPU, memory, and tasks',
  author: {
    name: 'Page Assist Team',
  },

  panels: [
    {
      id: 'performance',
      title: 'Performance',
      description: 'Monitor system performance',
      icon: Activity,
      component: MonitoringPanel,
      position: 'sidebar',
      size: 'medium',
      closable: true,
      shortcut: 'Ctrl+Shift+P',
    },
  ],

  menuItems: [
    {
      id: 'track-memory',
      label: 'Track Memory Usage',
      icon: HardDrive,
      action: 'monitoring.trackMemory',
      mainMenu: true,
      group: 'monitoring',
      order: 1,
    },
    {
      id: 'observe-tasks',
      label: 'Observe Long Tasks',
      icon: Zap,
      action: 'monitoring.observeTasks',
      mainMenu: true,
      group: 'monitoring',
      order: 2,
    },
    {
      id: 'clear-metrics',
      label: 'Clear Metrics',
      action: 'monitoring.clearMetrics',
      mainMenu: true,
      group: 'monitoring',
      order: 3,
    },
  ],

  api: {
    getCPUUsage: {
      description: 'Get current CPU usage estimate',
      returns: 'Promise<number>',
      handler: async () => {
        // Simplified CPU estimation based on task duration
        return Math.random() * 100 // Mock value
      },
    },

    getMemoryUsage: {
      description: 'Get current memory usage',
      returns: 'Promise<{ used: number; total: number; limit: number }>',
      handler: async () => {
        if (typeof performance === 'undefined' || !(performance as any).memory) {
          return { used: 0, total: 0, limit: 0 }
        }

        const memory = (performance as any).memory
        return {
          used: memory.usedJSHeapSize / 1024 / 1024, // MB
          total: memory.totalJSHeapSize / 1024 / 1024, // MB
          limit: memory.jsHeapSizeLimit / 1024 / 1024, // MB
        }
      },
    },

    getLongTasks: {
      description: 'Get recent long tasks (>50ms)',
      returns: 'Promise<Array<{ name: string; duration: number }>>',
      handler: async () => {
        // Would integrate with existing performance.ts
        return []
      },
    },

    measurePerformance: {
      description: 'Measure function execution time',
      params: {
        fn: 'function',
        label: 'string',
      },
      returns: 'Promise<{ result: any; duration: number }>',
      handler: async (fn: () => any, label: string = 'Operation') => {
        const start = performance.now()
        const result = await fn()
        const duration = performance.now() - start

        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)

        return { result, duration }
      },
    },
  },

  events: {
    'monitoring.cpu.high': 'Emitted when CPU usage exceeds threshold',
    'monitoring.memory.high': 'Emitted when memory usage exceeds threshold',
    'monitoring.task.slow': 'Emitted when a task takes longer than threshold',
    'monitoring.error': 'Emitted when monitoring error occurs',
  },

  subscribesTo: ['theme.changed', 'settings.changed'],

  permissions: ['system'],

  settings: {
    schema: {
      cpuThreshold: {
        type: 'number',
        label: 'CPU Warning Threshold',
        description: 'Alert when CPU usage exceeds this percentage',
        default: 80,
      },
      memoryThreshold: {
        type: 'number',
        label: 'Memory Warning Threshold (MB)',
        description: 'Alert when memory usage exceeds this value',
        default: 1000,
      },
      taskThreshold: {
        type: 'number',
        label: 'Long Task Threshold (ms)',
        description: 'Consider tasks longer than this as slow',
        default: 50,
      },
      enableAutoMonitoring: {
        type: 'boolean',
        label: 'Enable Automatic Monitoring',
        description: 'Automatically monitor performance in background',
        default: true,
      },
    },
    defaults: {
      cpuThreshold: 80,
      memoryThreshold: 1000,
      taskThreshold: 50,
      enableAutoMonitoring: true,
    },
  },
}

let monitoringInterval: NodeJS.Timeout | null = null

export default createPlugin(manifest, {
  async initialize(context) {
    console.log('[Monitoring Plugin] Initializing...')

    const settings = context.getSettings()

    if (settings.enableAutoMonitoring) {
      startMonitoring(context)
    }

    // Subscribe to settings changes
    context.eventBus.on('settings.changed', async (data: any) => {
      if (data.pluginId === 'monitoring') {
        const newSettings = context.getSettings()
        if (newSettings.enableAutoMonitoring && !monitoringInterval) {
          startMonitoring(context)
        } else if (!newSettings.enableAutoMonitoring && monitoringInterval) {
          stopMonitoring()
        }
      }
    })
  },

  async activate() {
    console.log('[Monitoring Plugin] Activated')
  },

  async deactivate() {
    console.log('[Monitoring Plugin] Deactivated')
    stopMonitoring()
  },

  async cleanup() {
    console.log('[Monitoring Plugin] Cleaning up...')
    stopMonitoring()
  },
})

function startMonitoring(context: any) {
  const settings = context.getSettings()

  monitoringInterval = setInterval(async () => {
    // Check memory
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100

      if (usedMB > settings.memoryThreshold || usagePercent > settings.cpuThreshold) {
        await context.eventBus.emit('monitoring.memory.high', {
          usage: usedMB,
          limit: limitMB,
        })
      }
    }

    // Mock CPU check (would be more sophisticated in real implementation)
    const cpuUsage = Math.random() * 100
    if (cpuUsage > settings.cpuThreshold) {
      await context.eventBus.emit('monitoring.cpu.high', {
        usage: cpuUsage,
      })
    }
  }, 30000) // Check every 30 seconds

  console.log('[Monitoring] Started automatic monitoring')
}

function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
    console.log('[Monitoring] Stopped automatic monitoring')
  }
}
