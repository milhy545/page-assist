# Page Assist - Enhanced Features

## 🚀 What's New

This enhanced version of Page Assist brings powerful new capabilities to make it the most versatile AI assistant available.

---

## 🆕 New AI Providers

### 1. **Mercury (Inception Labs)** - Ultra-Fast Diffusion LLM

Mercury is the world's first commercial-scale diffusion large language model, offering **5-10x faster** inference than traditional LLMs.

**Features:**
- 🚀 1109 tokens/sec (Mini model) on H100
- 💰 Affordable pricing: $0.25/1M input, $1.00/1M output
- 🎯 Specialized for code generation
- 🔄 OpenAI-compatible API

**Available Models:**
- `mercury-coder` - Full-size model for code generation
- `mercury-coder-small` - Faster, 737 tokens/sec
- `mercury-coder-mini` - Fastest, 1109 tokens/sec

**Setup:**
```typescript
import { ChatMercury } from "@/models/ChatMercury"

const model = new ChatMercury({
  mercuryApiKey: "your-api-key",
  modelName: "mercury-coder",
  temperature: 0.7,
})
```

**Get API Key:** https://platform.inceptionlabs.ai

---

### 2. **Anthropic Claude** - Advanced Reasoning

Claude is Anthropic's family of state-of-the-art AI models, known for exceptional reasoning, code generation, and nuanced conversation.

**Features:**
- 🧠 Superior reasoning and analysis
- 📚 200,000 token context window
- 🔒 Strong safety and alignment
- ✍️ Exceptional writing quality

**Available Models:**
- `claude-3-5-sonnet-20241022` - Most intelligent, best for complex tasks
- `claude-3-opus-20240229` - Powerful for highly complex tasks
- `claude-3-sonnet-20240229` - Balanced intelligence and speed
- `claude-3-haiku-20240307` - Fastest and most compact

**Setup:**
```typescript
import { ChatAnthropic } from "@/models/ChatAnthropic"

const model = new ChatAnthropic({
  anthropicApiKey: "your-api-key",
  modelName: "claude-3-5-sonnet-20241022",
  temperature: 0.7,
  maxTokens: 4096,
})
```

**Get API Key:** https://console.anthropic.com

---

### 3. **Universal OpenAI-Compatible Providers**

Access dozens of AI providers through a single, unified interface.

**Supported Providers:**

#### **Mistral AI**
- Models: mistral-large, mistral-medium, codestral
- Base URL: `https://api.mistral.ai/v1`
- Get API Key: https://console.mistral.ai

#### **Groq** - Ultra-Fast Inference
- ⚡ Up to 800 tokens/sec
- Models: Llama 3.3 70B, Mixtral 8x7B, Gemma 2
- Base URL: `https://api.groq.com/openai/v1`
- Get API Key: https://console.groq.com

#### **Together AI**
- 100+ open-source models
- Models: Llama 3.1 405B, Mixtral 8x22B, Qwen 2.5
- Base URL: `https://api.together.xyz/v1`
- Get API Key: https://api.together.xyz

#### **Perplexity**
- Real-time search capabilities
- Models: Sonar Large/Small (with online search)
- Base URL: `https://api.perplexity.ai`

#### **DeepSeek**
- Powerful Chinese AI models
- Models: deepseek-chat, deepseek-coder
- Base URL: `https://api.deepseek.com/v1`

#### **Fireworks AI**
- Fast inference for open models
- Base URL: `https://api.fireworks.ai/inference/v1`

**Setup:**
```typescript
import { ChatGeneric, createProviderChat } from "@/models/ChatGeneric"

// Manual setup
const groq = new ChatGeneric({
  providerName: "Groq",
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: "your-api-key",
  modelName: "llama-3.3-70b-versatile",
})

// Or use preset
const mistral = createProviderChat(
  "mistral",
  "your-api-key",
  "mistral-large-latest"
)
```

---

## 🎨 Image Generation

Generate high-quality images from text prompts using state-of-the-art diffusion models.

### **DALL-E 3 (OpenAI)**

