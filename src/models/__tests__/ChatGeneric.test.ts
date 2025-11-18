import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  ChatGeneric,
  GENERIC_PROVIDERS,
  createProviderChat,
} from '../ChatGeneric'

describe('ChatGeneric', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Constructor and Configuration', () => {
    it('should require baseURL', () => {
      expect(() => {
        new ChatGeneric({
          baseURL: '',
          modelName: 'test-model',
          apiKey: 'test-key',
        } as any)
      }).toThrow('baseURL is required')
    })

    it('should initialize with required parameters', () => {
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: 'test-model',
        apiKey: 'test-key',
      })

      expect(chat.modelName).toBe('test-model')
      expect(chat.providerName).toBe('Generic Provider')
    })

    it('should accept custom provider name', () => {
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: 'test-model',
        apiKey: 'test-key',
        providerName: 'Custom Provider',
      })

      expect(chat.providerName).toBe('Custom Provider')
    })

    it('should set baseURL correctly', () => {
      const baseURL = 'https://api.groq.com/openai/v1'
      const chat = new ChatGeneric({
        baseURL,
        modelName: 'llama-3.3-70b-versatile',
        apiKey: 'test-key',
      })

      expect(chat.clientConfig.baseURL).toBe(baseURL)
    })

    it('should handle custom headers', () => {
      const headers = { 'X-Custom-Header': 'value' }
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: 'test-model',
        apiKey: 'test-key',
        headers,
      })

      expect(chat.clientConfig.baseOptions?.headers).toEqual(headers)
    })
  })

  describe('LLM Type', () => {
    it('should return generic as LLM type', () => {
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: 'test-model',
        apiKey: 'test-key',
      })

      expect(chat._llmType()).toBe('generic')
    })

    it('should have static lc_name', () => {
      expect(ChatGeneric.lc_name()).toBe('ChatGeneric')
    })
  })

  describe('Provider Presets', () => {
    it('should have Mistral AI preset', () => {
      expect(GENERIC_PROVIDERS.mistral).toBeDefined()
      expect(GENERIC_PROVIDERS.mistral.name).toBe('Mistral AI')
      expect(GENERIC_PROVIDERS.mistral.baseURL).toBe('https://api.mistral.ai/v1')
      expect(GENERIC_PROVIDERS.mistral.models.length).toBeGreaterThan(0)
    })

    it('should have Groq preset', () => {
      expect(GENERIC_PROVIDERS.groq).toBeDefined()
      expect(GENERIC_PROVIDERS.groq.name).toBe('Groq')
      expect(GENERIC_PROVIDERS.groq.baseURL).toBe('https://api.groq.com/openai/v1')
      expect(GENERIC_PROVIDERS.groq.description).toContain('Ultra-fast')
    })

    it('should have Together AI preset', () => {
      expect(GENERIC_PROVIDERS.together).toBeDefined()
      expect(GENERIC_PROVIDERS.together.name).toBe('Together AI')
      expect(GENERIC_PROVIDERS.together.baseURL).toBe('https://api.together.xyz/v1')
      expect(GENERIC_PROVIDERS.together.description).toContain('100+')
    })

    it('should have Perplexity preset', () => {
      expect(GENERIC_PROVIDERS.perplexity).toBeDefined()
      expect(GENERIC_PROVIDERS.perplexity.description).toContain('real-time search')
    })

    it('should have DeepSeek preset', () => {
      expect(GENERIC_PROVIDERS.deepseek).toBeDefined()
      expect(GENERIC_PROVIDERS.deepseek.baseURL).toBe('https://api.deepseek.com/v1')
    })

    it('should have Fireworks AI preset', () => {
      expect(GENERIC_PROVIDERS.fireworks).toBeDefined()
      expect(GENERIC_PROVIDERS.fireworks.baseURL).toContain('fireworks.ai')
    })
  })

  describe('Mistral AI Models', () => {
    it('should have mistral-large model', () => {
      const model = GENERIC_PROVIDERS.mistral.models.find(
        m => m.id === 'mistral-large-latest'
      )
      expect(model).toBeDefined()
      expect(model?.name).toBe('Mistral Large')
      expect(model?.contextLength).toBe(128000)
    })

    it('should have codestral model', () => {
      const model = GENERIC_PROVIDERS.mistral.models.find(
        m => m.id === 'codestral-latest'
      )
      expect(model).toBeDefined()
      expect(model?.description).toContain('code generation')
    })

    it('should have all required model properties', () => {
      GENERIC_PROVIDERS.mistral.models.forEach(model => {
        expect(model.id).toBeTruthy()
        expect(model.name).toBeTruthy()
        expect(model.description).toBeTruthy()
        expect(model.contextLength).toBeGreaterThan(0)
      })
    })
  })

  describe('Groq Models', () => {
    it('should have Llama 3.3 70B model', () => {
      const model = GENERIC_PROVIDERS.groq.models.find(
        m => m.id === 'llama-3.3-70b-versatile'
      )
      expect(model).toBeDefined()
      expect(model?.name).toContain('Llama 3.3')
      expect(model?.contextLength).toBe(128000)
    })

    it('should have Mixtral model', () => {
      const model = GENERIC_PROVIDERS.groq.models.find(
        m => m.id === 'mixtral-8x7b-32768'
      )
      expect(model).toBeDefined()
      expect(model?.description).toContain('Mixture of Experts')
    })

    it('should have Gemma model', () => {
      const model = GENERIC_PROVIDERS.groq.models.find(
        m => m.id === 'gemma2-9b-it'
      )
      expect(model).toBeDefined()
      expect(model?.description).toContain('Google')
    })
  })

  describe('Together AI Models', () => {
    it('should have Llama 3.1 405B model', () => {
      const model = GENERIC_PROVIDERS.together.models.find(
        m => m.id.includes('Meta-Llama-3.1-405B')
      )
      expect(model).toBeDefined()
      expect(model?.name).toContain('405B')
    })

    it('should have Mixtral 8x22B model', () => {
      const model = GENERIC_PROVIDERS.together.models.find(
        m => m.id.includes('Mixtral-8x22B')
      )
      expect(model).toBeDefined()
      expect(model?.description).toContain('MoE')
    })

    it('should have Qwen model', () => {
      const model = GENERIC_PROVIDERS.together.models.find(
        m => m.id.includes('Qwen2.5')
      )
      expect(model).toBeDefined()
      expect(model?.description).toContain('Alibaba')
    })
  })

  describe('createProviderChat Helper', () => {
    it('should create Mistral chat instance', () => {
      const chat = createProviderChat(
        'mistral',
        'test-api-key',
        'mistral-large-latest'
      )

      expect(chat).toBeInstanceOf(ChatGeneric)
      expect(chat.providerName).toBe('Mistral AI')
      expect(chat.modelName).toBe('mistral-large-latest')
      expect(chat.clientConfig.baseURL).toBe('https://api.mistral.ai/v1')
    })

    it('should create Groq chat instance', () => {
      const chat = createProviderChat(
        'groq',
        'test-api-key',
        'llama-3.3-70b-versatile'
      )

      expect(chat.providerName).toBe('Groq')
      expect(chat.clientConfig.baseURL).toBe('https://api.groq.com/openai/v1')
    })

    it('should create Together AI chat instance', () => {
      const chat = createProviderChat(
        'together',
        'test-api-key',
        'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
      )

      expect(chat.providerName).toBe('Together AI')
    })

    it('should accept additional options', () => {
      const chat = createProviderChat(
        'mistral',
        'test-api-key',
        'mistral-large-latest',
        {
          temperature: 0.5,
          maxTokens: 2048,
        }
      )

      expect(chat.temperature).toBe(0.5)
      expect(chat.maxTokens).toBe(2048)
    })
  })

  describe('OpenAI Compatibility', () => {
    it('should support OpenAI-compatible parameters', () => {
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: 'test-model',
        apiKey: 'test-key',
        temperature: 0.7,
        maxTokens: 4096,
        topP: 0.9,
        frequencyPenalty: 0.5,
        presencePenalty: 0.3,
      })

      expect(chat.temperature).toBe(0.7)
      expect(chat.maxTokens).toBe(4096)
      expect(chat.topP).toBe(0.9)
      expect(chat.frequencyPenalty).toBe(0.5)
      expect(chat.presencePenalty).toBe(0.3)
    })

    it('should set API key correctly', () => {
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: 'test-model',
        apiKey: 'my-secret-key',
      })

      expect(chat.openAIApiKey).toBe('my-secret-key')
    })

    it('should support streaming', () => {
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: 'test-model',
        apiKey: 'test-key',
        streaming: true,
      })

      expect(chat.streaming).toBe(true)
    })
  })

  describe('Model Metadata', () => {
    it('should provide context length for all models', () => {
      Object.values(GENERIC_PROVIDERS).forEach(provider => {
        provider.models.forEach(model => {
          expect(model.contextLength).toBeGreaterThan(0)
          expect(typeof model.contextLength).toBe('number')
        })
      })
    })

    it('should have unique model IDs within each provider', () => {
      Object.values(GENERIC_PROVIDERS).forEach(provider => {
        const ids = provider.models.map(m => m.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
      })
    })
  })

  describe('Error Handling', () => {
    it('should throw error when baseURL is missing', () => {
      expect(() => {
        new ChatGeneric({
          baseURL: undefined as any,
          modelName: 'test-model',
          apiKey: 'test-key',
        })
      }).toThrow()
    })

    it('should handle missing model name gracefully', () => {
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: undefined as any,
        apiKey: 'test-key',
      })

      expect(chat.modelName).toBeDefined()
    })
  })

  describe('Custom Headers', () => {
    it('should merge custom headers with defaults', () => {
      const chat = new ChatGeneric({
        baseURL: 'https://api.example.com/v1',
        modelName: 'test-model',
        apiKey: 'test-key',
        headers: {
          'X-Custom': 'value',
          'X-Another': 'header',
        },
      })

      expect(chat.clientConfig.baseOptions?.headers).toEqual({
        'X-Custom': 'value',
        'X-Another': 'header',
      })
    })

    it('should work without custom headers', () => {
      expect(() => {
        new ChatGeneric({
          baseURL: 'https://api.example.com/v1',
          modelName: 'test-model',
          apiKey: 'test-key',
        })
      }).not.toThrow()
    })
  })

  describe('Real-world Usage Examples', () => {
    it('should configure for Groq ultra-fast inference', () => {
      const groq = createProviderChat(
        'groq',
        'gsk_test123',
        'llama-3.3-70b-versatile',
        { temperature: 0.2 }
      )

      expect(groq.providerName).toBe('Groq')
      expect(groq.clientConfig.baseURL).toContain('groq.com')
      expect(groq.temperature).toBe(0.2)
    })

    it('should configure for Mistral code generation', () => {
      const mistral = createProviderChat(
        'mistral',
        'mistral_test123',
        'codestral-latest'
      )

      expect(mistral.providerName).toBe('Mistral AI')
      expect(mistral.modelName).toBe('codestral-latest')
    })

    it('should configure for Together AI with custom settings', () => {
      const together = new ChatGeneric({
        providerName: 'Together AI',
        baseURL: GENERIC_PROVIDERS.together.baseURL,
        apiKey: 'together_test123',
        modelName: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
        temperature: 0.8,
        maxTokens: 8192,
      })

      expect(together.providerName).toBe('Together AI')
      expect(together.temperature).toBe(0.8)
      expect(together.maxTokens).toBe(8192)
    })
  })
})
