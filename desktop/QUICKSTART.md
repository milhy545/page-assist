# Page Assist Desktop - Quick Start Guide

Welcome to Page Assist Desktop! This guide will help you get started with the standalone desktop application.

## 🚀 Quick Start

### **Option 1: Download Pre-built Binary** (Recommended)

**Coming Soon!** Pre-built binaries will be available in the [Releases](https://github.com/n4ze3m/page-assist/releases) page.

- **Linux:** `.deb` package or `.AppImage`
- **macOS:** `.dmg` installer
- **Windows:** `.msi` installer

### **Option 2: Build from Source**

#### **Prerequisites**

Install Rust and system dependencies:

**Linux (Ubuntu/Debian):**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install system dependencies
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**macOS:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Xcode Command Line Tools
xcode-select --install
```

**Windows:**
```powershell
# Install Rust (visit https://rustup.rs)
# Install Visual Studio C++ Build Tools
# WebView2 is usually pre-installed on Windows 10/11
```

#### **Build Steps**

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/n4ze3m/page-assist.git
cd page-assist/desktop

# Install JavaScript dependencies
bun install
# Or: npm install

# Run in development mode
bun run tauri dev

# Build for production
bun run tauri build
```

**Build outputs:**
- **Linux:** `src-tauri/target/release/bundle/deb/` or `.appimage`
- **macOS:** `src-tauri/target/release/bundle/dmg/`
- **Windows:** `src-tauri/target/release/bundle/msi/`

---

## 🎯 Features

### **1. System Tray**

Page Assist lives in your system tray for quick access.

**Usage:**
- **Left-click** system tray icon → Toggle main window
- **Right-click** system tray icon → Open menu
  - Show Main Window
  - Floating Mode
  - Quit

### **2. Floating Window Mode**

Create a borderless, always-on-top window that floats above all other applications - perfect for quick AI queries while working!

**How to activate:**
1. Right-click system tray icon
2. Select "Floating Mode"

**Features:**
- Always stays on top
- Borderless design
- Resizable (minimum 300x400)
- Doesn't appear in taskbar

**Tip:** Use floating mode while coding, writing, or browsing!

### **3. Main Window**

Standard application window with full features.

**Features:**
- Resizable, minimizable, maximizable
- Appears in taskbar
- Can be hidden to system tray

---

## ⚙️ Configuration

### **First Launch**

On first launch, you'll need to configure your AI providers:

1. **Local AI (Ollama):**
   - Install Ollama: https://ollama.ai
   - Run: `ollama pull llama3.2`
   - Page Assist will auto-detect `http://localhost:11434`

2. **Cloud AI Providers:**
   - Get API keys from providers (OpenAI, Anthropic, etc.)
   - Add them in Settings → Providers
   - Select your preferred models

### **Settings Location**

**Linux:** `~/.local/share/com.pageassist.desktop/`
**macOS:** `~/Library/Application Support/com.pageassist.desktop/`
**Windows:** `%APPDATA%\com.pageassist.desktop\`

---

## 🎨 Usage Examples

### **Quick AI Query (Floating Mode)**

1. Activate floating mode from system tray
2. Position window in corner of screen
3. Type your question
4. Get instant AI response while working

**Use cases:**
- Quick code explanations
- Writing assistance
- Math calculations
- Language translation

### **Extended Conversation (Main Window)**

1. Open main window from system tray
2. Start a new chat
3. Upload files for context (PDFs, docs, etc.)
4. Have extended, multi-turn conversations

**Use cases:**
- Research and analysis
- Document summarization
- Code review
- Creative writing

### **Image Generation**

1. Select an image generation model (DALL-E 3, Stable Diffusion)
2. Enter your prompt
3. Adjust settings (quality, size, style)
4. Generate images
5. Save to your computer

---

## 🔧 Troubleshooting

### **App won't start**

**Linux:**
```bash
# Check if dependencies are installed
ldd src-tauri/target/release/page-assist-desktop

# Run from terminal to see errors
./src-tauri/target/release/page-assist-desktop
```

**macOS:**
```bash
# If blocked by security:
# System Settings → Security & Privacy → Open Anyway
```

**Windows:**
```powershell
# If SmartScreen blocks:
# Click "More info" → "Run anyway"
```

### **System tray icon missing**

**Linux (Gnome):**
```bash
# Install appindicator extension
sudo apt install gnome-shell-extension-appindicator

# Restart Gnome Shell: Alt+F2, type 'r', Enter
```

**Linux (Ubuntu 22.04+):**
```bash
# Enable system tray
gnome-extensions enable ubuntu-appindicators@ubuntu.com
```

### **Floating window disappears**

The floating window might be behind other windows. Check system tray menu to toggle it again.

### **Can't connect to Ollama**

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start Ollama
ollama serve
```

### **High memory usage**

Desktop apps use more RAM than browser extensions due to bundled webview. Typical usage:
- Idle: 100-200 MB
- Active chat: 300-500 MB
- With large context: 500 MB - 1 GB

**Tips to reduce usage:**
- Close unused chats
- Clear chat history periodically
- Use smaller models

---

## 🔐 Security & Privacy

### **Data Storage**
- All data stored locally on your computer
- No telemetry or analytics
- Chat history stays on your device

### **Network Requests**
- Only makes requests to AI providers you configure
- Direct API calls (no middleman)
- Local AI (Ollama) runs entirely offline

### **API Keys**
- Stored securely using Tauri's encrypted storage
- Never sent to external servers (except the providers you configure)
- Delete keys anytime from Settings

---

## 🚦 Keyboard Shortcuts

### **Global Shortcuts** (Coming Soon)
- `Ctrl+Shift+Space` - Toggle floating window
- `Ctrl+Shift+A` - Toggle main window

### **In-App Shortcuts**
- `Enter` - Send message
- `Shift+Enter` - New line
- `Ctrl+K` - New chat
- `Ctrl+,` - Settings
- `Escape` - Close window (minimize to tray)

---

## 🆚 Desktop vs Browser Extension

| Feature | Desktop App | Browser Extension |
|---------|------------|-------------------|
| **Floating window** | ✅ Yes | ❌ No |
| **System tray** | ✅ Yes | ❌ No |
| **Always on top** | ✅ Yes | ❌ No |
| **Works without browser** | ✅ Yes | ❌ No |
| **Global shortcuts** | ✅ Yes (coming) | ⚠️ Limited |
| **Browser integration** | ❌ No | ✅ Yes |
| **Webpage context** | ❌ No | ✅ Yes |
| **Resource usage** | Higher | Lower |

**Best of both worlds:** Use desktop app for quick queries, browser extension for web research!

---

## 📊 Performance Tips

### **Faster Startup**
- Use smaller models for quick responses
- Enable model caching
- Close unused background apps

### **Lower Resource Usage**
- Use Ollama with smaller models (Phi-3, Gemma 2B)
- Limit context window size
- Clear old chats

### **Better Response Quality**
- Use larger models (Claude, GPT-4)
- Provide more context
- Adjust temperature/top-p settings

---

## 🔄 Updates

### **Automatic Updates** (Coming Soon)
Desktop app will check for updates on startup and notify you when new versions are available.

### **Manual Updates**
1. Download latest version from [Releases](https://github.com/n4ze3m/page-assist/releases)
2. Install over existing version
3. Your settings and chat history will be preserved

---

## 🆘 Getting Help

### **Documentation**
- [Enhanced Features Guide](../ENHANCED_FEATURES.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Browser Extension Docs](../docs/)

### **Community**
- [GitHub Issues](https://github.com/n4ze3m/page-assist/issues) - Report bugs
- [GitHub Discussions](https://github.com/n4ze3m/page-assist/discussions) - Ask questions

### **Debugging**

Enable debug mode:

```bash
# Linux/macOS
RUST_LOG=debug ./page-assist-desktop

# Windows
set RUST_LOG=debug
page-assist-desktop.exe
```

Check logs:
- **Linux:** `~/.local/share/com.pageassist.desktop/logs/`
- **macOS:** `~/Library/Logs/com.pageassist.desktop/`
- **Windows:** `%APPDATA%\com.pageassist.desktop\logs\`

---

## 🎉 What's Next?

Now that you have Page Assist Desktop running:

1. **Configure your favorite AI providers** in Settings
2. **Try floating mode** while working
3. **Generate some images** with DALL-E or Stable Diffusion
4. **Star the repo** on GitHub if you find it useful!
5. **Share feedback** - we'd love to hear from you

---

**Enjoy your new AI assistant!** 🚀

*Questions? Open an issue on [GitHub](https://github.com/n4ze3m/page-assist/issues)*