**Features:**
- Photorealistic generation
- HD quality support
- Vivid/Natural styles
- Sizes: 1024x1024, 1792x1024, 1024x1792

**Example:**
```typescript
import { DALLE3 } from "@/models/ImageGeneration"

const dalle = new DALLE3({
  apiKey: "your-openai-api-key",
})

const images = await dalle.generate({
  prompt: "A serene landscape with mountains and a lake at sunset",
  quality: "hd",
  style: "vivid",
})
```

### **Stable Diffusion (Stability AI)**

**Features:**
- Open-source diffusion models
- Highly customizable (negative prompts, guidance scale, steps)
- Multiple model versions (XL, SD3)
- Various sizes supported

**Example:**
```typescript
import { StableDiffusion } from "@/models/ImageGeneration"

const sd = new StableDiffusion({
  apiKey: "your-stability-api-key",
})

const images = await sd.generate({
  prompt: "A futuristic cityscape at night",
  negativePrompt: "blurry, low quality",
  width: 1024,
  height: 1024,
  steps: 30,
  guidanceScale: 7.5,
})
```

### **Flux (Replicate)**

**Features:**
- State-of-the-art image generation
- Photorealistic results
- Fast generation
- Multiple model variants (Pro, Dev)

**Example:**
```typescript
import { FluxReplicate } from "@/models/ImageGeneration"

const flux = new FluxReplicate({
  apiKey: "your-replicate-api-key",
  model: "black-forest-labs/flux-1.1-pro",
})

const images = await flux.generate({
  prompt: "A photo of an astronaut riding a horse on mars",
})
```

---

## 🖥️ Desktop Application (Tauri)

Page Assist is now available as a standalone desktop application with powerful features:

### **Key Features**

#### 🪟 **Floating Window Mode**
Just like Microsoft Copilot! Create a floating AI assistant that stays on top of all windows.

- Borderless, always-on-top window
- Resizable (300x400 minimum)
- Toggle visibility with system tray
- Perfect for quick AI queries while working

**Usage:**
```typescript
// From TypeScript/React
import { invoke } from "@tauri-apps/api"

// Toggle floating window
await invoke("toggle_floating_window")

// Set always on top
await invoke("set_always_on_top", { alwaysOnTop: true })
```

#### 📍 **System Tray Integration**
Access Page Assist from your system tray at all times.

**Features:**
- Left-click to toggle main window
- Right-click for menu:
  - Show Main Window
  - Floating Mode
  - Quit

#### ⌨️ **Global Shortcuts** (Coming Soon)
Quick access from anywhere:
- `Ctrl+Shift+Space` - Toggle floating window
- `Ctrl+Shift+A` - Toggle main window

### **Installation**

#### **Prerequisites**

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel

# Arch
sudo pacman -S webkit2gtk-4.1 \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  appmenu-gtk-module \
  gtk3 \
  libappindicator-gtk3 \
  librsvg
```

**macOS:**
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

**Windows:**
- Install Microsoft Visual Studio C++ Build Tools
- Install WebView2 (usually pre-installed on Windows 10/11)

#### **Build from Source**

```bash
# Navigate to desktop directory
cd desktop

# Install dependencies
bun install

# Development mode
bun run tauri dev

