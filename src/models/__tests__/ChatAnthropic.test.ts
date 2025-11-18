import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { ChatAnthropic, CLAUDE_MODELS } from '../ChatAnthropic'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'

describe('ChatAnthropic', () => {
  let anthropicChat: ChatAnthropic

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with default model', () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-api-key',
      })

      expect(anthropicChat.modelName).toBe('claude-3-5-sonnet-20241022')
      expect(anthropicChat._llmType()).toBe('anthropic')
    })

    it('should accept custom model name', () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-api-key',
        modelName: 'claude-3-opus-20240229',
      })

      expect(anthropicChat.modelName).toBe('claude-3-opus-20240229')
    })

    it('should set default temperature', () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-api-key',
      })

      expect(anthropicChat.temperature).toBe(1.0)
    })

    it('should accept custom temperature', () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-api-key',
        temperature: 0.7,
      })

      expect(anthropicChat.temperature).toBe(0.7)
    })

    it('should set default maxTokens', () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-api-key',
      })

      expect(anthropicChat.maxTokens).toBe(4096)
    })

    it('should accept custom maxTokens', () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-api-key',
        maxTokens: 8192,
      })

      expect(anthropicChat.maxTokens).toBe(8192)
    })

    it('should have correct base URL', () => {
      expect(ChatAnthropic.BASE_URL).toBe('https://api.anthropic.com/v1')
    })

    it('should have correct API version', () => {
      expect(ChatAnthropic.API_VERSION).toBe('2023-06-01')
    })
  })

  describe('Model Configuration', () => {
    it('should have all Claude models defined', () => {
      expect(CLAUDE_MODELS).toHaveLength(4)
    })

    it('should have Claude 3.5 Sonnet as first model', () => {
      const sonnet = CLAUDE_MODELS[0]
      expect(sonnet.id).toBe('claude-3-5-sonnet-20241022')
      expect(sonnet.name).toBe('Claude 3.5 Sonnet')
      expect(sonnet.contextLength).toBe(200000)
    })

    it('should have correct context lengths for all models', () => {
      CLAUDE_MODELS.forEach(model => {
        expect(model.contextLength).toBe(200000)
      })
    })

    it('should have descriptions for all models', () => {
      CLAUDE_MODELS.forEach(model => {
        expect(model.description).toBeTruthy()
        expect(model.name).toBeTruthy()
      })
    })

    it('should include Haiku as fastest model', () => {
      const haiku = CLAUDE_MODELS.find(m => m.id.includes('haiku'))
      expect(haiku?.description).toContain('Fastest')
    })
  })

  describe('Message Conversion', () => {
    beforeEach(() => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-api-key',
      })
    })

    it('should convert human messages to user role', () => {
      const messages = [new HumanMessage('Hello')]
      const converted = anthropicChat['convertMessages'](messages)

      expect(converted.messages[0].role).toBe('user')
      expect(converted.messages[0].content).toBe('Hello')
    })

    it('should convert AI messages to assistant role', () => {
      const messages = [new AIMessage('Hi there')]
      const converted = anthropicChat['convertMessages'](messages)

      expect(converted.messages[0].role).toBe('assistant')
      expect(converted.messages[0].content).toBe('Hi there')
    })

    it('should extract system messages separately', () => {
      const messages = [
        new SystemMessage('You are a helpful assistant'),
        new HumanMessage('Hello'),
      ]
      const converted = anthropicChat['convertMessages'](messages)

      expect(converted.system).toBe('You are a helpful assistant')
      expect(converted.messages).toHaveLength(1)
      expect(converted.messages[0].role).toBe('user')
    })

    it('should combine multiple system messages', () => {
      const messages = [
        new SystemMessage('You are helpful'),
        new SystemMessage('You are concise'),
        new HumanMessage('Hello'),
      ]
      const converted = anthropicChat['convertMessages'](messages)

      expect(converted.system).toBe('You are helpful\n\nYou are concise')
    })

    it('should handle mixed message types', () => {
      const messages = [
        new SystemMessage('System prompt'),
        new HumanMessage('Question?'),
        new AIMessage('Answer.'),
        new HumanMessage('Follow-up?'),
      ]
      const converted = anthropicChat['convertMessages'](messages)

      expect(converted.system).toBe('System prompt')
      expect(converted.messages).toHaveLength(3)
      expect(converted.messages[0].role).toBe('user')
      expect(converted.messages[1].role).toBe('assistant')
      expect(converted.messages[2].role).toBe('user')
    })
  })

  describe('API Integration', () => {
    beforeEach(() => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-anthropic-key',
        temperature: 0.7,
        maxTokens: 2048,
      })
    })

    it('should make correct API request for non-streaming', async () => {
      const mockResponse = {
        content: [{ text: 'Hello! How can I help you?' }],
        usage: {
          input_tokens: 10,
          output_tokens: 15,
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const messages = [new HumanMessage('Hello')]
      await anthropicChat._generate(messages, {})

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [url, options] = (global.fetch as any).mock.calls[0]

      expect(url).toBe('https://api.anthropic.com/v1/messages')
      expect(options.method).toBe('POST')
      expect(options.headers['x-api-key']).toBe('test-anthropic-key')
      expect(options.headers['anthropic-version']).toBe('2023-06-01')
    })

    it('should include temperature and maxTokens in request', async () => {
      const mockResponse = {
        content: [{ text: 'Response' }],
        usage: { input_tokens: 5, output_tokens: 10 },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await anthropicChat._generate([new HumanMessage('Test')], {})

      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
      expect(requestBody.temperature).toBe(0.7)
      expect(requestBody.max_tokens).toBe(2048)
      expect(requestBody.model).toBe('claude-3-5-sonnet-20241022')
    })

    it('should handle topP and topK parameters', async () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-key',
        topP: 0.9,
        topK: 40,
      })

      const mockResponse = {
        content: [{ text: 'Response' }],
        usage: { input_tokens: 5, output_tokens: 10 },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await anthropicChat._generate([new HumanMessage('Test')], {})

      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
      expect(requestBody.top_p).toBe(0.9)
      expect(requestBody.top_k).toBe(40)
    })

    it('should include system message if present', async () => {
      const mockResponse = {
        content: [{ text: 'Response' }],
        usage: { input_tokens: 5, output_tokens: 10 },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const messages = [
        new SystemMessage('You are helpful'),
        new HumanMessage('Test'),
      ]
      await anthropicChat._generate(messages, {})

      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
      expect(requestBody.system).toBe('You are helpful')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-key',
      })
    })

    it('should throw error if API key is missing', async () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: undefined,
      })

      await expect(
        anthropicChat._generate([new HumanMessage('Test')], {})
      ).rejects.toThrow('Anthropic API key is required')
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      })

      await expect(
        anthropicChat._generate([new HumanMessage('Test')], {})
      ).rejects.toThrow('Anthropic API error: 401')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(
        anthropicChat._generate([new HumanMessage('Test')], {})
      ).rejects.toThrow('Network error')
    })
  })

  describe('Response Parsing', () => {
    beforeEach(() => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-key',
      })
    })

    it('should parse successful response correctly', async () => {
      const mockResponse = {
        content: [{ text: 'This is a test response' }],
        usage: {
          input_tokens: 20,
          output_tokens: 30,
        },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await anthropicChat._generate([new HumanMessage('Test')], {})

      expect(result.generations).toHaveLength(1)
      expect(result.generations[0].text).toBe('This is a test response')
      expect(result.llmOutput?.tokenUsage?.promptTokens).toBe(20)
      expect(result.llmOutput?.tokenUsage?.completionTokens).toBe(30)
      expect(result.llmOutput?.tokenUsage?.totalTokens).toBe(50)
    })

    it('should handle empty content', async () => {
      const mockResponse = {
        content: [],
        usage: { input_tokens: 5, output_tokens: 0 },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await anthropicChat._generate([new HumanMessage('Test')], {})

      expect(result.generations[0].text).toBe('')
    })
  })

  describe('Streaming Support', () => {
    beforeEach(() => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-key',
        streaming: true,
      })
    })

    it('should enable streaming when configured', () => {
      expect(anthropicChat.streaming).toBe(true)
    })

    it('should request streaming from API', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: {"type":"content_block_delta","delta":{"text":"Hi"}}\n')
          )
          controller.close()
        },
      })

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        body: mockStream,
      })

      const result = await anthropicChat._generate([new HumanMessage('Test')], {})

      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
      expect(requestBody.stream).toBe(true)
    })
  })

  describe('LangChain Compatibility', () => {
    it('should implement required BaseChatModel methods', () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-key',
      })

      expect(anthropicChat).toHaveProperty('_generate')
      expect(anthropicChat).toHaveProperty('_streamResponseChunks')
      expect(anthropicChat).toHaveProperty('_llmType')
      expect(anthropicChat).toHaveProperty('_combineLLMOutput')
    })

    it('should return correct LLM type', () => {
      anthropicChat = new ChatAnthropic({
        anthropicApiKey: 'test-key',
      })

      expect(anthropicChat._llmType()).toBe('anthropic')
    })

    it('should have static lc_name', () => {
      expect(ChatAnthropic.lc_name()).toBe('ChatAnthropic')
    })
  })
})
