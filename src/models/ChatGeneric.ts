/**
 * Generic OpenAI-Compatible Chat Model
 *
 * Supports any AI provider with OpenAI-compatible API:
 * - Mistral AI
 * - Groq (ultra-fast inference)
 * - Together AI
 * - Perplexity
 * - DeepSeek
 * - And many more...
 */

import { CustomChatOpenAI } from "./CustomChatOpenAI"
import type { OpenAIChatInput } from "@langchain/openai"
import type { BaseChatModelParams } from "@langchain/core/language_models/chat_models"

export interface ChatGenericInput extends Partial<OpenAIChatInput>, BaseChatModelParams {
  /**
   * API key for the provider
   */
  apiKey?: string

  /**
   * Base URL for the API endpoint
   */
  baseURL: string

  /**
   * Model identifier
   */
  modelName: string

  /**
   * Provider name (for identification)
   */
  providerName?: string

  /**
   * Custom headers
   */
  headers?: Record<string, string>
}

/**
 * Generic chat model for OpenAI-compatible APIs
 *
 * @example
 * // Mistral AI
 * const mistral = new ChatGeneric({
 *   providerName: "Mistral AI",
 *   baseURL: "https://api.mistral.ai/v1",
 *   apiKey: "your-api-key",
 *   modelName: "mistral-large-latest",
 * })
 *
 * // Groq (ultra-fast)
 * const groq = new ChatGeneric({
 *   providerName: "Groq",
 *   baseURL: "https://api.groq.com/openai/v1",
 *   apiKey: "your-api-key",
 *   modelName: "llama-3.3-70b-versatile",
 * })
 *
 * // Together AI
 * const together = new ChatGeneric({
 *   providerName: "Together AI",
 *   baseURL: "https://api.together.xyz/v1",
 *   apiKey: "your-api-key",
 *   modelName: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
 * })
 */
export class ChatGeneric extends CustomChatOpenAI {
  providerName: string

  constructor(fields: ChatGenericInput) {
    if (!fields.baseURL) {
      throw new Error("baseURL is required for ChatGeneric")
    }

    const config = {
      ...fields,
      openAIApiKey: fields.apiKey,
      modelName: fields.modelName,
      configuration: {
        basePath: fields.baseURL,
        baseOptions: {
          headers: fields.headers || {},
        },
      },
    }

    super(config as any)
    this.providerName = fields.providerName || "Generic Provider"
  }

  _llmType(): string {
    return "generic"
  }

  static lc_name() {
    return "ChatGeneric"
  }
}

/**
 * Preset configurations for popular providers
 */
export const GENERIC_PROVIDERS = {
  mistral: {
    name: "Mistral AI",
    baseURL: "https://api.mistral.ai/v1",
    models: [
      {
        id: "mistral-large-latest",
        name: "Mistral Large",
        description: "Most capable Mistral model",
        contextLength: 128000,
      },
      {
        id: "mistral-medium-latest",
        name: "Mistral Medium",
        description: "Balanced performance",
        contextLength: 32000,
      },
      {
        id: "mistral-small-latest",
        name: "Mistral Small",
        description: "Fast and efficient",
        contextLength: 32000,
      },
      {
        id: "codestral-latest",
        name: "Codestral",
        description: "Specialized for code generation",
        contextLength: 32000,
      },
    ],
  },

  groq: {
    name: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    description: "Ultra-fast LLM inference (up to 800 tokens/sec)",
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        description: "Latest Llama model, highly versatile",
        contextLength: 128000,
      },
      {
        id: "llama-3.1-70b-versatile",
        name: "Llama 3.1 70B",
        description: "Powerful open model",
        contextLength: 131072,
      },
      {
        id: "mixtral-8x7b-32768",
        name: "Mixtral 8x7B",
        description: "Mixture of Experts model",
        contextLength: 32768,
      },
      {
        id: "gemma2-9b-it",
        name: "Gemma 2 9B",
        description: "Google's efficient model",
        contextLength: 8192,
      },
    ],
  },

  together: {
    name: "Together AI",
    baseURL: "https://api.together.xyz/v1",
    description: "Access to 100+ open-source models",
    models: [
      {
        id: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        name: "Llama 3.1 405B",
        description: "Largest Llama model",
        contextLength: 130000,
      },
      {
        id: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        name: "Llama 3.1 70B Turbo",
        description: "Fast and powerful",
        contextLength: 131072,
      },
      {
        id: "mistralai/Mixtral-8x22B-Instruct-v0.1",
        name: "Mixtral 8x22B",
        description: "Large MoE model",
        contextLength: 65536,
      },
      {
        id: "Qwen/Qwen2.5-72B-Instruct-Turbo",
        name: "Qwen 2.5 72B",
        description: "Alibaba's powerful model",
        contextLength: 32768,
      },
    ],
  },

  perplexity: {
    name: "Perplexity",
    baseURL: "https://api.perplexity.ai",
    description: "Conversational AI with real-time search",
    models: [
      {
        id: "llama-3.1-sonar-large-128k-online",
        name: "Sonar Large (Online)",
        description: "Llama 3.1 70B with real-time search",
        contextLength: 127072,
      },
      {
        id: "llama-3.1-sonar-small-128k-online",
        name: "Sonar Small (Online)",
        description: "Llama 3.1 8B with real-time search",
        contextLength: 127072,
      },
    ],
  },

  deepseek: {
    name: "DeepSeek",
    baseURL: "https://api.deepseek.com/v1",
    description: "Powerful Chinese AI models",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "General purpose chat model",
        contextLength: 32768,
      },
      {
        id: "deepseek-coder",
        name: "DeepSeek Coder",
        description: "Specialized for coding",
        contextLength: 16384,
      },
    ],
  },

  fireworks: {
    name: "Fireworks AI",
    baseURL: "https://api.fireworks.ai/inference/v1",
    description: "Fast inference for open models",
    models: [
      {
        id: "accounts/fireworks/models/llama-v3p1-405b-instruct",
        name: "Llama 3.1 405B",
        description: "Largest Llama model",
        contextLength: 131072,
      },
      {
        id: "accounts/fireworks/models/llama-v3p1-70b-instruct",
        name: "Llama 3.1 70B",
        description: "Balanced performance",
        contextLength: 131072,
      },
    ],
  },
} as const

/**
 * Helper function to create a chat model for a specific provider
 */
export function createProviderChat(
  provider: keyof typeof GENERIC_PROVIDERS,
  apiKey: string,
  modelId: string,
  options?: Partial<ChatGenericInput>
): ChatGeneric {
  const config = GENERIC_PROVIDERS[provider]

  return new ChatGeneric({
    providerName: config.name,
    baseURL: config.baseURL,
    apiKey,
    modelName: modelId,
    ...options,
  })
}
