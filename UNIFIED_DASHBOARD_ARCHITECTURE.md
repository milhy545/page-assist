# Unified Dashboard Architecture
## Integrace všech projektů do jednoho panelu

---

## 🎯 Cíl

Vytvořit **univerzální dashboard/panel**, který:
- ✅ Spojuje všechny tvoje projekty (monitoring tools, menu, panely)
- ✅ Každý projekt funguje samostatně
- ✅ Projekty spolu komunikují a sdílejí data
- ✅ Modulární plugin architektura
- ✅ Jednotné UI/UX
- ✅ Easy to extend (přidání nového projektu = přidání pluginu)

---

## 🏗️ Architektura

### **Hlavní koncepty**

```
┌─────────────────────────────────────────────────────────────┐
│                    UNIFIED DASHBOARD                         │
│                  (Hlavní aplikace)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Plugin 1 │  │ Plugin 2 │  │ Plugin 3 │  │ Plugin N │   │
│  │ (PageA.) │  │(Monitor.)│  │  (Menu)  │  │  (...)   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
├───────┴─────────────┴──────────────┴─────────────┴─────────┤
│              SHARED CORE (Event Bus, API, State)            │
├─────────────────────────────────────────────────────────────┤
│              SHARED UI (Components, Themes)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Monorepo Struktura

```
unified-dashboard/
├── apps/
│   ├── dashboard/              # Hlavní unified dashboard
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── PluginManager.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   ├── web/                    # Webová verze
│   └── desktop/                # Desktop verze (Tauri)
│
├── plugins/
│   ├── page-assist/            # Page Assist plugin
│   │   ├── src/
│   │   │   ├── index.tsx       # Plugin entry point
│   │   │   ├── PageAssistPanel.tsx
│   │   │   ├── manifest.ts     # Plugin metadata
│   │   │   └── api.ts          # Plugin API
│   │   └── package.json
│   │
│   ├── monitoring-tool/        # Monitoring plugin
│   │   ├── src/
│   │   │   ├── index.tsx
│   │   │   ├── MonitoringPanel.tsx
│   │   │   ├── charts/
│   │   │   └── manifest.ts
│   │   └── package.json
│   │
│   ├── menu-panel/             # Menu plugin
│   │   ├── src/
│   │   │   ├── index.tsx
│   │   │   ├── MenuPanel.tsx
│   │   │   └── manifest.ts
│   │   └── package.json
│   │
│   └── [další-projekty]/       # Další pluginy...
│
├── packages/
│   ├── shared-ui/              # Sdílené komponenty
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   ├── Card/
│   │   │   │   ├── Chart/
│   │   │   │   ├── Panel/
│   │   │   │   └── ...
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared-core/            # Sdílená logika
│   │   ├── src/
│   │   │   ├── event-bus/      # Inter-plugin komunikace
│   │   │   ├── plugin-api/     # Plugin API
│   │   │   ├── storage/        # Shared storage
│   │   │   ├── utils/
│   │   │   └── types/
│   │   └── package.json
│   │
│   ├── shared-types/           # TypeScript typy
│   │   ├── src/
│   │   │   ├── plugin.ts
│   │   │   ├── events.ts
│   │   │   └── api.ts
│   │   └── package.json
│   │
│   └── shared-config/          # Sdílená konfigurace
│       ├── eslint.config.js
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 🔌 Plugin System

### **Plugin Manifest**

Každý plugin má `manifest.ts`:

```typescript
// plugins/page-assist/src/manifest.ts
import { PluginManifest } from '@unified/shared-types'

export const manifest: PluginManifest = {
  id: 'page-assist',
  name: 'Page Assist',
  version: '1.5.40',
  description: 'AI Assistant with 15+ providers',

  // UI komponenty
  panels: [
    {
      id: 'chat',
      title: 'AI Chat',
      icon: 'MessageSquare',
      component: () => import('./panels/ChatPanel'),
      defaultPosition: 'center',
    },
    {
      id: 'settings',
      title: 'AI Settings',
      icon: 'Settings',
      component: () => import('./panels/SettingsPanel'),
      defaultPosition: 'right-sidebar',
    },
  ],

  // Menu items
  menuItems: [
    {
      id: 'new-chat',
      label: 'New Chat',
      icon: 'Plus',
      action: 'pageAssist.newChat',
      shortcut: 'Ctrl+N',
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      icon: 'Sidebar',
      action: 'pageAssist.toggleSidebar',
      shortcut: 'Ctrl+B',
    },
  ],

  // API které plugin poskytuje
  api: {
    sendMessage: 'Sends message to AI',
    getModels: 'Gets available AI models',
    generateImage: 'Generates image',
  },

  // Events které plugin emituje
  events: {
    'message.sent': 'When user sends message',
    'message.received': 'When AI responds',
    'model.changed': 'When model is changed',
  },

  // Events na které plugin naslouchá
  subscribesTo: [
    'theme.changed',
    'user.authenticated',
    'system.notification',
  ],

  // Permissions
  permissions: [
    'storage',
    'network',
    'clipboard',
  ],

  // Dependencies (jiné pluginy)
  dependencies: [],

  // Nastavení
  settings: [
    {
      key: 'defaultModel',
      label: 'Default AI Model',
      type: 'select',
      options: ['gpt-4', 'claude-3.5', 'mercury'],
      default: 'gpt-4',
    },
  ],
}
```

### **Plugin Entry Point**

```typescript
// plugins/page-assist/src/index.tsx
import { Plugin } from '@unified/shared-core'
import { manifest } from './manifest'

export class PageAssistPlugin implements Plugin {
  id = manifest.id
  manifest = manifest

  private eventBus: EventBus
  private api: PluginAPI

  async activate(context: PluginContext) {
    this.eventBus = context.eventBus
    this.api = context.api

    // Register commands
    context.commands.register('pageAssist.newChat', this.newChat)
    context.commands.register('pageAssist.toggleSidebar', this.toggleSidebar)

    // Subscribe to events
    this.eventBus.on('theme.changed', this.onThemeChanged)

    // Expose API
    return {
      sendMessage: this.sendMessage,
      getModels: this.getModels,
      generateImage: this.generateImage,
    }
  }

  async deactivate() {
    // Cleanup
    this.eventBus.off('theme.changed', this.onThemeChanged)
  }

  private newChat = () => {
    this.eventBus.emit('pageAssist.chat.new', {})
  }

  private sendMessage = async (message: string) => {
    // Implementation
    this.eventBus.emit('pageAssist.message.sent', { message })
  }

  private getModels = async () => {
    return ['gpt-4', 'claude-3.5', 'mercury', ...]
  }

  private generateImage = async (prompt: string) => {
    // Implementation
  }

  private onThemeChanged = (theme: Theme) => {
    // React to theme changes
  }
}

export default PageAssistPlugin
```

---

## 🎨 Unified Dashboard UI

### **Main Dashboard Layout**

```typescript
// apps/dashboard/src/DashboardLayout.tsx
import { useState } from 'react'
import { PluginManager } from './PluginManager'
import { Panel } from '@unified/shared-ui'

export function DashboardLayout() {
  const [layout, setLayout] = useState({
    topBar: ['menu', 'search', 'notifications'],
    leftSidebar: ['page-assist', 'monitoring'],
    center: ['main-content'],
    rightSidebar: ['settings', 'help'],
    bottomBar: ['status', 'logs'],
  })

  return (
    <div className="dashboard-layout">
      {/* Top Bar */}
      <header className="top-bar">
        {layout.topBar.map(pluginId => (
          <PluginPanel key={pluginId} pluginId={pluginId} position="top-bar" />
        ))}
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          {layout.leftSidebar.map(pluginId => (
            <PluginPanel key={pluginId} pluginId={pluginId} position="left-sidebar" />
          ))}
        </aside>

        {/* Center Area */}
        <main className="center">
          {layout.center.map(pluginId => (
            <PluginPanel key={pluginId} pluginId={pluginId} position="center" />
          ))}
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar">
          {layout.rightSidebar.map(pluginId => (
            <PluginPanel key={pluginId} pluginId={pluginId} position="right-sidebar" />
          ))}
        </aside>
      </div>

      {/* Bottom Bar */}
      <footer className="bottom-bar">
        {layout.bottomBar.map(pluginId => (
          <PluginPanel key={pluginId} pluginId={pluginId} position="bottom-bar" />
        ))}
      </footer>
    </div>
  )
}
```

