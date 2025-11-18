# Page Assist - Usage Examples

Comprehensive examples for using all the new features in Page Assist.

---

## 🚀 Quick Start Examples

### Example 1: Using Mercury for Ultra-Fast Code Generation

```typescript
import { ChatMercury } from "@/models/ChatMercury"
import { HumanMessage } from "@langchain/core/messages"

// Initialize Mercury with API key
const mercury = new ChatMercury({
  mercuryApiKey: "your-mercury-api-key",
  modelName: "mercury-coder-mini", // Fastest: 1109 tokens/sec!
  temperature: 0.2, // Lower for code generation
})

// Generate code
const response = await mercury.invoke([
  new HumanMessage("Write a Python function to calculate fibonacci numbers using memoization")
])

console.log(response.content)
// Output: Ultra-fast, well-structured Python code with memoization
```

**Why Mercury?**
- 5-10x faster than traditional LLMs
- Perfect for real-time code suggestions
- Affordable: $0.25/1M input tokens

---

### Example 2: Using Claude for Complex Reasoning

```typescript
import { ChatAnthropic } from "@/models/ChatAnthropic"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"

// Initialize Claude
const claude = new ChatAnthropic({
  anthropicApiKey: "your-anthropic-api-key",
  modelName: "claude-3-5-sonnet-20241022",
  temperature: 0.7,
  maxTokens: 4096,
})

// Complex reasoning task
const response = await claude.invoke([
  new SystemMessage("You are an expert software architect"),
  new HumanMessage(`
    Analyze the trade-offs between microservices and monolithic architecture
    for a startup with 5 engineers. Consider scalability, development speed,
    and operational complexity.
  `)
])

console.log(response.content)
// Output: Comprehensive analysis with nuanced trade-offs
```

**Why Claude?**
- Superior reasoning and analysis
- 200,000 token context window
- Best for complex, nuanced tasks

---

### Example 3: Using Groq for Real-Time Chat

```typescript
import { createProviderChat } from "@/models/ChatGeneric"

// Initialize Groq (ultra-fast inference)
const groq = createProviderChat(
  "groq",
  "your-groq-api-key",
  "llama-3.3-70b-versatile",
  {
    temperature: 0.8,
    streaming: true, // Enable streaming for real-time responses
  }
)

// Stream responses
const stream = await groq.stream([
  new HumanMessage("Explain quantum entanglement in simple terms")
])

for await (const chunk of stream) {
  process.stdout.write(chunk.content) // Real-time output!
}
```

**Why Groq?**
- Up to 800 tokens/sec
- Free tier available
- Perfect for real-time applications

---

### Example 4: Generating Images with DALL-E 3

```typescript
import { DALLE3 } from "@/models/ImageGeneration"

// Initialize DALL-E 3
const dalle = new DALLE3({
  apiKey: "your-openai-api-key",
})

// Generate high-quality image
const images = await dalle.generate({
  prompt: "A serene Japanese garden at sunset with cherry blossoms and a koi pond",
  quality: "hd",
  style: "vivid",
})

console.log(images[0].url)
// Output: URL to beautiful, high-resolution image
console.log(images[0].revisedPrompt)
// DALL-E 3 may enhance your prompt for better results
```

---

### Example 5: Generating Images with Stable Diffusion

```typescript
import { StableDiffusion } from "@/models/ImageGeneration"

// Initialize Stable Diffusion
const sd = new StableDiffusion({
  apiKey: "your-stability-api-key",
  model: "sd3", // or "stable-diffusion-xl-1024-v1-0"
})

// Generate with advanced controls
const images = await sd.generate({
  prompt: "A futuristic cityscape at night with neon lights and flying cars",
  negativePrompt: "blurry, low quality, distorted, ugly",
  width: 1024,
  height: 1024,
  steps: 30, // More steps = better quality
  guidanceScale: 7.5, // How closely to follow prompt
  seed: 42, // For reproducible results
  numImages: 3, // Generate 3 variations
})

images.forEach((img, i) => {
  console.log(`Image ${i + 1}:`, img.b64_json)
})
```

---

### Example 6: Multi-Provider Workflow

```typescript
import { ChatClaude } from "@/models/ChatAnthropic"
import { DALLE3 } from "@/models/ImageGeneration"

// Step 1: Use Claude to create image description
const claude = new ChatAnthropic({
  anthropicApiKey: "your-key",
  modelName: "claude-3-5-sonnet-20241022",
})

const descriptionResponse = await claude.invoke([
  new HumanMessage(
    "Create a detailed, vivid description for an AI-generated image of a magical forest scene"
  )
])

const description = descriptionResponse.content

// Step 2: Use DALL-E 3 to generate image from Claude's description
const dalle = new DALLE3({ apiKey: "your-openai-key" })

const images = await dalle.generate({
  prompt: description,
  quality: "hd",
  style: "vivid",
})

console.log("Generated image:", images[0].url)
```

