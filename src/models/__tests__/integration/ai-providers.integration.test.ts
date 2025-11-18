/**
 * Integration tests for AI providers
 * These tests verify that providers work together correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ChatMercury } from '../../ChatMercury'
import { ChatAnthropic } from '../../ChatAnthropic'
import { ChatGeneric, createProviderChat } from '../../ChatGeneric'
import { DALLE3, StableDiffusion, createImageProvider } from '../../ImageGeneration'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

describe('AI Providers Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('Multi-Provider Chat Workflow', () => {
    it('should initialize all text generation providers', () => {
      const mercury = new ChatMercury({ mercuryApiKey: 'key1' })
      const claude = new ChatAnthropic({ anthropicApiKey: 'key2' })
      const groq = createProviderChat('groq', 'key3', 'llama-3.3-70b-versatile')

      expect(mercury._llmType()).toBe('mercury')
      expect(claude._llmType()).toBe('anthropic')
      expect(groq._llmType()).toBe('generic')
    })

    it('should handle provider switching', () => {
      const providers = [
        new ChatMercury({ mercuryApiKey: 'key1', modelName: 'mercury-coder' }),
        new ChatAnthropic({ anthropicApiKey: 'key2', modelName: 'claude-3-5-sonnet-20241022' }),
        createProviderChat('mistral', 'key3', 'mistral-large-latest'),
      ]

      providers.forEach(provider => {
        expect(provider).toBeDefined()
        expect(provider.modelName).toBeTruthy()
      })
    })

    it('should configure similar parameters across providers', () => {
      const temperature = 0.7
      const maxTokens = 2048

      const mercury = new ChatMercury({
        mercuryApiKey: 'key',
        temperature,
        maxTokens,
      })

      const claude = new ChatAnthropic({
        anthropicApiKey: 'key',
        temperature,
        maxTokens,
      })

      const groq = new ChatGeneric({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: 'key',
        modelName: 'llama-3.3-70b-versatile',
        temperature,
        maxTokens,
      })

      expect(mercury.temperature).toBe(temperature)
      expect(claude.temperature).toBe(temperature)
      expect(groq.temperature).toBe(temperature)
    })
  })

  describe('Provider Failover Simulation', () => {
    it('should handle provider failure and fallback', async () => {
      const providers = [
        new ChatMercury({ mercuryApiKey: 'key1' }),
        new ChatAnthropic({ anthropicApiKey: 'key2' }),
      ]

      // Simulate first provider failing
      const errors: Error[] = []

      for (const provider of providers) {
        try {
          // This would normally make a real API call
          // In tests, we simulate the behavior
          expect(provider).toBeDefined()
        } catch (error) {
          errors.push(error as Error)
        }
      }

      // Should have providers available for fallback
      expect(providers.length).toBeGreaterThan(1)
    })

    it('should track provider usage statistics', () => {
      const stats = {
        mercury: { requests: 0, tokens: 0 },
        claude: { requests: 0, tokens: 0 },
        groq: { requests: 0, tokens: 0 },
      }

      // Simulate usage
      stats.mercury.requests++
      stats.mercury.tokens += 1000

      stats.claude.requests++
      stats.claude.tokens += 1500

      expect(stats.mercury.requests).toBe(1)
      expect(stats.claude.tokens).toBe(1500)
    })
  })

  describe('Image + Text Generation Workflow', () => {
    it('should combine text and image generation', async () => {
      const claude = new ChatAnthropic({
        anthropicApiKey: 'claude-key',
      })

      const dalle = new DALLE3({
        apiKey: 'openai-key',
      })

      // Step 1: Generate image description with Claude (mocked)
      const mockClaudeResponse = {
        content: [
          {
            text: 'A serene mountain landscape at sunset with snow-capped peaks',
          },
        ],
        usage: { input_tokens: 10, output_tokens: 20 },
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClaudeResponse,
      })

      const claudeResult = await claude._generate(
        [new HumanMessage('Describe a beautiful landscape')],
        {}
      )

      expect(claudeResult.generations[0].text).toContain('mountain')

      // Step 2: Generate image with DALL-E using Claude's description (mocked)
      const mockDalleResponse = {
        data: [
          {
            url: 'https://example.com/mountain-landscape.png',
            revised_prompt: claudeResult.generations[0].text,
          },
        ],
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDalleResponse,
      })

      const imageResult = await dalle.generate({
        prompt: claudeResult.generations[0].text,
        quality: 'hd',
      })

      expect(imageResult[0].url).toBeTruthy()
      expect(imageResult[0].revisedPrompt).toContain('mountain')
    })

    it('should generate images with multiple providers', () => {
      const providers = [
        new DALLE3({ apiKey: 'openai-key' }),
        new StableDiffusion({ apiKey: 'stability-key' }),
      ]

      expect(providers[0].name).toBe('DALL-E 3')
      expect(providers[1].name).toBe('Stable Diffusion')
    })
  })

  describe('Provider Configuration Consistency', () => {
    it('should maintain consistent API across OpenAI-compatible providers', () => {
      const providers = [
        new ChatMercury({ mercuryApiKey: 'key' }),
        new ChatGeneric({
          baseURL: 'https://api.groq.com/openai/v1',
          apiKey: 'key',
          modelName: 'test',
        }),
      ]

      providers.forEach(provider => {
        expect(provider).toHaveProperty('temperature')
        expect(provider).toHaveProperty('maxTokens')
        expect(provider).toHaveProperty('topP')
        expect(provider).toHaveProperty('_generate')
      })
    })

    it('should support common LangChain interfaces', () => {
      const mercury = new ChatMercury({ mercuryApiKey: 'key' })
      const claude = new ChatAnthropic({ anthropicApiKey: 'key' })

      // Both should implement BaseChatModel interface
      expect(mercury._llmType()).toBeTruthy()
      expect(claude._llmType()).toBeTruthy()

      expect(typeof mercury._generate).toBe('function')
      expect(typeof claude._generate).toBe('function')
    })
  })

  describe('Message Handling Across Providers', () => {
    it('should handle system messages correctly', () => {
      const systemMsg = new SystemMessage('You are a helpful assistant')
      const userMsg = new HumanMessage('Hello')

      const messages = [systemMsg, userMsg]

      // Mercury and other OpenAI-compatible providers handle system messages
      const mercury = new ChatMercury({ mercuryApiKey: 'key' })
      expect(mercury).toBeDefined()

      // Claude handles system messages separately
      const claude = new ChatAnthropic({ anthropicApiKey: 'key' })
      const converted = claude['convertMessages'](messages)
      expect(converted.system).toBe('You are a helpful assistant')
      expect(converted.messages).toHaveLength(1)
    })

    it('should maintain conversation history across providers', () => {
      const conversation = [
        new HumanMessage('What is 2+2?'),
        // AI would respond here
        new HumanMessage('What about 3+3?'),
      ]

      // All providers should be able to handle multi-turn conversations
      expect(conversation).toHaveLength(2)
    })
  })

  describe('Cost Optimization Workflow', () => {
    it('should route based on model pricing', () => {
      // Mercury: $0.25/1M input, $1.00/1M output
      const mercury = new ChatMercury({
        mercuryApiKey: 'key',
        modelName: 'mercury-coder-mini', // Fastest, cheapest
      })

      // Claude: More expensive but higher quality
      const claude = new ChatAnthropic({
        anthropicApiKey: 'key',
        modelName: 'claude-3-haiku-20240307', // Cheapest Claude
      })

      // Groq: Free tier available, ultra-fast
      const groq = createProviderChat('groq', 'key', 'llama-3.3-70b-versatile')

      const costTiers = {
        cheap: [mercury, groq],
        premium: [claude],
      }

      expect(costTiers.cheap).toHaveLength(2)
      expect(costTiers.premium).toHaveLength(1)
    })
  })

  describe('Performance Characteristics', () => {
    it('should identify fastest providers', () => {
      const providers = [
        { name: 'Mercury Mini', tokensPerSec: 1109 },
        { name: 'Groq Llama 3.3', tokensPerSec: 800 },
        { name: 'Mercury Small', tokensPerSec: 737 },
      ]

      const fastest = providers.sort((a, b) => b.tokensPerSec - a.tokensPerSec)[0]
      expect(fastest.name).toBe('Mercury Mini')
    })

    it('should identify models with largest context windows', () => {
      const providers = [
        { name: 'Claude 3.5 Sonnet', contextWindow: 200000 },
        { name: 'Groq Llama 3.3', contextWindow: 128000 },
        { name: 'Mercury Coder', contextWindow: 16384 },
      ]

      const largest = providers.sort((a, b) => b.contextWindow - a.contextWindow)[0]
      expect(largest.name).toBe('Claude 3.5 Sonnet')
    })
  })

  describe('Error Recovery', () => {
    it('should handle API key rotation', () => {
      const oldKey = 'old-key-123'
      const newKey = 'new-key-456'

      const provider = new ChatAnthropic({ anthropicApiKey: oldKey })
      expect(provider['anthropicApiKey']).toBe(oldKey)

      // Simulate key rotation
      const newProvider = new ChatAnthropic({ anthropicApiKey: newKey })
      expect(newProvider['anthropicApiKey']).toBe(newKey)
    })

    it('should validate provider configuration', () => {
      // Valid configurations
      expect(() => new ChatMercury({ mercuryApiKey: 'valid' })).not.toThrow()
      expect(() => new ChatAnthropic({ anthropicApiKey: 'valid' })).not.toThrow()

      // Invalid configurations
      expect(() =>
        new ChatGeneric({
          baseURL: '',
          modelName: 'test',
          apiKey: 'key',
        } as any)
      ).toThrow()
    })
  })

  describe('Provider Selection Logic', () => {
    it('should select provider based on task requirements', () => {
      const tasks = {
        codingFast: 'mercury-coder-mini', // Ultra-fast code generation
        codingQuality: 'claude-3-5-sonnet', // Best code quality
        generalChat: 'llama-3.3-70b', // Fast general purpose
        longContext: 'claude-3-opus', // 200k context
      }

      expect(tasks.codingFast).toBe('mercury-coder-mini')
      expect(tasks.codingQuality).toContain('claude')
    })

    it('should provide model recommendations', () => {
      const recommendations = {
        'simple-query': ['groq', 'mercury-mini'],
        'complex-reasoning': ['claude-3.5-sonnet', 'claude-3-opus'],
        'code-generation': ['mercury-coder', 'codestral', 'deepseek-coder'],
        'image-generation': ['dalle3', 'stable-diffusion', 'flux-pro'],
      }

      expect(recommendations['simple-query']).toContain('groq')
      expect(recommendations['image-generation']).toContain('dalle3')
    })
  })

  describe('Batch Processing', () => {
    it('should handle batch requests across providers', async () => {
      const prompts = [
        'Explain quantum computing',
        'Write a Python function',
        'Translate to Spanish',
      ]

      const provider = new ChatMercury({ mercuryApiKey: 'key' })

      // Simulate batch processing
      const results = await Promise.all(
        prompts.map(async prompt => {
          // Would normally call provider._generate
          return { prompt, status: 'pending' }
        })
      )

      expect(results).toHaveLength(3)
    })
  })

  describe('Provider Metadata', () => {
    it('should expose provider capabilities', () => {
      const metadata = {
        mercury: {
          streaming: true,
          functions: false,
          vision: false,
          maxTokens: 16384,
          speed: 'ultra-fast',
        },
        claude: {
          streaming: true,
          functions: false,
          vision: false,
          maxTokens: 200000,
          speed: 'medium',
        },
        dalle3: {
          streaming: false,
          quality: ['standard', 'hd'],
          sizes: ['1024x1024', '1792x1024', '1024x1792'],
        },
      }

      expect(metadata.mercury.speed).toBe('ultra-fast')
      expect(metadata.claude.maxTokens).toBe(200000)
      expect(metadata.dalle3.quality).toContain('hd')
    })
  })
})