### **Plugin Manager**

```typescript
// apps/dashboard/src/PluginManager.tsx
import { useEffect, useState } from 'react'
import { PluginRegistry } from '@unified/shared-core'

export function PluginManager() {
  const [plugins, setPlugins] = useState([])
  const registry = PluginRegistry.getInstance()

  useEffect(() => {
    // Load all plugins
    const loadPlugins = async () => {
      await registry.loadPlugin('page-assist')
      await registry.loadPlugin('monitoring-tool')
      await registry.loadPlugin('menu-panel')
      // ... další pluginy

      setPlugins(registry.getAllPlugins())
    }

    loadPlugins()
  }, [])

  return (
    <div className="plugin-manager">
      <h2>Installed Plugins ({plugins.length})</h2>
      {plugins.map(plugin => (
        <div key={plugin.id} className="plugin-card">
          <h3>{plugin.manifest.name}</h3>
          <p>{plugin.manifest.description}</p>
          <button onClick={() => registry.enablePlugin(plugin.id)}>
            Enable
          </button>
          <button onClick={() => registry.disablePlugin(plugin.id)}>
            Disable
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔄 Event Bus (Inter-Plugin Communication)

```typescript
// packages/shared-core/src/event-bus/EventBus.ts
export class EventBus {
  private listeners = new Map<string, Set<Function>>()

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback)
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event ${event}:`, error)
      }
    })
  }

  // Async event handling
  async emitAsync(event: string, data?: any) {
    const callbacks = Array.from(this.listeners.get(event) || [])
    await Promise.all(callbacks.map(cb => cb(data)))
  }
}
```

### **Příklad použití Event Bus**

```typescript
// Plugin 1 (Monitoring) emituje event
eventBus.emit('system.cpu.high', {
  usage: 95,
  threshold: 80,
  timestamp: Date.now(),
})

// Plugin 2 (Notification) naslouchá
eventBus.on('system.cpu.high', (data) => {
  showNotification({
    title: 'High CPU Usage',
    message: `CPU usage is ${data.usage}%`,
    type: 'warning',
  })
})

// Plugin 3 (Page Assist) může reagovat
eventBus.on('system.cpu.high', (data) => {
  // Automaticky navrhne řešení pomocí AI
  suggestOptimization(data)
})
```

---

## 🎨 Shared UI Components

```typescript
// packages/shared-ui/src/components/Panel/Panel.tsx
import { ReactNode } from 'react'

export interface PanelProps {
  title: string
  icon?: ReactNode
  actions?: ReactNode[]
  children: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function Panel({ title, icon, actions, children, collapsible, defaultCollapsed }: PanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div className="unified-panel">
      <div className="panel-header">
        <div className="panel-title">
          {icon && <span className="panel-icon">{icon}</span>}
          <h3>{title}</h3>
        </div>
        <div className="panel-actions">
          {actions}
          {collapsible && (
            <button onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          )}
        </div>
      </div>
      {!collapsed && (
        <div className="panel-content">
          {children}
        </div>
      )}
    </div>
  )
}
```

```typescript
// packages/shared-ui/src/components/Chart/Chart.tsx
import { Line, Bar, Pie } from 'recharts'

export interface ChartProps {
  type: 'line' | 'bar' | 'pie'
  data: any[]
  config: ChartConfig
}

export function Chart({ type, data, config }: ChartProps) {
  // Unified chart component používaný všemi pluginy
  // ...
}
```

---

## 🔐 Plugin API & Permissions

