/**
 * Mercury (Inception Labs) - Ultra-fast diffusion LLM
 *
 * Mercury is the first commercial-scale diffusion large language model.
 * - 5-10x faster than traditional LLMs
 * - 1109 tokens/sec (Mini) on H100
 * - OpenAI-compatible API
 *
 * Pricing: $0.25/1M input tokens, $1.00/1M output tokens
 *
 * @see https://www.inceptionlabs.ai
 */

import { CustomChatOpenAI } from "./CustomChatOpenAI"
import type { OpenAIChatInput } from "@langchain/openai"
import type { BaseChatModelParams } from "@langchain/core/language_models/chat_models"

export interface ChatMercuryInput extends Partial<OpenAIChatInput>, BaseChatModelParams {
  /**
   * Mercury API key
   * Get it from: https://platform.inceptionlabs.ai
   */
  mercuryApiKey?: string

  /**
   * Model to use. Available models:
   * - mercury-coder-mini
   * - mercury-coder-small
   * - mercury-coder (default)
   */
  modelName?: string
}

/**
 * Chat model for Mercury (Inception Labs) diffusion LLM
 *
 * @example
 * ```typescript
 * const model = new ChatMercury({
 *   mercuryApiKey: "your-api-key",
 *   modelName: "mercury-coder",
 *   temperature: 0.7,
 * })
 *
 * const response = await model.invoke([
 *   { role: "user", content: "Write a Python function to sort a list" }
 * ])
 * ```
 */
export class ChatMercury extends CustomChatOpenAI {
  static readonly BASE_URL = "https://api.mercuryai.com/v1"

  constructor(fields?: ChatMercuryInput) {
    const mercuryConfig = {
      ...fields,
      openAIApiKey: fields?.mercuryApiKey || fields?.openAIApiKey,
      modelName: fields?.modelName || "mercury-coder",
      configuration: {
        basePath: ChatMercury.BASE_URL,
        baseOptions: {
          headers: fields?.configuration?.baseOptions?.headers || {},
        },
      },
    }

    super(mercuryConfig as any)
  }

  _llmType(): string {
    return "mercury"
  }

  static lc_name() {
    return "ChatMercury"
  }
}

/**
 * Available Mercury models
 */
export const MERCURY_MODELS = [
  {
    id: "mercury-coder",
    name: "Mercury Coder",
    description: "Full-size Mercury diffusion LLM for code generation",
    contextLength: 16384,
  },
  {
    id: "mercury-coder-small",
    name: "Mercury Coder Small",
    description: "Smaller, faster Mercury model (737 tokens/sec)",
    contextLength: 16384,
  },
  {
    id: "mercury-coder-mini",
    name: "Mercury Coder Mini",
    description: "Fastest Mercury model (1109 tokens/sec)",
    contextLength: 8192,
  },
] as const
