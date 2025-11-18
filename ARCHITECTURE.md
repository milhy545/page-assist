# Page Assist - Cross-Platform Architecture Design

## Overview
This document outlines the architectural redesign of Page Assist to support both browser extensions and a standalone desktop application, along with modern AI provider integrations.

## Architecture Goals

### 1. **Multi-Platform Support**
- ✅ Browser Extension (Chrome, Firefox, Edge) - existing
- 🆕 **Desktop Application (Tauri)** - standalone app with system tray
- 🆕 **Shared Core** - reusable logic across platforms

### 2. **Modern AI Provider Integration**
- **Text Generation**:
  - ✅ Ollama, OpenAI, Google AI, Chrome AI (existing)
  - 🆕 Mercury (Inception Labs) - ultra-fast diffusion LLM
  - 🆕 Anthropic Claude (claude-3.5-sonnet, claude-3-opus)
  - 🆕 Mistral AI (mistral-large, mistral-medium)
  - 🆕 Cohere (command-r-plus)
  - 🆕 Together AI (various open models)
  - 🆕 Groq (ultra-fast inference)

- **Image Generation**:
  - 🆕 Stable Diffusion (Stability AI API)
  - 🆕 DALL-E 3 (OpenAI)
  - 🆕 Replicate (various models)

### 3. **Code Quality & Testing**
- TypeScript strict mode
- Vitest + React Testing Library
- Unit, integration, and E2E tests
- CI/CD with GitHub Actions

### 4. **Performance Optimization**
- Code splitting
- Lazy loading
- Bundle size reduction
- Virtual scrolling (already implemented)

---

## Monorepo Structure

```
page-assist/
├── packages/
│   ├── core/                    # Shared business logic
│   │   ├── src/
│   │   │   ├── models/         # AI model implementations
│   │   │   ├── services/       # Business services
│   │   │   ├── hooks/          # React hooks (refactored)
│   │   │   ├── chain/          # LangChain RAG logic
│   │   │   ├── storage/        # Storage abstraction
│   │   │   ├── utils/          # Utilities
│   │   │   └── types/          # TypeScript types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                      # Shared UI components
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── styles/         # Tailwind + global styles
│   │   │   ├── i18n/           # Internationalization
│   │   │   └── assets/         # Icons, images
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── browser-extension/       # Browser extension (existing code)
│   │   ├── entries/
│   │   ├── entries-firefox/
│   │   ├── public/
│   │   ├── wxt.config.ts
│   │   └── package.json
│   │
│   ├── desktop/                 # Tauri desktop application
│   │   ├── src/                # Frontend (React)
│   │   ├── src-tauri/          # Rust backend
│   │   │   ├── src/
│   │   │   │   ├── main.rs    # Main entry point
│   │   │   │   ├── tray.rs    # System tray
│   │   │   │   ├── window.rs  # Window management
│   │   │   │   └── shortcuts.rs # Global shortcuts
│   │   │   ├── Cargo.toml
│   │   │   └── tauri.conf.json
│   │   └── package.json
│   │
│   └── shared-types/            # Shared TypeScript types
│       ├── src/
│       │   ├── models.ts
│       │   ├── api.ts
│       │   └── index.ts
│       └── package.json
│
├── pnpm-workspace.yaml          # pnpm workspace config
├── package.json                 # Root package.json
├── turbo.json                   # Turborepo config (optional)
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline
│       ├── build.yml           # Build workflow
│       └── release.yml         # Release workflow
├── vitest.config.ts            # Vitest config
├── ARCHITECTURE.md             # This file
└── README.md
```

---

## New AI Providers Implementation

### Provider Architecture

```typescript
// packages/core/src/models/base.ts
export interface AIProvider {
  id: string
  name: string
  type: 'text' | 'image' | 'embedding'
  apiKeyRequired: boolean
  baseURL?: string
  models: AIModel[]

  // Methods
  chat(params: ChatParams): AsyncIterable<ChatChunk>
  generateImage?(params: ImageGenParams): Promise<ImageResult>
  getEmbedding?(params: EmbeddingParams): Promise<number[]>
}
```

### New Providers

