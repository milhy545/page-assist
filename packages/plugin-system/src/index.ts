/**
 * Plugin System for Page Assist Unified Dashboard
 * Allows independent projects to work together as plugins
 */

import type { EventBus, EventHandler } from '@page-assist/event-bus'
import type { ComponentType, ReactNode } from 'react'

/**
 * Plugin Manifest - Describes what a plugin provides
 */
export interface PluginManifest {
  /** Unique plugin identifier */
  id: string

  /** Display name */
  name: string

  /** Semantic version */
  version: string

  /** Short description */
  description: string

  /** Author information */
  author?: {
    name: string
    email?: string
    url?: string
  }

  /** Plugin icon (React component or URL) */
  icon?: ComponentType | string

  /** UI panels this plugin provides */
  panels?: PluginPanel[]

  /** Menu items this plugin adds */
  menuItems?: PluginMenuItem[]

  /** API methods this plugin exposes */
  api?: Record<string, PluginAPIMethod>

  /** Events this plugin emits */
  events?: Record<string, string>

  /** Events this plugin subscribes to */
  subscribesTo?: string[]

  /** Required permissions */
  permissions?: PluginPermission[]

  /** Settings schema */
  settings?: PluginSettings

  /** Dependencies on other plugins */
  dependencies?: string[]

  /** Optional dependencies */
  optionalDependencies?: string[]
}

/**
 * Plugin Panel - A UI component shown in dashboard
 */
export interface PluginPanel {
  /** Panel unique ID */
  id: string

  /** Panel title */
  title: string

  /** Panel description */
  description?: string

  /** Icon for panel */
  icon?: ComponentType | string

  /** React component to render */
  component: ComponentType<PluginPanelProps>

  /** Default position */
  position?: 'sidebar' | 'main' | 'floating' | 'modal'

  /** Default size */
  size?: 'small' | 'medium' | 'large' | 'full'

  /** Can panel be closed? */
  closable?: boolean

  /** Can panel be resized? */
  resizable?: boolean

  /** Can panel be moved? */
  draggable?: boolean

  /** Keyboard shortcut to open */
  shortcut?: string
}

/**
 * Plugin Panel Props passed to panel components
 */
export interface PluginPanelProps {
  /** Plugin context */
  plugin: Plugin

  /** Panel configuration */
  panel: PluginPanel

  /** Close panel callback */
  onClose?: () => void

  /** Resize panel callback */
  onResize?: (width: number, height: number) => void

  /** Custom props */
  [key: string]: any
}

/**
 * Plugin Menu Item - Action in menus
 */
export interface PluginMenuItem {
  /** Item unique ID */
  id: string

  /** Display label */
  label: string

  /** Icon */
  icon?: ComponentType | string

  /** Action to execute */
  action: string | (() => void | Promise<void>)

  /** Keyboard shortcut */
  shortcut?: string

  /** Show in context menu? */
  contextMenu?: boolean

  /** Show in main menu? */
  mainMenu?: boolean

  /** Show in toolbar? */
  toolbar?: boolean

  /** Menu group */
  group?: string

  /** Sort order */
  order?: number

  /** Is enabled? */
  enabled?: boolean | (() => boolean)

  /** Is visible? */
  visible?: boolean | (() => boolean)
}

/**
 * Plugin API Method
 */
export interface PluginAPIMethod {
  /** Method description */
  description: string

  /** Parameters schema */
  params?: Record<string, any>

  /** Return type description */
  returns?: string

  /** Method implementation */
  handler: (...args: any[]) => any | Promise<any>
}

/**
 * Plugin Permission
 */
export type PluginPermission =
  | 'storage'
  | 'network'
  | 'notifications'
  | 'clipboard'
  | 'filesystem'
  | 'camera'
  | 'microphone'
  | 'location'
  | 'system'

/**
 * Plugin Settings
 */
export interface PluginSettings {
  /** Settings schema */
  schema: Record<string, PluginSettingField>

  /** Default values */
  defaults: Record<string, any>
}

/**
 * Plugin Setting Field
 */
export interface PluginSettingField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json'
  label: string
  description?: string
  default?: any
  options?: Array<{ label: string; value: any }>
  required?: boolean
  validation?: (value: any) => boolean | string
}