# Build for production
bun run tauri build
```

**Build outputs:**
- **Linux:** `desktop/src-tauri/target/release/bundle/deb/` or `.appimage`
- **macOS:** `desktop/src-tauri/target/release/bundle/dmg/`
- **Windows:** `desktop/src-tauri/target/release/bundle/msi/`

### **Desktop vs Browser Extension**

| Feature | Browser Extension | Desktop App |
|---------|------------------|-------------|
| Browser integration | ✅ Sidebar, context menu | ❌ |
| Webpage context | ✅ Chat with current page | ❌ |
| Floating window | ❌ | ✅ |
| System tray | ❌ | ✅ |
| Always on top | ❌ | ✅ |
| Global shortcuts | ⚠️ Limited | ✅ |
| Offline first | ✅ | ✅ |
| File access | ⚠️ Limited | ✅ Full |
| RAM usage | Lower | Higher |

**Recommendation:** Use both!
- **Browser extension** for web browsing and research
- **Desktop app** for quick AI queries while working

---

## 🏗️ Architecture

### **Multi-Platform Design**

The enhanced Page Assist follows a modular architecture to support both browser extensions and desktop applications:

```
page-assist/
├── src/                    # Existing browser extension
│   ├── models/            # AI model implementations
│   │   ├── ChatMercury.ts          # Mercury (Inception Labs)
│   │   ├── ChatAnthropic.ts        # Anthropic Claude
│   │   ├── ChatGeneric.ts          # Universal OpenAI-compatible
│   │   ├── ImageGeneration.ts      # Image generation providers
│   │   ├── ChatOllama.ts           # Ollama (existing)
│   │   ├── CustomChatOpenAI.ts     # Custom OpenAI (existing)
│   │   └── ...
│   ├── components/
│   ├── services/
│   └── ...
│
├── desktop/               # Tauri desktop application
│   ├── src/              # React frontend (can share components)
│   ├── src-tauri/        # Rust backend
│   │   ├── src/
│   │   │   ├── lib.rs   # Main app logic
│   │   │   └── main.rs  # Entry point
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   └── package.json
│
├── ARCHITECTURE.md        # Detailed architecture documentation
└── ENHANCED_FEATURES.md  # This file
```

### **Shared Logic**

Future improvements will extract shared code into reusable packages:
- `packages/core/` - Business logic, hooks, services
- `packages/ui/` - Shared React components
- `packages/types/` - TypeScript type definitions

---

## 📊 Performance Optimizations

### **Current Optimizations**
- ✅ Virtual scrolling for long chat histories
- ✅ Lazy loading for heavy dependencies
- ✅ IndexedDB for efficient data storage

### **Planned Optimizations**
- ⏳ Code splitting for routes
- ⏳ Tree shaking for unused code
- ⏳ Bundle size analysis
- ⏳ Service worker caching

---

## 🧪 Testing

### **Test Infrastructure** (Planned)

```bash
# Install test dependencies
bun add -d vitest @testing-library/react @testing-library/jest-dom

# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch
```

### **Test Coverage Goals**
- Unit tests: 70%+
- Integration tests: Critical flows
- E2E tests: Main user journeys

---

## 🔐 Security & Privacy

### **Data Storage**
- **API Keys:** Stored locally in browser storage (encrypted by browser)
- **Chat History:** Local IndexedDB, never sent to external servers
- **Desktop App:** Uses Tauri secure storage

### **Network Requests**
- Direct API calls to AI providers (no middleman)
- CORS handling for local AI servers
- Optional request logging for debugging

### **Best Practices**
- ✅ Use environment variables for API keys in development
- ✅ Never commit API keys to version control
- ✅ Rotate API keys regularly
- ✅ Monitor API usage and set billing limits

---

## 🚦 Getting Started with New Features

### **1. Add Mercury Provider**

1. Get API key from https://platform.inceptionlabs.ai
2. In Page Assist settings:
   - Add new provider: "Mercury"
   - Base URL: `https://api.mercuryai.com/v1`
   - API Key: Your Mercury API key
   - Select model: `mercury-coder`

### **2. Add Anthropic Claude**

1. Get API key from https://console.anthropic.com
2. In Page Assist settings:
   - Add new provider: "Anthropic"
   - Configure manually with custom endpoint
   - Or use the new ChatAnthropic class directly

### **3. Add Generic Provider (e.g., Groq)**