**Why combine providers?**
- Claude excels at creative writing
- DALL-E 3 excels at image generation
- Together they create amazing results!

---

## 🎨 Advanced Examples

### Example 7: Provider Failover Strategy

```typescript
// Automatic failover between providers
const providers = [
  createProviderChat("groq", groqKey, "llama-3.3-70b-versatile"),
  new ChatMercury({ mercuryApiKey: mercuryKey }),
  new ChatAnthropic({ anthropicApiKey: claudeKey }),
]

async function chatWithFailover(message: string) {
  for (const provider of providers) {
    try {
      const response = await provider.invoke([new HumanMessage(message)])
      return response.content
    } catch (error) {
      console.log(`Provider ${provider._llmType()} failed, trying next...`)
    }
  }
  throw new Error("All providers failed")
}

const answer = await chatWithFailover("What is the meaning of life?")
```

---

### Example 8: Cost Optimization

```typescript
// Route queries based on complexity and cost
function selectOptimalProvider(query: string, complexity: "simple" | "medium" | "complex") {
  switch (complexity) {
    case "simple":
      // Use fastest, cheapest option
      return createProviderChat("groq", groqKey, "llama-3.3-70b-versatile")

    case "medium":
      // Balance speed and quality
      return new ChatMercury({
        mercuryApiKey: mercuryKey,
        modelName: "mercury-coder",
      })

    case "complex":
      // Use most capable model
      return new ChatAnthropic({
        anthropicApiKey: claudeKey,
        modelName: "claude-3-5-sonnet-20241022",
      })
  }
}

// Usage
const simpleQuery = "What is 2+2?"
const provider = selectOptimalProvider(simpleQuery, "simple")
const answer = await provider.invoke([new HumanMessage(simpleQuery)])
```

---

### Example 9: Streaming with Progress Tracking

```typescript
import { useMessageStreaming } from "@/hooks/refactored/useMessageStreaming"

function ChatComponent() {
  const { startStreaming, streamingState } = useMessageStreaming()

  const handleSendMessage = async (message: string) => {
    const groq = createProviderChat("groq", "your-key", "llama-3.3-70b-versatile")

    await startStreaming(
      groq,
      [new HumanMessage(message)],
      {
        onToken: (token) => {
          // Update UI in real-time
          console.log("New token:", token)
        },
        onComplete: (fullText) => {
          console.log("Complete response:", fullText)
        },
        onError: (error) => {
          console.error("Streaming error:", error)
        },
      }
    )
  }

  return (
    <div>
      {streamingState.isStreaming && <p>Generating response...</p>}
      <p>{streamingState.currentText}</p>
    </div>
  )
}
```

---

### Example 10: RAG (Retrieval-Augmented Generation)

```typescript
import { useMessageRAG } from "@/hooks/refactored/useMessageRAG"
import { ChatAnthropic } from "@/models/ChatAnthropic"

async function chatWithDocuments() {
  const { createVectorStore, retrieveDocuments } = useMessageRAG()

  // Step 1: Create vector store from documents
  const documents = [
    { pageContent: "Page Assist is an AI assistant...", metadata: { source: "docs" } },
    { pageContent: "Mercury is ultra-fast...", metadata: { source: "mercury-docs" } },
    // ... more documents
  ]

  const vectorStore = await createVectorStore(documents, "ollama::nomic-embed-text")

  // Step 2: Retrieve relevant documents
  const query = "How fast is Mercury?"
  const ragResult = await retrieveDocuments(query, vectorStore, { maxDocs: 3 })

  // Step 3: Use Claude with retrieved context
  const claude = new ChatAnthropic({ anthropicApiKey: "your-key" })

  const response = await claude.invoke([
    new SystemMessage(`Use the following context to answer questions:\n\n${ragResult.context}`),
    new HumanMessage(query),
  ])

  console.log(response.content)
  console.log("Sources:", ragResult.sources)
}
```

---

## 🖥️ Desktop App Examples

### Example 11: Using Floating Window Mode

```typescript
// In your Tauri desktop app
import { invoke } from "@tauri-apps/api"

// Toggle floating window
async function toggleFloatingWindow() {
  await invoke("toggle_floating_window")
}

// Set always on top
async function setAlwaysOnTop(alwaysOnTop: boolean) {
  await invoke("set_always_on_top", { alwaysOnTop })
}

// Usage in React component
function DesktopControls() {
  return (
    <div>
      <button onClick={toggleFloatingWindow}>
        Toggle Floating Mode
      </button>
      <button onClick={() => setAlwaysOnTop(true)}>
        Always on Top
      </button>
    </div>
  )
}
```