```typescript
// packages/shared-core/src/plugin-api/PluginAPI.ts
export class PluginAPI {
  // Storage API
  async storage.get(key: string) {
    // Každý plugin má svůj namespace
    return await store.get(`plugin:${this.pluginId}:${key}`)
  }

  async storage.set(key: string, value: any) {
    return await store.set(`plugin:${this.pluginId}:${key}`, value)
  }

  // Network API (s permission check)
  async fetch(url: string, options?: RequestInit) {
    if (!this.hasPermission('network')) {
      throw new Error('Plugin does not have network permission')
    }
    return await fetch(url, options)
  }

  // Notification API
  async notify(notification: Notification) {
    return await NotificationService.show(notification)
  }

  // UI API
  async showPanel(panelId: string) {
    return await UIService.showPanel(this.pluginId, panelId)
  }

  async hidePanel(panelId: string) {
    return await UIService.hidePanel(this.pluginId, panelId)
  }

  // Theme API
  getTheme() {
    return ThemeService.getCurrentTheme()
  }

  // Command API
  registerCommand(id: string, handler: Function) {
    return CommandService.register(`${this.pluginId}.${id}`, handler)
  }

  // Inter-plugin API (volání API jiného pluginu)
  async callPlugin(pluginId: string, method: string, ...args: any[]) {
    return await PluginRegistry.call(pluginId, method, ...args)
  }
}
```

---

## 📊 Příklad: Monitoring Plugin

```typescript
// plugins/monitoring-tool/src/MonitoringPanel.tsx
import { Panel, Chart } from '@unified/shared-ui'
import { useEventBus, usePluginAPI } from '@unified/shared-core'

export function MonitoringPanel() {
  const eventBus = useEventBus()
  const api = usePluginAPI()
  const [metrics, setMetrics] = useState({
    cpu: [],
    memory: [],
    network: [],
  })

  useEffect(() => {
    // Fetch metrics every second
    const interval = setInterval(async () => {
      const data = await api.fetch('/api/metrics')
      setMetrics(data)

      // Emit event pro ostatní pluginy
      eventBus.emit('monitoring.metrics.updated', data)

      // Check thresholds
      if (data.cpu.current > 90) {
        eventBus.emit('monitoring.alert', {
          type: 'cpu',
          level: 'critical',
          value: data.cpu.current,
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Panel title="System Monitoring" icon={<Activity />}>
      <div className="metrics-grid">
        <Chart
          type="line"
          data={metrics.cpu}
          config={{ title: 'CPU Usage', unit: '%' }}
        />
        <Chart
          type="line"
          data={metrics.memory}
          config={{ title: 'Memory Usage', unit: 'GB' }}
        />
        <Chart
          type="line"
          data={metrics.network}
          config={{ title: 'Network Traffic', unit: 'MB/s' }}
        />
      </div>
    </Panel>
  )
}
```

---

## 🔗 Plugin Communication Example

### **Scenario: Monitoring plugin detekuje high CPU → Page Assist navrhne řešení**

```typescript
// Plugin: Monitoring Tool
eventBus.emit('monitoring.cpu.high', {
  usage: 95,
  process: 'chrome',
  pid: 12345,
})

// Plugin: Page Assist (naslouchá a reaguje)
eventBus.on('monitoring.cpu.high', async (data) => {
  // Automaticky se zeptá AI na řešení
  const suggestion = await pageAssist.sendMessage(
    `CPU usage is ${data.usage}% for process ${data.process}. What can I do?`
  )

  // Zobrazí notifikaci s AI návrhem
  api.notify({
    title: 'High CPU Usage Detected',
    message: suggestion,
    actions: [
      { label: 'Kill Process', action: () => killProcess(data.pid) },
      { label: 'Ignore', action: () => {} },
    ],
  })
})

// Plugin: Menu Panel (přidá quick action)
eventBus.on('monitoring.cpu.high', (data) => {
  menu.addQuickAction({
    label: `Kill ${data.process} (${data.usage}% CPU)`,
    icon: 'X',
    action: () => killProcess(data.pid),
    temporary: true, // Zmizí po vyřešení
  })
})
```

---

## 🚀 Implementace

### **1. Inicializace Monorepo**

```bash
# Create project
mkdir unified-dashboard
cd unified-dashboard

# Initialize pnpm workspace
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'plugins/*'
  - 'packages/*'
EOF

# Install Turborepo
pnpm add -Dw turbo

# Create turbo.json
cat > turbo.json << EOF
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "dev": {
      "cache": false
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
EOF
```

### **2. Vytvoření Packages**