#### 1. Mercury (Inception Labs)
```typescript
// packages/core/src/models/ChatMercury.ts
import { AIProvider } from './base'

export class ChatMercury implements AIProvider {
  id = 'mercury'
  name = 'Mercury (Inception Labs)'
  type = 'text' as const
  apiKeyRequired = true
  baseURL = 'https://api.mercuryai.com/v1'

  // OpenAI-compatible API
  // 1109 tokens/sec on H100
  // $0.25/1M input, $1.00/1M output

  async *chat(params: ChatParams) {
    // Implementation using OpenAI SDK (compatible)
  }
}
```

#### 2. Anthropic Claude
```typescript
// packages/core/src/models/ChatAnthropic.ts
export class ChatAnthropic implements AIProvider {
  id = 'anthropic'
  name = 'Anthropic Claude'
  models = [
    'claude-3.5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307'
  ]

  async *chat(params: ChatParams) {
    // Use @anthropic-ai/sdk
  }
}
```

#### 3. Image Generation
```typescript
// packages/core/src/models/ImageGeneration.ts
export class StableDiffusion implements AIProvider {
  type = 'image' as const

  async generateImage(params: ImageGenParams): Promise<ImageResult> {
    // Stability AI API integration
  }
}

export class DALLE3 implements AIProvider {
  type = 'image' as const

  async generateImage(params: ImageGenParams): Promise<ImageResult> {
    // OpenAI DALL-E 3 integration
  }
}
```

---

## Desktop Application (Tauri)

### Why Tauri?
- **Lightweight**: ~3MB vs 150MB+ (Electron)
- **Fast**: Rust backend, native webview
- **Secure**: Built-in security features
- **Cross-platform**: Windows, macOS, Linux

### Features

#### 1. **Floating Window Mode**
```rust
// src-tauri/src/window.rs
pub fn create_floating_window() -> Result<Window> {
    WindowBuilder::new(app, "floating", WindowUrl::App("/".into()))
        .title("Page Assist")
        .inner_size(400.0, 600.0)
        .decorations(false)  // Borderless
        .always_on_top(true) // Float above other windows
        .skip_taskbar(true)  // Don't show in taskbar
        .build()?
}
```

#### 2. **System Tray Integration**
```rust
// src-tauri/src/tray.rs
pub fn create_system_tray() -> SystemTray {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show", "Show Page Assist"))
        .add_item(CustomMenuItem::new("float", "Floating Mode"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit", "Quit"));

    SystemTray::new().with_menu(tray_menu)
}
```

#### 3. **Global Shortcuts**
```rust
// src-tauri/src/shortcuts.rs
pub fn register_shortcuts(app: &AppHandle) {
    // Ctrl+Shift+Space - Toggle floating window
    app.global_shortcut_manager()
        .register("CommandOrControl+Shift+Space", move || {
            toggle_floating_window();
        });
}
```

#### 4. **Storage Sync**
- Use Tauri's `tauri-plugin-store` for local storage
- Option to sync with browser extension via local server

---

## Refactoring Plan

### 1. **Extract useMessage.tsx** (1600+ lines → 300 lines)

```
packages/core/src/hooks/
├── useMessage.tsx          # Main hook (300 lines)
├── useMessageState.ts      # State management
├── useMessageHandlers.ts   # Event handlers
├── useMessageRAG.ts        # RAG logic
├── useMessageStreaming.ts  # Streaming logic
└── useMessageUtils.ts      # Utility functions
```

### 2. **Service Layer Pattern**

```typescript
// packages/core/src/services/ChatService.ts
export class ChatService {
  constructor(
    private provider: AIProvider,
    private storage: StorageService,
    private rag: RAGService
  ) {}

  async sendMessage(message: string): Promise<void> {
    // Business logic
  }
}
```

### 3. **Storage Abstraction**

```typescript
// packages/core/src/storage/StorageAdapter.ts
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  remove(key: string): Promise<void>
}

// Browser implementation
export class BrowserStorageAdapter implements StorageAdapter {
  // Uses chrome.storage
}

// Desktop implementation
export class TauriStorageAdapter implements StorageAdapter {
  // Uses tauri-plugin-store
}
```

---

## Testing Strategy

### Test Coverage Goals
- **Unit Tests**: 70%+ coverage
- **Integration Tests**: Critical flows
- **E2E Tests**: Main user journeys

### Test Structure

