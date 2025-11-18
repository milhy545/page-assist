/**
 * useMessageStreaming - Streaming message handling
 * Handles real-time streaming of AI responses
 */

import { useState, useCallback } from 'react'
import { pageAssistModel } from '@/models'
import {
  isReasoningStarted,
  isReasoningEnded,
  mergeReasoningContent,
  removeReasoning,
} from '@/libs/reasoning'

export interface StreamingOptions {
  onToken?: (token: string) => void
  onComplete?: (fullText: string) => void
  onError?: (error: Error) => void
  onReasoningStart?: () => void
  onReasoningEnd?: () => void
}

export interface StreamingState {
  isStreaming: boolean
  currentText: string
  isReasoning: boolean
  reasoningContent: string
}

/**
 * Hook for handling streaming messages
 */
export const useMessageStreaming = () => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentText: '',
    isReasoning: false,
    reasoningContent: '',
  })

  /**
   * Start streaming message generation
   */
  const startStreaming = useCallback(
    async (
      modelConfig: any,
      messages: any[],
      options: StreamingOptions = {},
      abortController?: AbortController
    ): Promise<string> => {
      setStreamingState({
        isStreaming: true,
        currentText: '',
        isReasoning: false,
        reasoningContent: '',
      })

      let fullText = ''
      let reasoningContent = ''
      let isInReasoning = false

      try {
        const model = await pageAssistModel({
          model: modelConfig.model,
          baseUrl: modelConfig.baseUrl,
        })

        const stream = await model.stream(messages, {
          signal: abortController?.signal,
        })

        for await (const chunk of stream) {
          if (abortController?.signal.aborted) {
            break
          }

          const content = chunk.content || ''

          // Check for reasoning markers
          if (isReasoningStarted(content)) {
            isInReasoning = true
            setStreamingState(prev => ({ ...prev, isReasoning: true }))
            options.onReasoningStart?.()
            continue
          }

          if (isReasoningEnded(content)) {
            isInReasoning = false
            setStreamingState(prev => ({
              ...prev,
              isReasoning: false,
              reasoningContent: '',
            }))
            options.onReasoningEnd?.()
            continue
          }

          if (isInReasoning) {
            reasoningContent += content
            setStreamingState(prev => ({
              ...prev,
              reasoningContent: prev.reasoningContent + content,
            }))
          } else {
            fullText += content
            setStreamingState(prev => ({
              ...prev,
              currentText: prev.currentText + content,
            }))
            options.onToken?.(content)
          }
        }

        // Clean up reasoning content if present
        if (reasoningContent) {
          fullText = removeReasoning(fullText)
        }

        setStreamingState({
          isStreaming: false,
          currentText: fullText,
          isReasoning: false,
          reasoningContent: '',
        })

        options.onComplete?.(fullText)
        return fullText
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Streaming aborted')
        } else {
          console.error('Streaming error:', error)
          options.onError?.(error as Error)
        }

        setStreamingState({
          isStreaming: false,
          currentText: fullText,
          isReasoning: false,
          reasoningContent: '',
        })

        return fullText
      }
    },
    []
  )

  /**
   * Stop current streaming
   */
  const stopStreaming = useCallback((abortController?: AbortController) => {
    abortController?.abort()
    setStreamingState(prev => ({
      ...prev,
      isStreaming: false,
      isReasoning: false,
    }))
  }, [])

  /**
   * Reset streaming state
   */
  const resetStreaming = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      currentText: '',
      isReasoning: false,
      reasoningContent: '',
    })
  }, [])

  /**
   * Handle streaming with retry logic
   */
  const streamWithRetry = useCallback(
    async (
      modelConfig: any,
      messages: any[],
      options: StreamingOptions & { maxRetries?: number } = {},
      abortController?: AbortController
    ): Promise<string> => {
      const maxRetries = options.maxRetries || 3
      let lastError: Error | null = null

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await startStreaming(modelConfig, messages, options, abortController)
        } catch (error) {
          lastError = error as Error
          console.error(`Streaming attempt ${attempt + 1} failed:`, error)

          if (attempt < maxRetries - 1) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
          }
        }
      }

      throw lastError || new Error('Streaming failed after retries')
    },
    [startStreaming]
  )

  /**
   * Parse reasoning content
   */
  const parseReasoningContent = useCallback((content: string) => {
    const reasoningMatch = content.match(/<reasoning>([\s\S]*?)<\/reasoning>/)
    if (reasoningMatch) {
      return {
        reasoning: reasoningMatch[1].trim(),
        mainContent: content.replace(reasoningMatch[0], '').trim(),
      }
    }
    return {
      reasoning: '',
      mainContent: content,
    }
  }, [])

  /**
   * Estimate streaming progress
   */
  const estimateProgress = useCallback(
    (currentLength: number, estimatedTotal: number): number => {
      return Math.min((currentLength / estimatedTotal) * 100, 99)
    },
    []
  )

  /**
   * Calculate streaming speed (tokens per second)
   */
  const calculateStreamingSpeed = useCallback(
    (tokens: number, startTime: number): number => {
      const elapsed = (Date.now() - startTime) / 1000
      return elapsed > 0 ? tokens / elapsed : 0
    },
    []
  )

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    resetStreaming,
    streamWithRetry,
    parseReasoningContent,
    estimateProgress,
    calculateStreamingSpeed,
  }
}

/**
 * Throttled streaming hook for better performance
 */
export const useThrottledStreaming = (throttleMs: number = 50) => {
  const streaming = useMessageStreaming()
  let buffer = ''
  let lastUpdate = 0

  const throttledOnToken = useCallback(
    (callback?: (token: string) => void) => {
      return (token: string) => {
        buffer += token
        const now = Date.now()

        if (now - lastUpdate >= throttleMs) {
          callback?.(buffer)
          buffer = ''
          lastUpdate = now
        }
      }
    },
    [throttleMs]
  )

  return {
    ...streaming,
    throttledOnToken,
  }
}