```bash
# Shared UI
mkdir -p packages/shared-ui/src
cd packages/shared-ui
pnpm init
pnpm add react react-dom
pnpm add -D typescript @types/react @types/react-dom vite

# Shared Core
mkdir -p packages/shared-core/src
cd packages/shared-core
pnpm init
pnpm add eventemitter3

# Shared Types
mkdir -p packages/shared-types/src
```

### **3. Migrace Existujících Projektů jako Pluginy**

```bash
# Page Assist plugin
mkdir -p plugins/page-assist
cp -r /path/to/page-assist/* plugins/page-assist/

# Přidání plugin wrapper
cat > plugins/page-assist/src/plugin.ts << EOF
import { Plugin } from '@unified/shared-core'
import { manifest } from './manifest'

export default class PageAssistPlugin implements Plugin {
  // ... implementation
}
EOF
```

---

## 🎨 UI Themes & Consistency

```typescript
// packages/shared-ui/src/styles/theme.ts
export const unifiedTheme = {
  colors: {
    primary: '#1890ff',
    secondary: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    background: {
      light: '#ffffff',
      dark: '#1a1a1a',
    },
    text: {
      light: '#000000',
      dark: '#ffffff',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  shadows: {
    sm: '0 2px 4px rgba(0,0,0,0.1)',
    md: '0 4px 8px rgba(0,0,0,0.15)',
    lg: '0 8px 16px rgba(0,0,0,0.2)',
  },
}
```

Všechny pluginy používají unified theme → konzistentní vzhled!

---

## 📈 Performance & Optimization

### **Code Splitting per Plugin**

```typescript
// Lazy loading pluginů
const pluginModules = {
  'page-assist': () => import('@plugins/page-assist'),
  'monitoring-tool': () => import('@plugins/monitoring-tool'),
  'menu-panel': () => import('@plugins/menu-panel'),
}

// Load only needed plugins
async function loadPlugin(id: string) {
  const module = await pluginModules[id]()
  return new module.default()
}
```

### **Virtual Scrolling for Large Lists**

### **Worker Threads for Heavy Computation**

### **IndexedDB for Offline Support**

---

## 🔧 Development Workflow

```bash
# Install všeho
pnpm install

# Dev mode (všechny pluginy + dashboard)
pnpm dev

# Dev mode (jen specifický plugin)
pnpm --filter @plugins/page-assist dev

# Build všeho
pnpm build

# Test všeho
pnpm test

# Lint
pnpm lint
```

---

## 📝 Příklad Kompletní Integrace

Řekněme, že máš tyto projekty:
1. **Page Assist** (AI assistant)
2. **System Monitor** (CPU, RAM, disk monitoring)
3. **Menu Panel** (quick actions menu)
4. **Notification Center** (centrální notifikace)

**Jak to funguje dohromady:**

```
User opens Dashboard
↓
Dashboard loads all plugins:
  - Page Assist (panel vpravo)
  - System Monitor (panel vlevo)
  - Menu Panel (top bar)
  - Notification Center (bottom right)
↓
System Monitor detekuje high CPU
↓
Emits event: "monitoring.cpu.high"
↓
Page Assist (naslouchá) → automaticky navrhne řešení pomocí AI
Menu Panel (naslouchá) → přidá quick action "Kill process"
Notification Center (naslouchá) → zobrazí notifikaci
↓
User klikne na AI návrh v Page Assist
↓
Page Assist volá API System Monitoru: monitor.killProcess(pid)
↓
System Monitor zabije process
↓
Emits event: "monitoring.process.killed"
↓
Notification Center zobrazí "Process killed successfully"
Menu Panel odstraní quick action
Page Assist zobrazí "✅ Problém vyřešen"
```

---

## 🎯 Next Steps

1. **Řekni mi, jaké projekty máš**, přizpůsobím architekturu
2. **Vytvoříme manifest pro každý projekt**
3. **Migrujeme je jako pluginy**
4. **Vytvoříme unified dashboard**
5. **Integrujeme vše dohromady**

---

**Chceš, abych to začal implementovat? Nebo mi nejdřív řekni, jaké projekty máš! 🚀**
