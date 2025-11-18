/**
 * Anthropic Claude - Advanced AI assistant
 *
 * Claude is Anthropic's family of state-of-the-art AI models.
 * Known for strong reasoning, code generation, and nuanced conversation.
 *
 * @see https://www.anthropic.com
 */

import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages"
import { ChatGenerationChunk, ChatResult } from "@langchain/core/outputs"
import {
  BaseChatModel,
  BaseChatModelParams,
} from "@langchain/core/language_models/chat_models"
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager"
import { CustomAIMessageChunk } from "./CustomAIMessageChunk"

export interface ChatAnthropicInput extends BaseChatModelParams {
  /**
   * Anthropic API key
   * Get it from: https://console.anthropic.com
   */
  anthropicApiKey?: string

  /**
   * Model to use
   */
  modelName?: string

  /**
   * Temperature (0-1)
   */
  temperature?: number

  /**
   * Maximum tokens to generate
   */
  maxTokens?: number

  /**
   * Top P sampling
   */
  topP?: number

  /**
   * Top K sampling
   */
  topK?: number

  /**
   * Streaming mode
   */
  streaming?: boolean
}

interface AnthropicMessage {
  role: "user" | "assistant"
  content: string
}

interface AnthropicRequest {
  model: string
  messages: AnthropicMessage[]
  max_tokens: number
  temperature?: number
  top_p?: number
  top_k?: number
  stream?: boolean
  system?: string
}

/**
 * Chat model for Anthropic Claude
 *
 * @example
 * ```typescript
 * const model = new ChatAnthropic({
 *   anthropicApiKey: "your-api-key",
 *   modelName: "claude-3-5-sonnet-20241022",
 *   temperature: 0.7,
 *   maxTokens: 4096,
 * })
 * ```
 */
export class ChatAnthropic extends BaseChatModel {
  static readonly BASE_URL = "https://api.anthropic.com/v1"
  static readonly API_VERSION = "2023-06-01"

  anthropicApiKey?: string
  modelName = "claude-3-5-sonnet-20241022"
  temperature = 1.0
  maxTokens = 4096
  topP?: number
  topK?: number
  streaming = false

  constructor(fields?: ChatAnthropicInput) {
    super(fields ?? {})
    this.anthropicApiKey = fields?.anthropicApiKey
    this.modelName = fields?.modelName || this.modelName
    this.temperature = fields?.temperature ?? this.temperature
    this.maxTokens = fields?.maxTokens || this.maxTokens
    this.topP = fields?.topP
    this.topK = fields?.topK
    this.streaming = fields?.streaming ?? false
  }

  _llmType(): string {
    return "anthropic"
  }

  static lc_name() {
    return "ChatAnthropic"
  }

  _combineLLMOutput() {
    return {}
  }

  private convertMessages(messages: BaseMessage[]): {
    messages: AnthropicMessage[]
    system?: string
  } {
    const systemMessages: string[] = []
    const conversationMessages: AnthropicMessage[] = []

    for (const message of messages) {
      const type = message._getType()

      if (type === "system") {
        systemMessages.push(message.content as string)
      } else if (type === "human") {
        conversationMessages.push({
          role: "user",
          content: message.content as string,
        })
      } else if (type === "ai") {
        conversationMessages.push({
          role: "assistant",
          content: message.content as string,
        })
      } else {
        conversationMessages.push({
          role: "user",
          content: message.content as string,
        })
      }
    }

    return {
      messages: conversationMessages,
      system: systemMessages.length > 0 ? systemMessages.join("\n\n") : undefined,
    }
  }

  async _generate(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    if (!this.anthropicApiKey) {
      throw new Error("Anthropic API key is required")
    }

    const { messages: anthropicMessages, system } = this.convertMessages(messages)

    const requestBody: AnthropicRequest = {
      model: this.modelName,
      messages: anthropicMessages,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      stream: this.streaming,
    }

    if (this.topP !== undefined) {
      requestBody.top_p = this.topP
    }
    if (this.topK !== undefined) {
      requestBody.top_k = this.topK
    }
    if (system) {
      requestBody.system = system
    }

    if (this.streaming) {
      return this._generateStreaming(requestBody, runManager)
    }

    const response = await fetch(`${ChatAnthropic.BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.anthropicApiKey,
        "anthropic-version": ChatAnthropic.API_VERSION,
      },
      body: JSON.stringify(requestBody),
      signal: options?.signal,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    const content = data.content?.[0]?.text || ""
    const message = new AIMessage(content)

    return {
      generations: [
        {
          text: content,
          message,
        },
      ],
      llmOutput: {
        tokenUsage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens:
            (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      },
    }
  }

  private async _generateStreaming(
    requestBody: AnthropicRequest,
    runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    if (!this.anthropicApiKey) {
      throw new Error("Anthropic API key is required")
    }

    const response = await fetch(`${ChatAnthropic.BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.anthropicApiKey,
        "anthropic-version": ChatAnthropic.API_VERSION,
      },
      body: JSON.stringify({ ...requestBody, stream: true }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("Failed to get response reader")
    }

    const decoder = new TextDecoder()
    let fullContent = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === "content_block_delta") {
                const text = parsed.delta?.text || ""
                fullContent += text
                await runManager?.handleLLMNewToken(text)
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return {
      generations: [
        {
          text: fullContent,
          message: new AIMessage(fullContent),
        },
      ],
      llmOutput: {},
    }
  }

  async *_streamResponseChunks(
    messages: BaseMessage[],
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<ChatGenerationChunk> {
    if (!this.anthropicApiKey) {
      throw new Error("Anthropic API key is required")
    }

    const { messages: anthropicMessages, system } = this.convertMessages(messages)

    const requestBody: AnthropicRequest = {
      model: this.modelName,
      messages: anthropicMessages,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      stream: true,
    }

    if (this.topP !== undefined) {
      requestBody.top_p = this.topP
    }
    if (this.topK !== undefined) {
      requestBody.top_k = this.topK
    }
    if (system) {
      requestBody.system = system
    }

    const response = await fetch(`${ChatAnthropic.BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.anthropicApiKey,
        "anthropic-version": ChatAnthropic.API_VERSION,
      },
      body: JSON.stringify(requestBody),
      signal: options?.signal,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("Failed to get response reader")
    }

    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === "content_block_delta") {
                const text = parsed.delta?.text || ""
                if (text) {
                  const messageChunk = new CustomAIMessageChunk({
                    content: text,
                  })

                  const generationChunk = new ChatGenerationChunk({
                    message: messageChunk,
                    text,
                  })

                  yield generationChunk
                  await runManager?.handleLLMNewToken(text)
                }
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

/**
 * Available Claude models
 */
export const CLAUDE_MODELS = [
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    description: "Most intelligent model, best for complex tasks",
    contextLength: 200000,
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    description: "Powerful model for highly complex tasks",
    contextLength: 200000,
  },
  {
    id: "claude-3-sonnet-20240229",
    name: "Claude 3 Sonnet",
    description: "Balanced intelligence and speed",
    contextLength: 200000,
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    description: "Fastest and most compact model",
    contextLength: 200000,
  },
] as const