1. Get API key from provider (e.g., https://console.groq.com)
2. In Page Assist settings:
   - Add new provider: "Custom OpenAI"
   - Base URL: `https://api.groq.com/openai/v1`
   - API Key: Your Groq API key
   - Model: `llama-3.3-70b-versatile`

### **4. Generate Images**

```typescript
// In your code
import { createImageProvider } from "@/models/ImageGeneration"

const dalle = createImageProvider("dalle3", "your-openai-key")

const images = await dalle.generate({
  prompt: "Your creative prompt here",
  quality: "hd",
})

console.log(images[0].url) // Display the image
```

---

## 📈 Roadmap

### **✅ Completed**
- Mercury (Inception Labs) integration
- Anthropic Claude integration
- Universal OpenAI-compatible provider support
- Image generation (DALL-E 3, Stable Diffusion, Flux)
- Tauri desktop application with system tray
- Floating window mode
- Architecture documentation

### **🚧 In Progress**
- UI for selecting new AI providers
- Monorepo structure with shared packages
- Test suite (Vitest + React Testing Library)
- TypeScript strict mode
- Code refactoring (useMessage.tsx)

### **📅 Planned**
- Global keyboard shortcuts for desktop app
- Plugin system for custom AI providers
- Voice input/output improvements
- Collaborative features (share chats, prompts)
- Mobile app (React Native or Flutter)
- Model comparison mode (run multiple models simultaneously)
- Advanced RAG features (graph-based knowledge)
- Browser extension for Safari
- Offline mode improvements

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Adding New AI Providers**

1. Create a new file in `src/models/` (e.g., `ChatYourProvider.ts`)
2. Implement the LangChain `BaseChatModel` interface
3. Export your model in `src/models/index.ts`
4. Add provider configuration UI
5. Write tests
6. Submit a pull request!

**Example:**
```typescript
import { BaseChatModel } from "@langchain/core/language_models/chat_models"

export class ChatYourProvider extends BaseChatModel {
  // Implementation
}
```

### **Improving Desktop App**

1. Fork the repository
2. Make changes in `desktop/` directory
3. Test on your platform (Linux/macOS/Windows)
4. Submit PR with screenshots/videos

### **Writing Tests**

```typescript
import { describe, it, expect } from "vitest"
import { ChatMercury } from "@/models/ChatMercury"

describe("ChatMercury", () => {
  it("should initialize correctly", () => {
    const model = new ChatMercury({
      mercuryApiKey: "test-key",
    })

    expect(model.modelName).toBe("mercury-coder")
  })
})
```

---

## 📚 Resources

### **Documentation**
- [Architecture Guide](./ARCHITECTURE.md) - Detailed system architecture
- [Tauri Documentation](https://tauri.app) - Desktop app framework
- [LangChain.js](https://js.langchain.com) - AI framework
- [Original README](./README.md) - Browser extension features

### **API Documentation**
- [Mercury API](https://docs.inceptionlabs.ai) - Inception Labs
- [Anthropic API](https://docs.anthropic.com) - Claude
- [Mistral AI](https://docs.mistral.ai)
- [Groq](https://console.groq.com/docs)
- [Stability AI](https://platform.stability.ai/docs)

### **Community**
- [GitHub Issues](https://github.com/n4ze3m/page-assist/issues) - Bug reports & feature requests
- [Discussions](https://github.com/n4ze3m/page-assist/discussions) - Questions & ideas

---

## 📝 License

This project maintains the same license as the original Page Assist repository.

---

## 🙏 Acknowledgments

- **Original Page Assist** by [@n4ze3m](https://github.com/n4ze3m)
- **Inception Labs** for Mercury diffusion LLM
- **Anthropic** for Claude
- **Tauri Team** for the amazing desktop framework
- **LangChain Team** for the AI framework
- All contributors and users of Page Assist!

---

## 💡 Tips & Tricks

### **Get the Most Out of Page Assist**

1. **Use Local Models for Privacy**
   - Run Ollama locally for 100% private AI
   - No internet required, no API costs

2. **Combine Providers**
   - Use fast models (Groq, Mercury) for quick queries
   - Use powerful models (Claude, GPT-4) for complex tasks
   - Use image generation for visual content

3. **Desktop + Extension = Power Combo**
   - Keep desktop app as floating window for quick access
   - Use browser extension for research and browsing
   - Sync via local storage (coming soon)

4. **Optimize API Costs**
   - Use smaller models for simple tasks
   - Set max token limits
   - Cache common responses
   - Monitor usage dashboards

5. **Keyboard Shortcuts**
   - Browser: `Ctrl+Shift+L` (Web UI), `Ctrl+Shift+Y` (Sidebar)
   - Desktop: System tray for quick toggle

---

**Made with ❤️ for the AI community**

*Last updated: 2025-11-18*
