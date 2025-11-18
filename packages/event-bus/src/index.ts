/**
 * Event Bus for Inter-Plugin Communication
 * Allows plugins to communicate without direct dependencies
 */

export type EventHandler<T = any> = (data: T) => void | Promise<void>

export interface EventSubscription {
  unsubscribe: () => void
}

export class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map()
  private debugMode: boolean = false

  constructor(debug: boolean = false) {
    this.debugMode = debug
  }

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(handler)

    if (this.debugMode) {
      console.log(`[EventBus] Subscribed to "${event}"`)
    }

    return {
      unsubscribe: () => this.off(event, handler),
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, handler: EventHandler<T>): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.listeners.delete(event)
      }

      if (this.debugMode) {
        console.log(`[EventBus] Unsubscribed from "${event}"`)
      }
    }
  }

  /**
   * Emit an event
   */
  async emit<T = any>(event: string, data?: T): Promise<void> {
    const handlers = this.listeners.get(event)

    if (!handlers || handlers.size === 0) {
      if (this.debugMode) {
        console.log(`[EventBus] No listeners for "${event}"`)
      }
      return
    }

    if (this.debugMode) {
      console.log(`[EventBus] Emitting "${event}" to ${handlers.size} listener(s)`, data)
    }

    // Execute all handlers
    const promises = Array.from(handlers).map(handler => {
      try {
        return Promise.resolve(handler(data))
      } catch (error) {
        console.error(`[EventBus] Error in handler for "${event}":`, error)
        return Promise.resolve()
      }
    })

    await Promise.all(promises)
  }

  /**
   * Subscribe to event once (auto-unsubscribes after first call)
   */
  once<T = any>(event: string, handler: EventHandler<T>): EventSubscription {
    const wrappedHandler: EventHandler<T> = async (data) => {
      await handler(data)
      this.off(event, wrappedHandler)
    }

    return this.on(event, wrappedHandler)
  }

  /**
   * Get all active event names
   */
  getEvents(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0
  }

  /**
   * Clear all listeners for an event (or all events if no event specified)
   */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event)
      if (this.debugMode) {
        console.log(`[EventBus] Cleared all listeners for "${event}"`)
      }
    } else {
      this.listeners.clear()
      if (this.debugMode) {
        console.log(`[EventBus] Cleared all listeners`)
      }
    }
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled
  }
}

// Global singleton instance
export const globalEventBus = new EventBus(
  process.env.NODE_ENV === 'development'
)

/**
 * Standard event names used across Page Assist ecosystem
 */
export const Events = {
  // Theme events
  THEME_CHANGED: 'theme.changed',

  // User events
  USER_AUTHENTICATED: 'user.authenticated',
  USER_LOGGED_OUT: 'user.loggedOut',

  // Message events
  MESSAGE_SENT: 'message.sent',
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_DELETED: 'message.deleted',

  // Chat events
  CHAT_CREATED: 'chat.created',
  CHAT_DELETED: 'chat.deleted',
  CHAT_CLEARED: 'chat.cleared',

  // Model events
  MODEL_CHANGED: 'model.changed',
  MODEL_LOADED: 'model.loaded',
  MODEL_ERROR: 'model.error',

  // Monitoring events
  MONITORING_CPU_HIGH: 'monitoring.cpu.high',
  MONITORING_MEMORY_HIGH: 'monitoring.memory.high',
  MONITORING_TASK_SLOW: 'monitoring.task.slow',
  MONITORING_ERROR: 'monitoring.error',

  // Settings events
  SETTINGS_CHANGED: 'settings.changed',
  SETTINGS_RESET: 'settings.reset',

  // Knowledge base events
  KB_DOCUMENT_ADDED: 'kb.document.added',
  KB_DOCUMENT_DELETED: 'kb.document.deleted',
  KB_SEARCH: 'kb.search',

  // Image generation events
  IMAGE_GENERATED: 'image.generated',
  IMAGE_GENERATION_ERROR: 'image.generation.error',

  // Navigation events
  NAVIGATE: 'navigation.navigate',
  PANEL_OPENED: 'panel.opened',
  PANEL_CLOSED: 'panel.closed',

  // Plugin events
  PLUGIN_LOADED: 'plugin.loaded',
  PLUGIN_UNLOADED: 'plugin.unloaded',
  PLUGIN_ERROR: 'plugin.error',
} as const

export type EventName = typeof Events[keyof typeof Events]

/**
 * Type-safe event data interfaces
 */
export interface EventData {
  [Events.THEME_CHANGED]: { theme: 'light' | 'dark' | 'system' }
  [Events.MESSAGE_SENT]: { content: string; chatId: string; messageId: string }
  [Events.MESSAGE_RECEIVED]: { content: string; chatId: string; messageId: string }
  [Events.MODEL_CHANGED]: { modelName: string; provider: string }
  [Events.MONITORING_CPU_HIGH]: { usage: number; process?: string }
  [Events.MONITORING_MEMORY_HIGH]: { usage: number; limit: number }
  [Events.MONITORING_TASK_SLOW]: { taskName: string; duration: number }
  [Events.SETTINGS_CHANGED]: { key: string; value: any }
  [Events.KB_DOCUMENT_ADDED]: { id: string; title: string; size: number }
  [Events.IMAGE_GENERATED]: { url: string; prompt: string; provider: string }
  [Events.NAVIGATE]: { path: string; params?: Record<string, any> }
  [Events.PANEL_OPENED]: { panelId: string; pluginId: string }
  [Events.PLUGIN_LOADED]: { pluginId: string; version: string }
}

/**
 * Type-safe event emitter
 */
export function createTypedEventBus() {
  const bus = new EventBus(process.env.NODE_ENV === 'development')

  return {
    on: <K extends keyof EventData>(
      event: K,
      handler: EventHandler<EventData[K]>
    ): EventSubscription => bus.on(event, handler),

    emit: <K extends keyof EventData>(
      event: K,
      data: EventData[K]
    ): Promise<void> => bus.emit(event, data),

    once: <K extends keyof EventData>(
      event: K,
      handler: EventHandler<EventData[K]>
    ): EventSubscription => bus.once(event, handler),

    off: <K extends keyof EventData>(
      event: K,
      handler: EventHandler<EventData[K]>
    ): void => bus.off(event, handler),

    // Pass through other methods
    getEvents: () => bus.getEvents(),
    listenerCount: (event: string) => bus.listenerCount(event),
    clear: (event?: string) => bus.clear(event),
    setDebugMode: (enabled: boolean) => bus.setDebugMode(enabled),
  }
}

export default globalEventBus