```
packages/
├── core/
│   ├── src/
│   │   └── models/
│   │       └── ChatOllama.ts
│   └── tests/
│       ├── unit/
│       │   └── models/
│       │       └── ChatOllama.test.ts
│       ├── integration/
│       │   └── chat-flow.test.ts
│       └── setup.ts
│
└── ui/
    ├── src/
    │   └── components/
    │       └── MessageList.tsx
    └── tests/
        └── components/
            └── MessageList.test.tsx
```

### Test Examples

```typescript
// Unit test
describe('ChatOllama', () => {
  it('should stream chat responses', async () => {
    const chat = new ChatOllama({ baseURL: 'http://localhost:11434' })
    const stream = chat.chat({ messages: [{ role: 'user', content: 'Hi' }] })

    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    expect(chunks.length).toBeGreaterThan(0)
  })
})

// Component test
describe('MessageList', () => {
  it('should render messages correctly', () => {
    const messages = [{ id: '1', content: 'Hello', role: 'user' }]
    render(<MessageList messages={messages} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

---

## Performance Optimizations

### 1. **Code Splitting**
```typescript
// Lazy load routes
const Playground = lazy(() => import('./components/Option/Playground'))
const Settings = lazy(() => import('./components/Option/Settings'))

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/playground" element={<Playground />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
```

### 2. **Bundle Analysis**
```bash
# Add to package.json
"analyze": "vite-bundle-visualizer"
```

### 3. **Lazy Load Heavy Dependencies**
```typescript
// Lazy load markdown renderer
const renderMarkdown = async (content: string) => {
  const { marked } = await import('marked')
  return marked(content)
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  build-extension:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: pnpm build:extension
      - uses: actions/upload-artifact@v4
        with:
          name: browser-extension
          path: packages/browser-extension/build

  build-desktop:
    needs: test
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - run: pnpm build:desktop
      - uses: actions/upload-artifact@v4
        with:
          name: desktop-${{ matrix.os }}
          path: packages/desktop/src-tauri/target/release
```

---

## Migration Path

### Phase 1: Monorepo Setup (Week 1)
1. Create pnpm workspace structure
2. Extract `packages/core` with existing logic
3. Extract `packages/ui` with components
4. Update imports in browser extension
5. Verify all tests pass

### Phase 2: New AI Providers (Week 2)
1. Implement Mercury provider
2. Implement Anthropic Claude
3. Implement Mistral, Cohere, Groq
4. Implement image generation providers
5. Add provider selection UI

### Phase 3: Desktop App (Week 2-3)
1. Initialize Tauri project
2. Create main window with React UI
3. Implement system tray
4. Add global shortcuts
5. Implement floating window mode
6. Test on Windows, macOS, Linux

### Phase 4: Refactoring (Week 3)
1. Refactor useMessage.tsx
2. Enable TypeScript strict mode
3. Fix type errors incrementally
4. Improve error handling

### Phase 5: Testing (Week 4)
1. Set up Vitest + RTL
2. Write unit tests for providers
3. Write component tests
4. Write integration tests
5. Achieve 70%+ coverage

### Phase 6: Performance (Week 4)
1. Implement code splitting
2. Add lazy loading
3. Optimize bundle size
4. Performance audit

### Phase 7: CI/CD & Docs (Week 5)
1. Set up GitHub Actions
2. Write comprehensive README
3. Create API documentation
4. User guides for desktop app

---

## Success Metrics

- ✅ Desktop app works on Windows/macOS/Linux
- ✅ Browser extension maintains all existing features
- ✅ 70%+ test coverage
- ✅ TypeScript strict mode enabled
- ✅ Bundle size reduced by 30%
- ✅ All new AI providers functional
- ✅ Image generation working
- ✅ Floating window mode smooth (60fps)
- ✅ CI/CD pipeline green
- ✅ Documentation complete

---

## Technology Stack Summary

**Frontend:**
- React 18.2
- TypeScript 5.3 (strict mode)
- Tailwind CSS
- Ant Design
- Vite

**Desktop (Tauri):**
- Rust 1.75+
- Tauri 2.0
- System tray, global shortcuts

**Testing:**
- Vitest
- React Testing Library
- Playwright (E2E)

**AI SDKs:**
- LangChain.js
- OpenAI SDK
- Anthropic SDK
- Ollama SDK
- Stability AI SDK

**Build:**
- pnpm workspaces
- WXT (browser extension)
- Tauri CLI (desktop)
- GitHub Actions (CI/CD)

---

*Last updated: 2025-11-18*