---

## 🧪 Testing Examples

### Example 12: Unit Testing AI Providers

```typescript
import { describe, it, expect, vi } from 'vitest'
import { ChatMercury } from '@/models/ChatMercury'

describe('ChatMercury', () => {
  it('should initialize with correct config', () => {
    const mercury = new ChatMercury({
      mercuryApiKey: 'test-key',
      modelName: 'mercury-coder-mini',
      temperature: 0.5,
    })

    expect(mercury.modelName).toBe('mercury-coder-mini')
    expect(mercury.temperature).toBe(0.5)
    expect(mercury._llmType()).toBe('mercury')
  })
})
```

---

## 📊 Performance Benchmarking

### Example 13: Comparing Provider Speeds

```typescript
async function benchmarkProviders() {
  const providers = {
    mercury: new ChatMercury({ mercuryApiKey: "key" }),
    groq: createProviderChat("groq", "key", "llama-3.3-70b-versatile"),
    claude: new ChatAnthropic({ anthropicApiKey: "key" }),
  }

  const testPrompt = "Write a hello world function in Python"

  for (const [name, provider] of Object.entries(providers)) {
    const start = Date.now()

    await provider.invoke([new HumanMessage(testPrompt)])

    const duration = Date.now() - start
    console.log(`${name}: ${duration}ms`)
  }
}

// Expected results:
// groq: ~150ms (800 tokens/sec)
// mercury: ~180ms (1109 tokens/sec on Mini)
// claude: ~800ms (slower but higher quality)
```

---

## 🎯 Real-World Use Cases

### Example 14: Code Review Assistant

```typescript
const codeReviewer = new ChatAnthropic({
  anthropicApiKey: "your-key",
  modelName: "claude-3-5-sonnet-20241022",
})

async function reviewCode(code: string) {
  const response = await codeReviewer.invoke([
    new SystemMessage("You are an expert code reviewer. Provide constructive feedback."),
    new HumanMessage(`Review this code:\n\n\`\`\`typescript\n${code}\n\`\`\``)
  ])

  return response.content
}
```

### Example 15: AI Pair Programming

```typescript
const copilot = new ChatMercury({
  mercuryApiKey: "your-key",
  modelName: "mercury-coder-mini", // Ultra-fast!
  temperature: 0.2,
})

async function autoComplete(partialCode: string) {
  const response = await copilot.invoke([
    new HumanMessage(`Complete this code:\n\`\`\`\n${partialCode}\n\`\`\``)
  ])

  return response.content
}
```

### Example 16: Document Summarization

```typescript
const summarizer = new ChatAnthropic({
  anthropicApiKey: "your-key",
  modelName: "claude-3-haiku-20240307", // Fast and cheap for summarization
})

async function summarizeDocument(document: string) {
  const response = await summarizer.invoke([
    new SystemMessage("Summarize the following document concisely"),
    new HumanMessage(document),
  ])

  return response.content
}
```

---

## 🔧 Configuration Examples

### Example 17: Environment-Based Configuration

```typescript
// config/ai-providers.ts
export const getProviderConfig = () => {
  const env = process.env.NODE_ENV

  if (env === "development") {
    return {
      default: createProviderChat("groq", process.env.GROQ_API_KEY!, "llama-3.3-70b-versatile"),
      image: new DALLE3({ apiKey: process.env.OPENAI_API_KEY! }),
    }
  }

  if (env === "production") {
    return {
      default: new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
        modelName: "claude-3-5-sonnet-20241022",
      }),
      image: new StableDiffusion({ apiKey: process.env.STABILITY_API_KEY! }),
    }
  }

  throw new Error("Unknown environment")
}
```

---

## 📚 More Examples

For more examples, check out:
- `src/models/__tests__/` - Test files with usage examples
- `src/hooks/refactored/` - Refactored hooks with examples
- `ENHANCED_FEATURES.md` - Complete feature guide
- `ARCHITECTURE.md` - System design and patterns

---

## 💡 Tips & Best Practices

1. **Start Fast, Iterate**: Use Groq or Mercury for prototyping, then switch to Claude for production
2. **Cost Optimization**: Route simple queries to cheaper models, complex ones to premium models
3. **Error Handling**: Always implement retry logic and failover strategies
4. **Streaming**: Use streaming for better UX in real-time applications
5. **Context Management**: Claude's 200K context is great, but be mindful of costs
6. **Testing**: Write tests for AI interactions using mocks
7. **Rate Limiting**: Implement rate limiting to avoid hitting API limits
8. **Caching**: Cache frequent queries to reduce API calls

---

**Happy Building!** 🚀

*Last updated: 2025-11-18*