/**
 * Plugin Context - Provided to plugin at runtime
 */
export interface PluginContext {
  /** Event bus for communication */
  eventBus: EventBus

  /** Get another plugin's API */
  getPluginAPI: <T = any>(pluginId: string) => T | undefined

  /** Check if plugin is loaded */
  isPluginLoaded: (pluginId: string) => boolean

  /** Get plugin settings */
  getSettings: <T = any>() => T

  /** Update plugin settings */
  updateSettings: (settings: Record<string, any>) => Promise<void>

  /** Navigate to route */
  navigate: (path: string, params?: Record<string, any>) => void

  /** Show notification */
  notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void

  /** Open panel */
  openPanel: (panelId: string) => void

  /** Close panel */
  closePanel: (panelId: string) => void

  /** Execute menu action */
  executeAction: (actionId: string, ...args: any[]) => Promise<void>

  /** Storage API */
  storage: {
    get: <T = any>(key: string) => Promise<T | undefined>
    set: (key: string, value: any) => Promise<void>
    delete: (key: string) => Promise<void>
    clear: () => Promise<void>
  }
}

/**
 * Plugin Instance
 */
export interface Plugin {
  /** Plugin manifest */
  manifest: PluginManifest

  /** Plugin context */
  context: PluginContext

  /** Plugin initialization */
  initialize?: (context: PluginContext) => void | Promise<void>

  /** Plugin activation */
  activate?: () => void | Promise<void>

  /** Plugin deactivation */
  deactivate?: () => void | Promise<void>

  /** Plugin cleanup */
  cleanup?: () => void | Promise<void>
}

