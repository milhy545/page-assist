/**
 * useMessageUtils - Utility functions for message handling
 * Extracted from useMessage.tsx
 */

import { cleanUrl } from "~/libs/clean-url"
import { generateID } from "@/db/dexie/helpers"
import { humanMessageFormatter } from "@/utils/human-message"
import { systemPromptFormatter } from "@/utils/system-message"

/**
 * Clean and validate URL
 */
export const cleanAndValidateUrl = (url: string): string => {
  return cleanUrl(url)
}

/**
 * Generate unique message ID
 */
export const generateMessageId = (): string => {
  return generateID()
}

/**
 * Format human message
 */
export const formatHumanMessage = (content: string, options?: any): any => {
  return humanMessageFormatter(content, options)
}

/**
 * Format system message
 */
export const formatSystemMessage = (content: string, options?: any): any => {
  return systemPromptFormatter(content, options)
}

/**
 * Check if message is a command
 */
export const isCommand = (message: string): boolean => {
  return message.trim().startsWith('/')
}

/**
 * Parse command from message
 */
export const parseCommand = (message: string): { command: string; args: string[] } => {
  const parts = message.trim().split(' ')
  const command = parts[0].substring(1) // Remove '/'
  const args = parts.slice(1)
  return { command, args }
}

/**
 * Validate message content
 */
export const validateMessage = (message: string): { valid: boolean; error?: string } => {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  if (message.length > 100000) {
    return { valid: false, error: 'Message is too long' }
  }

  return { valid: true }
}

/**
 * Truncate message for display
 */
export const truncateMessage = (message: string, maxLength: number = 100): string => {
  if (message.length <= maxLength) {
    return message
  }
  return message.substring(0, maxLength) + '...'
}

/**
 * Count tokens (approximate)
 */
export const estimateTokens = (text: string): number => {
  // Simple estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}

/**
 * Check if content contains code
 */
export const containsCode = (content: string): boolean => {
  return /```[\s\S]*?```|`[^`]+`/.test(content)
}

/**
 * Extract code blocks from content
 */
export const extractCodeBlocks = (content: string): Array<{ language: string; code: string }> => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  const blocks: Array<{ language: string; code: string }> = []

  let match
  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2],
    })
  }

  return blocks
}

/**
 * Format timestamp
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

/**
 * Calculate message similarity (for deduplication)
 */
export const calculateSimilarity = (msg1: string, msg2: string): number => {
  const str1 = msg1.toLowerCase().trim()
  const str2 = msg2.toLowerCase().trim()

  if (str1 === str2) return 1.0

  // Simple Jaccard similarity
  const set1 = new Set(str1.split(/\s+/))
  const set2 = new Set(str2.split(/\s+/))

  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * Sanitize message content
 */
export const sanitizeContent = (content: string): string => {
  // Remove any potential XSS
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Extract URLs from message
 */
export const extractUrls = (message: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = message.match(urlRegex)
  return matches || []
}

/**
 * Check if message contains image
 */
export const containsImage = (message: any): boolean => {
  return !!(message.image_url || message.images || message.attachments)
}

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
