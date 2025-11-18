/**
 * Image Generation Models
 *
 * Support for various image generation providers:
 * - DALL-E 3 (OpenAI)
 * - Stable Diffusion (Stability AI)
 * - Flux (Replicate)
 * - And more...
 */

export interface ImageGenerationParams {
  /**
   * Text prompt describing the image
   */
  prompt: string

  /**
   * Negative prompt (what to avoid)
   */
  negativePrompt?: string

  /**
   * Image width
   */
  width?: number

  /**
   * Image height
   */
  height?: number

  /**
   * Number of inference steps
   */
  steps?: number

  /**
   * Guidance scale (how closely to follow the prompt)
   */
  guidanceScale?: number

  /**
   * Random seed for reproducibility
   */
  seed?: number

  /**
   * Number of images to generate
   */
  numImages?: number

  /**
   * Image quality/style
   */
  quality?: "standard" | "hd"

  /**
   * Style preset
   */
  style?: "natural" | "vivid" | string
}

export interface ImageResult {
  /**
   * Generated image URL or base64 data
   */
  url?: string

  /**
   * Base64-encoded image data
   */
  b64_json?: string

  /**
   * Revised prompt (for DALL-E)
   */
  revisedPrompt?: string

  /**
   * Generation metadata
   */
  metadata?: Record<string, any>
}

export interface ImageGenerationProvider {
  /**
   * Provider name
   */
  name: string

  /**
   * Generate image(s) from prompt
   */
  generate(params: ImageGenerationParams): Promise<ImageResult[]>
}

/**
 * DALL-E 3 Image Generation (OpenAI)
 *
 * @example
 * ```typescript
 * const dalle = new DALLE3({
 *   apiKey: "your-openai-api-key",
 * })
 *
 * const images = await dalle.generate({
 *   prompt: "A serene landscape with mountains and a lake at sunset",
 *   quality: "hd",
 *   style: "vivid",
 * })
 * ```
 */
export class DALLE3 implements ImageGenerationProvider {
  name = "DALL-E 3"
  private apiKey: string
  private baseURL = "https://api.openai.com/v1"

  constructor(config: { apiKey: string; baseURL?: string }) {
    this.apiKey = config.apiKey
    if (config.baseURL) {
      this.baseURL = config.baseURL
    }
  }