/**
 * Plugin Manager - Manages all plugins
 */
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private eventBus: EventBus
  private storage: Map<string, Map<string, any>> = new Map()

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  /**
   * Register a plugin
   */
  async registerPlugin(plugin: Plugin): Promise<void> {
    const { id, name, version } = plugin.manifest

    // Check if already registered
    if (this.plugins.has(id)) {
      throw new Error(`Plugin "${id}" is already registered`)
    }

    // Check dependencies
    if (plugin.manifest.dependencies) {
      for (const depId of plugin.manifest.dependencies) {
        if (!this.plugins.has(depId)) {
          throw new Error(
            `Plugin "${id}" requires plugin "${depId}" which is not loaded`
          )
        }
      }
    }

    // Create context
    const context: PluginContext = {
      eventBus: this.eventBus,
      getPluginAPI: (pluginId) => this.getPluginAPI(pluginId),
      isPluginLoaded: (pluginId) => this.plugins.has(pluginId),
      getSettings: () => this.getPluginSettings(id),
      updateSettings: (settings) => this.updatePluginSettings(id, settings),
      navigate: (path, params) => this.navigate(path, params),
      notify: (message, type) => this.notify(message, type),
      openPanel: (panelId) => this.openPanel(id, panelId),
      closePanel: (panelId) => this.closePanel(id, panelId),
      executeAction: (actionId, ...args) => this.executeAction(id, actionId, ...args),
      storage: {
        get: (key) => this.getStorage(id, key),
        set: (key, value) => this.setStorage(id, key, value),
        delete: (key) => this.deleteStorage(id, key),
        clear: () => this.clearStorage(id),
      },
    }

    plugin.context = context

    // Initialize
    if (plugin.initialize) {
      await plugin.initialize(context)
    }

    // Register
    this.plugins.set(id, plugin)

    // Subscribe to events
    if (plugin.manifest.subscribesTo) {
      for (const eventName of plugin.manifest.subscribesTo) {
        // Plugins handle their own subscriptions
        // We just notify that plugin is ready
      }
    }

    // Emit plugin loaded event
    await this.eventBus.emit('plugin.loaded', { pluginId: id, version })

    console.log(`[PluginManager] Loaded plugin: ${name} v${version}`)
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    // Cleanup
    if (plugin.cleanup) {
      await plugin.cleanup()
    }

    // Remove
    this.plugins.delete(pluginId)

    // Clear storage
    this.storage.delete(pluginId)

    // Emit event
    await this.eventBus.emit('plugin.unloaded', { pluginId })

    console.log(`[PluginManager] Unloaded plugin: ${pluginId}`)
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get plugin API
   */
  getPluginAPI<T = any>(pluginId: string): T | undefined {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || !plugin.manifest.api) return undefined

    const api: any = {}

    for (const [methodName, method] of Object.entries(plugin.manifest.api)) {
      api[methodName] = (...args: any[]) => method.handler(...args)
    }

    return api as T
  }

  /**
   * Get all panels from all plugins
   */
  getAllPanels(): Array<{ plugin: Plugin; panel: PluginPanel }> {
    const panels: Array<{ plugin: Plugin; panel: PluginPanel }> = []

    for (const plugin of this.plugins.values()) {
      if (plugin.manifest.panels) {
        for (const panel of plugin.manifest.panels) {
          panels.push({ plugin, panel })
        }
      }
    }

    return panels
  }

  /**
   * Get all menu items from all plugins
   */
  getAllMenuItems(): Array<{ plugin: Plugin; menuItem: PluginMenuItem }> {
    const items: Array<{ plugin: Plugin; menuItem: PluginMenuItem }> = []

    for (const plugin of this.plugins.values()) {
      if (plugin.manifest.menuItems) {
        for (const menuItem of plugin.manifest.menuItems) {
          items.push({ plugin, menuItem })
        }
      }
    }

    return items
  }

  /**
   * Storage methods
   */
  private async getStorage(pluginId: string, key: string): Promise<any> {
    return this.storage.get(pluginId)?.get(key)
  }

  private async setStorage(pluginId: string, key: string, value: any): Promise<void> {
    if (!this.storage.has(pluginId)) {
      this.storage.set(pluginId, new Map())
    }
    this.storage.get(pluginId)!.set(key, value)
  }

  private async deleteStorage(pluginId: string, key: string): Promise<void> {
    this.storage.get(pluginId)?.delete(key)
  }

  private async clearStorage(pluginId: string): Promise<void> {
    this.storage.get(pluginId)?.clear()
  }

  /**
   * Get plugin settings
   */
  private getPluginSettings(pluginId: string): any {
    const plugin = this.plugins.get(pluginId)
    if (!plugin?.manifest.settings) return {}

    // Return defaults merged with stored settings
    const stored = this.storage.get(pluginId)?.get('__settings') || {}
    return { ...plugin.manifest.settings.defaults, ...stored }
  }

  /**
   * Update plugin settings
   */
  private async updatePluginSettings(
    pluginId: string,
    settings: Record<string, any>
  ): Promise<void> {
    await this.setStorage(pluginId, '__settings', settings)
    await this.eventBus.emit('settings.changed', { pluginId, settings })
  }

  /**
   * Navigate
   */
  private navigate(path: string, params?: Record<string, any>): void {
    this.eventBus.emit('navigation.navigate', { path, params })
  }

  /**
   * Notify
   */
  private notify(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): void {
    this.eventBus.emit('notification.show', { message, type })
  }

  /**
   * Open panel
   */
  private openPanel(pluginId: string, panelId: string): void {
    this.eventBus.emit('panel.opened', { pluginId, panelId })
  }

  /**
   * Close panel
   */
  private closePanel(pluginId: string, panelId: string): void {
    this.eventBus.emit('panel.closed', { pluginId, panelId })
  }

  /**
   * Execute action
   */
  private async executeAction(
    pluginId: string,
    actionId: string,
    ...args: any[]
  ): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin?.manifest.menuItems) return

    const menuItem = plugin.manifest.menuItems.find((item) => item.id === actionId)
    if (!menuItem) return

    if (typeof menuItem.action === 'function') {
      await menuItem.action()
    }
  }
}

/**
 * Create plugin helper
 */
export function createPlugin(
  manifest: PluginManifest,
  hooks?: {
    initialize?: (context: PluginContext) => void | Promise<void>
    activate?: () => void | Promise<void>
    deactivate?: () => void | Promise<void>
    cleanup?: () => void | Promise<void>
  }
): Plugin {
  return {
    manifest,
    context: null as any, // Will be set by PluginManager
    ...hooks,
  }
}

export type { EventBus, EventHandler } from '@page-assist/event-bus'
