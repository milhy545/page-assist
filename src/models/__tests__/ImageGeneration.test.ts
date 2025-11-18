import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  DALLE3,
  StableDiffusion,
  FluxReplicate,
  createImageProvider,
  IMAGE_GENERATION_MODELS,
  type ImageGenerationParams,
} from '../ImageGeneration'

describe('Image Generation Models', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('IMAGE_GENERATION_MODELS Configuration', () => {
    it('should have all image generation models defined', () => {
      expect(Object.keys(IMAGE_GENERATION_MODELS)).toHaveLength(5)
    })

    it('should have DALL-E 3 model', () => {
      const dalle = IMAGE_GENERATION_MODELS.dalle3
      expect(dalle.id).toBe('dall-e-3')
      expect(dalle.provider).toBe('OpenAI')
      expect(dalle.features).toContain('HD quality')
    })

    it('should have Stable Diffusion models', () => {
      const sdxl = IMAGE_GENERATION_MODELS.sd_xl
      const sd3 = IMAGE_GENERATION_MODELS.sd3

      expect(sdxl.provider).toBe('Stability AI')
      expect(sd3.name).toBe('Stable Diffusion 3')
    })

    it('should have Flux models', () => {
      const fluxPro = IMAGE_GENERATION_MODELS.flux_pro
      const fluxDev = IMAGE_GENERATION_MODELS.flux_dev

      expect(fluxPro.id).toBe('flux-1.1-pro')
      expect(fluxDev.features).toContain('Open weights')
    })
  })

  describe('DALLE3', () => {
    let dalle: DALLE3

    beforeEach(() => {
      dalle = new DALLE3({
        apiKey: 'test-openai-key',
      })
    })

    describe('Constructor', () => {
      it('should initialize with API key', () => {
        expect(dalle).toBeInstanceOf(DALLE3)
        expect(dalle.name).toBe('DALL-E 3')
      })

      it('should use default base URL', () => {
        expect(dalle['baseURL']).toBe('https://api.openai.com/v1')
      })

      it('should accept custom base URL', () => {
        const customDalle = new DALLE3({
          apiKey: 'test-key',
          baseURL: 'https://custom.openai.com/v1',
        })
        expect(customDalle['baseURL']).toBe('https://custom.openai.com/v1')
      })
    })

    describe('Image Generation', () => {
      it('should generate image with basic parameters', async () => {
        const mockResponse = {
          data: [
            {
              url: 'https://example.com/image.png',
              revised_prompt: 'A beautiful landscape',
            },
          ],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const result = await dalle.generate({
          prompt: 'A beautiful landscape',
        })

        expect(result).toHaveLength(1)
        expect(result[0].url).toBe('https://example.com/image.png')
        expect(result[0].revisedPrompt).toBe('A beautiful landscape')
      })

      it('should include quality parameter', async () => {
        const mockResponse = {
          data: [{ url: 'https://example.com/hd-image.png' }],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        await dalle.generate({
          prompt: 'HD quality image',
          quality: 'hd',
        })

        const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
        expect(requestBody.quality).toBe('hd')
      })

      it('should include style parameter', async () => {
        const mockResponse = {
          data: [{ url: 'https://example.com/vivid-image.png' }],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        await dalle.generate({
          prompt: 'Vivid style image',
          style: 'vivid',
        })

        const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
        expect(requestBody.style).toBe('vivid')
      })

      it('should handle different sizes', async () => {
        const mockResponse = {
          data: [{ url: 'https://example.com/wide-image.png' }],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        await dalle.generate({
          prompt: 'Wide image',
          width: 1792,
          height: 1024,
        })

        const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
        expect(requestBody.size).toBe('1792x1024')
      })

      it('should default to 1024x1024 for invalid sizes', async () => {
        const mockResponse = {
          data: [{ url: 'https://example.com/image.png' }],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        await dalle.generate({
          prompt: 'Custom size',
          width: 800,
          height: 600,
        })

        const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
        expect(requestBody.size).toBe('1024x1024')
      })

      it('should limit to 1 image per request', async () => {
        const mockResponse = {
          data: [{ url: 'https://example.com/image.png' }],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        await dalle.generate({
          prompt: 'Multiple images',
          numImages: 5, // Should be capped to 1
        })

        const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
        expect(requestBody.n).toBe(1)
      })
    })

    describe('Error Handling', () => {
      it('should throw on API error', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 401,
          text: async () => 'Unauthorized',
        })

        await expect(
          dalle.generate({ prompt: 'Test' })
        ).rejects.toThrow('DALL-E 3 API error: 401')
      })

      it('should include error details', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Bad request: Invalid prompt',
        })

        await expect(
          dalle.generate({ prompt: 'Test' })
        ).rejects.toThrow('Invalid prompt')
      })
    })
  })

  describe('StableDiffusion', () => {
    let sd: StableDiffusion

    beforeEach(() => {
      sd = new StableDiffusion({
        apiKey: 'test-stability-key',
      })
    })

    describe('Constructor', () => {
      it('should initialize with API key', () => {
        expect(sd).toBeInstanceOf(StableDiffusion)
        expect(sd.name).toBe('Stable Diffusion')
      })

      it('should use default base URL', () => {
        expect(sd['baseURL']).toBe('https://api.stability.ai/v2beta')
      })

      it('should use default model', () => {
        expect(sd['model']).toBe('stable-diffusion-xl-1024-v1-0')
      })

      it('should accept custom model', () => {
        const customSd = new StableDiffusion({
          apiKey: 'test-key',
          model: 'sd3',
        })
        expect(customSd['model']).toBe('sd3')
      })
    })

    describe('Image Generation', () => {
      it('should generate image with all parameters', async () => {
        const mockResponse = {
          artifacts: [
            {
              base64: 'base64encodedimage',
              seed: 12345,
              finishReason: 'SUCCESS',
            },
          ],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const result = await sd.generate({
          prompt: 'A futuristic city',
          negativePrompt: 'blurry, low quality',
          width: 1024,
          height: 1024,
          steps: 30,
          guidanceScale: 7.5,
          seed: 12345,
        })

        expect(result).toHaveLength(1)
        expect(result[0].b64_json).toBe('base64encodedimage')
        expect(result[0].metadata?.seed).toBe(12345)
        expect(result[0].metadata?.finishReason).toBe('SUCCESS')
      })

      it('should include negative prompt', async () => {
        const mockResponse = {
          artifacts: [{ base64: 'image' }],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        await sd.generate({
          prompt: 'Beautiful landscape',
          negativePrompt: 'ugly, distorted',
        })

        const formData = (global.fetch as any).mock.calls[0][1].body
        expect(formData).toBeInstanceOf(FormData)
      })

      it('should use default parameters when not specified', async () => {
        const mockResponse = {
          artifacts: [{ base64: 'image' }],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        await sd.generate({
          prompt: 'Simple prompt',
        })

        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      it('should generate multiple images', async () => {
        const mockResponse = {
          artifacts: [
            { base64: 'image1' },
            { base64: 'image2' },
            { base64: 'image3' },
          ],
        }

        ;(global.fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        })

        const result = await sd.generate({
          prompt: 'Multiple images',
          numImages: 3,
        })

        expect(result).toHaveLength(3)
      })
    })

    describe('Error Handling', () => {
      it('should throw on API error', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 403,
          text: async () => 'Forbidden',
        })

        await expect(
          sd.generate({ prompt: 'Test' })
        ).rejects.toThrow('Stability AI error: 403')
      })
    })
  })

  describe('FluxReplicate', () => {
    let flux: FluxReplicate

    beforeEach(() => {
      flux = new FluxReplicate({
        apiKey: 'test-replicate-key',
      })
    })

    describe('Constructor', () => {
      it('should initialize with API key', () => {
        expect(flux).toBeInstanceOf(FluxReplicate)
        expect(flux.name).toBe('Flux (Replicate)')
      })

      it('should use default model', () => {
        expect(flux['model']).toBe('black-forest-labs/flux-1.1-pro')
      })

      it('should accept custom model', () => {
        const customFlux = new FluxReplicate({
          apiKey: 'test-key',
          model: 'flux-dev',
        })
        expect(customFlux['model']).toBe('flux-dev')
      })
    })

    describe('Image Generation with Polling', () => {
      it('should create prediction and poll for completion', async () => {
        // Mock prediction creation
        const createResponse = {
          id: 'pred-123',
          status: 'starting',
        }

        // Mock polling responses
        const pollingResponses = [
          { id: 'pred-123', status: 'processing' },
          { id: 'pred-123', status: 'processing' },
          {
            id: 'pred-123',
            status: 'succeeded',
            output: ['https://example.com/flux-image.png'],
          },
        ]

        ;(global.fetch as any)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => createResponse,
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => pollingResponses[0],
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => pollingResponses[1],
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => pollingResponses[2],
          })

        const result = await flux.generate({
          prompt: 'An astronaut on Mars',
        })

        expect(result).toHaveLength(1)
        expect(result[0].url).toBe('https://example.com/flux-image.png')
        expect(global.fetch).toHaveBeenCalledTimes(4) // 1 create + 3 polls
      })

      it('should include all generation parameters', async () => {
        ;(global.fetch as any)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'pred-123', status: 'starting' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              id: 'pred-123',
              status: 'succeeded',
              output: ['https://example.com/image.png'],
            }),
          })

        await flux.generate({
          prompt: 'Detailed prompt',
          width: 1024,
          height: 768,
          steps: 28,
          guidanceScale: 3.5,
          seed: 42,
        })

        const createRequest = JSON.parse((global.fetch as any).mock.calls[0][1].body)
        expect(createRequest.input.prompt).toBe('Detailed prompt')
        expect(createRequest.input.width).toBe(1024)
        expect(createRequest.input.height).toBe(768)
        expect(createRequest.input.num_inference_steps).toBe(28)
        expect(createRequest.input.guidance_scale).toBe(3.5)
        expect(createRequest.input.seed).toBe(42)
      })

      it('should handle failed predictions', async () => {
        ;(global.fetch as any)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'pred-123', status: 'starting' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              id: 'pred-123',
              status: 'failed',
              error: 'Generation failed',
            }),
          })

        await expect(
          flux.generate({ prompt: 'Test' })
        ).rejects.toThrow('Flux generation failed')
      })

      it('should handle API errors during creation', async () => {
        ;(global.fetch as any).mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: async () => 'Rate limit exceeded',
        })

        await expect(
          flux.generate({ prompt: 'Test' })
        ).rejects.toThrow('Replicate API error: 429')
      })

      it('should return multiple images from output', async () => {
        ;(global.fetch as any)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'pred-123', status: 'starting' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              id: 'pred-123',
              status: 'succeeded',
              output: [
                'https://example.com/image1.png',
                'https://example.com/image2.png',
              ],
            }),
          })

        const result = await flux.generate({ prompt: 'Test' })
        expect(result).toHaveLength(2)
      })
    })
  })

  describe('createImageProvider Factory', () => {
    it('should create DALL-E 3 provider', () => {
      const provider = createImageProvider('dalle3', 'test-key')
      expect(provider).toBeInstanceOf(DALLE3)
      expect(provider.name).toBe('DALL-E 3')
    })

    it('should create Stable Diffusion provider', () => {
      const provider = createImageProvider('stable-diffusion', 'test-key')
      expect(provider).toBeInstanceOf(StableDiffusion)
      expect(provider.name).toBe('Stable Diffusion')
    })

    it('should create Flux provider', () => {
      const provider = createImageProvider('flux', 'test-key')
      expect(provider).toBeInstanceOf(FluxReplicate)
      expect(provider.name).toBe('Flux (Replicate)')
    })

    it('should pass options to provider', () => {
      const provider = createImageProvider('dalle3', 'test-key', {
        baseURL: 'https://custom.url',
      }) as DALLE3

      expect(provider['baseURL']).toBe('https://custom.url')
    })

    it('should throw on unknown provider', () => {
      expect(() => {
        createImageProvider('unknown' as any, 'test-key')
      }).toThrow('Unknown provider')
    })
  })

  describe('ImageGenerationParams Interface', () => {
    it('should accept minimal parameters', () => {
      const params: ImageGenerationParams = {
        prompt: 'A simple test',
      }
      expect(params.prompt).toBe('A simple test')
    })

    it('should accept all optional parameters', () => {
      const params: ImageGenerationParams = {
        prompt: 'Complex generation',
        negativePrompt: 'bad quality',
        width: 1024,
        height: 768,
        steps: 30,
        guidanceScale: 7.5,
        seed: 42,
        numImages: 2,
        quality: 'hd',
        style: 'vivid',
      }

      expect(params).toHaveProperty('prompt')
      expect(params).toHaveProperty('negativePrompt')
      expect(params).toHaveProperty('width')
      expect(params).toHaveProperty('height')
    })
  })
})