  async generate(params: ImageGenerationParams): Promise<ImageResult[]> {
    const { prompt, quality = "standard", style = "vivid", numImages = 1 } = params

    // DALL-E 3 only supports 1 image per request
    const n = Math.min(numImages, 1)

    // Supported sizes: 1024x1024, 1792x1024, 1024x1792
    let size = "1024x1024"
    if (params.width && params.height) {
      if (params.width === 1792 && params.height === 1024) {
        size = "1792x1024"
      } else if (params.width === 1024 && params.height === 1792) {
        size = "1024x1792"
      }
    }

    const response = await fetch(`${this.baseURL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n,
        size,
        quality,
        style,
        response_format: "url", // or "b64_json"
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DALL-E 3 API error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    return data.data.map((item: any) => ({
      url: item.url,
      b64_json: item.b64_json,
      revisedPrompt: item.revised_prompt,
    }))
  }
}

/**
 * Stable Diffusion (Stability AI)
 *
 * @example
 * ```typescript
 * const sd = new StableDiffusion({
 *   apiKey: "your-stability-api-key",
 * })
 *
 * const images = await sd.generate({
 *   prompt: "A futuristic cityscape at night",
 *   negativePrompt: "blurry, low quality",
 *   width: 1024,
 *   height: 1024,
 *   steps: 30,
 * })
 * ```
 */
export class StableDiffusion implements ImageGenerationProvider {
  name = "Stable Diffusion"
  private apiKey: string
  private baseURL = "https://api.stability.ai/v2beta"
  private model = "stable-diffusion-xl-1024-v1-0"

  constructor(config: { apiKey: string; baseURL?: string; model?: string }) {
    this.apiKey = config.apiKey
    if (config.baseURL) {
      this.baseURL = config.baseURL
    }
    if (config.model) {
      this.model = config.model
    }
  }

  async generate(params: ImageGenerationParams): Promise<ImageResult[]> {
    const {
      prompt,
      negativePrompt,
      width = 1024,
      height = 1024,
      steps = 30,
      guidanceScale = 7.5,
      seed,
      numImages = 1,
    } = params

    const formData = new FormData()
    formData.append("prompt", prompt)
    if (negativePrompt) {
      formData.append("negative_prompt", negativePrompt)
    }
    formData.append("width", width.toString())
    formData.append("height", height.toString())
    formData.append("steps", steps.toString())
    formData.append("cfg_scale", guidanceScale.toString())
    if (seed !== undefined) {
      formData.append("seed", seed.toString())
    }
    formData.append("samples", numImages.toString())

    const response = await fetch(`${this.baseURL}/stable-image/generate/sd3`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Stability AI error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    if (data.artifacts) {
      return data.artifacts.map((artifact: any) => ({
        b64_json: artifact.base64,
        metadata: {
          seed: artifact.seed,
          finishReason: artifact.finishReason,
        },
      }))
    }

    return []
  }
}

/**
 * Flux (via Replicate)
 *
 * @example
 * ```typescript
 * const flux = new FluxReplicate({
 *   apiKey: "your-replicate-api-key",
 * })
 *
 * const images = await flux.generate({
 *   prompt: "A photo of an astronaut riding a horse on mars",
 * })
 * ```
 */
export class FluxReplicate implements ImageGenerationProvider {
  name = "Flux (Replicate)"
  private apiKey: string
  private model = "black-forest-labs/flux-1.1-pro"

  constructor(config: { apiKey: string; model?: string }) {
    this.apiKey = config.apiKey
    if (config.model) {
      this.model = config.model
    }
  }

  async generate(params: ImageGenerationParams): Promise<ImageResult[]> {
    const {
      prompt,
      width = 1024,
      height = 1024,
      steps = 28,
      guidanceScale = 3.5,
      seed,
    } = params

    // Create prediction
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        version: this.model,
        input: {
          prompt,
          width,
          height,
          num_inference_steps: steps,
          guidance_scale: guidanceScale,
          seed: seed,
        },
      }),
    })

    if (!createResponse.ok) {
      const error = await createResponse.text()
      throw new Error(`Replicate API error: ${createResponse.status} - ${error}`)
    }

    const prediction = await createResponse.json()

    // Poll for completion
    let result = prediction
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      result = await pollResponse.json()
    }

    if (result.status === "failed") {
      throw new Error(`Flux generation failed: ${result.error}`)
    }

    if (result.output && Array.isArray(result.output)) {
      return result.output.map((url: string) => ({ url }))
    }

    return []
  }
}

/**
 * Factory function to create image generation provider
 */
export function createImageProvider(
  provider: "dalle3" | "stable-diffusion" | "flux",
  apiKey: string,
  options?: any
): ImageGenerationProvider {
  switch (provider) {
    case "dalle3":
      return new DALLE3({ apiKey, ...options })
    case "stable-diffusion":
      return new StableDiffusion({ apiKey, ...options })
    case "flux":
      return new FluxReplicate({ apiKey, ...options })
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

/**
 * Available image generation models
 */
export const IMAGE_GENERATION_MODELS = {
  dalle3: {
    id: "dall-e-3",
    name: "DALL-E 3",
    provider: "OpenAI",
    description: "High-quality image generation from OpenAI",
    features: ["HD quality", "Vivid/Natural styles", "1024x1024, 1792x1024, 1024x1792"],
  },
  sd_xl: {
    id: "stable-diffusion-xl-1024-v1-0",
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    description: "Open-source diffusion model",
    features: ["Customizable", "High quality", "Various sizes"],
  },
  sd3: {
    id: "sd3",
    name: "Stable Diffusion 3",
    provider: "Stability AI",
    description: "Latest Stable Diffusion model",
    features: ["Improved quality", "Better prompt following"],
  },
  flux_pro: {
    id: "flux-1.1-pro",
    name: "Flux 1.1 Pro",
    provider: "Black Forest Labs (via Replicate)",
    description: "State-of-the-art image generation",
    features: ["Photorealistic", "Fast generation", "High quality"],
  },
  flux_dev: {
    id: "flux-dev",
    name: "Flux Dev",
    provider: "Black Forest Labs (via Replicate)",
    description: "Developer-friendly Flux model",
    features: ["Open weights", "Good quality", "Fast"],
  },
} as const
