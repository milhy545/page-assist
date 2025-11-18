import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChatMercury, MERCURY_MODELS } from '../ChatMercury'
import { HumanMessage } from '@langchain/core/messages'

describe('ChatMercury', () => {
  let mercuryChat: ChatMercury

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with default model', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-api-key',
      })

      expect(mercuryChat.modelName).toBe('mercury-coder')
      expect(mercuryChat._llmType()).toBe('mercury')
    })

    it('should accept custom model name', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-api-key',
        modelName: 'mercury-coder-mini',
      })

      expect(mercuryChat.modelName).toBe('mercury-coder-mini')
    })

    it('should accept temperature parameter', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-api-key',
        temperature: 0.5,
      })

      expect(mercuryChat.temperature).toBe(0.5)
    })

    it('should use Mercury base URL', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-api-key',
      })

      const config = mercuryChat.clientConfig
      expect(config.baseURL).toBe('https://api.mercuryai.com/v1')
    })

    it('should set API key correctly', () => {
      const apiKey = 'mercury-test-key-12345'
      mercuryChat = new ChatMercury({
        mercuryApiKey: apiKey,
      })

      expect(mercuryChat.openAIApiKey).toBe(apiKey)
    })
  })

  describe('Model Configuration', () => {
    it('should have all Mercury models defined', () => {
      expect(MERCURY_MODELS).toHaveLength(3)
      expect(MERCURY_MODELS[0].id).toBe('mercury-coder')
      expect(MERCURY_MODELS[1].id).toBe('mercury-coder-small')
      expect(MERCURY_MODELS[2].id).toBe('mercury-coder-mini')
    })

    it('should have correct context lengths for models', () => {
      const coderModel = MERCURY_MODELS.find(m => m.id === 'mercury-coder')
      const miniModel = MERCURY_MODELS.find(m => m.id === 'mercury-coder-mini')

      expect(coderModel?.contextLength).toBe(16384)
      expect(miniModel?.contextLength).toBe(8192)
    })

    it('should have descriptions for all models', () => {
      MERCURY_MODELS.forEach(model => {
        expect(model.description).toBeTruthy()
        expect(model.name).toBeTruthy()
      })
    })
  })

  describe('LangChain Integration', () => {
    it('should extend CustomChatOpenAI', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-key',
      })

      expect(mercuryChat).toHaveProperty('_generate')
      expect(mercuryChat).toHaveProperty('_streamResponseChunks')
      expect(mercuryChat).toHaveProperty('invocationParams')
    })

    it('should return correct LLM type', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-key',
      })

      expect(mercuryChat._llmType()).toBe('mercury')
    })

    it('should have static lc_name', () => {
      expect(ChatMercury.lc_name()).toBe('ChatMercury')
    })
  })

  describe('Invocation Parameters', () => {
    it('should generate correct invocation params', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-key',
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
      })

      const params = mercuryChat.invocationParams({})

      expect(params.model).toBe('mercury-coder')
      expect(params.temperature).toBe(0.7)
      expect(params.max_tokens).toBe(2048)
      expect(params.top_p).toBe(0.9)
    })

    it('should handle streaming parameter', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-key',
        streaming: true,
      })

      const params = mercuryChat.invocationParams({})
      expect(params.stream).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing API key gracefully', () => {
      expect(() => {
        mercuryChat = new ChatMercury({
          mercuryApiKey: undefined,
        })
      }).not.toThrow()
    })

    it('should have proper error configuration', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-key',
      })

      expect(mercuryChat.clientConfig.dangerouslyAllowBrowser).toBe(true)
    })
  })

  describe('OpenAI Compatibility', () => {
    it('should use OpenAI-compatible endpoint structure', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-key',
      })

      expect(mercuryChat.clientConfig.baseURL).toContain('/v1')
    })

    it('should support OpenAI-style parameters', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'test-key',
        frequencyPenalty: 0.5,
        presencePenalty: 0.3,
      })

      expect(mercuryChat.frequencyPenalty).toBe(0.5)
      expect(mercuryChat.presencePenalty).toBe(0.3)
    })
  })

  describe('Performance Characteristics', () => {
    it('should document ultra-fast inference in model descriptions', () => {
      const miniModel = MERCURY_MODELS.find(m => m.id === 'mercury-coder-mini')
      expect(miniModel?.description).toContain('1109 tokens/sec')
    })

    it('should indicate speed differences between models', () => {
      const smallModel = MERCURY_MODELS.find(m => m.id === 'mercury-coder-small')
      expect(smallModel?.description).toContain('737 tokens/sec')
    })
  })

  describe('Configuration Validation', () => {
    it('should accept all standard OpenAI parameters', () => {
      expect(() => {
        mercuryChat = new ChatMercury({
          mercuryApiKey: 'test-key',
          temperature: 0.8,
          maxTokens: 4096,
          topP: 0.95,
          frequencyPenalty: 0.2,
          presencePenalty: 0.1,
          n: 1,
          streaming: false,
        })
      }).not.toThrow()
    })

    it('should override openAIApiKey with mercuryApiKey', () => {
      mercuryChat = new ChatMercury({
        mercuryApiKey: 'mercury-key',
        openAIApiKey: 'openai-key',
      })

      // mercuryApiKey should take precedence
      expect(mercuryChat.openAIApiKey).toBe('mercury-key')
    })
  })
})
