/**
 * useMessageState - Message state management
 * Extracted from useMessage.tsx to reduce complexity
 */

import { useStorage } from "@plasmohq/storage/hook"
import { useStoreMessageOption } from "~/store/option"
import { usePageAssist } from "@/context"
import { useStoreChatModelSettings } from "@/store/model"

export interface MessageState {
  // Abort controllers
  controller: AbortController | null
  setController: (controller: AbortController | null) => void
  embeddingController: AbortController | null
  setEmbeddingController: (controller: AbortController | null) => void

  // Messages
  messages: any[]
  setMessages: (messages: any[]) => void

  // Chat state
  history: any[]
  setHistory: (history: any[]) => void
  streaming: boolean
  setStreaming: (streaming: boolean) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  isEmbedding: boolean
  setIsEmbedding: (embedding: boolean) => void
  historyId: string
  setHistoryId: (id: string) => void
  chatMode: string
  setChatMode: (mode: string) => void
  currentURL: string
  setCurrentURL: (url: string) => void

  // Search state
  isSearchingInternet: boolean
  setIsSearchingInternet: (searching: boolean) => void
  webSearch: any
  setWebSearch: (search: any) => void

  // Other state
  temporaryChat: boolean
  setTemporaryChat: (temp: boolean) => void
  selectedQuickPrompt: any
  setSelectedQuickPrompt: (prompt: any) => void

  // Model settings
  selectedModel: string | undefined
  setSelectedModel: (model: string) => void
  currentChatModelSettings: any

  // Storage settings
  defaultInternetSearchOn: boolean
  defaultChatWithWebsite: boolean
  chatWithWebsiteEmbedding: boolean
  maxWebsiteContext: number
}

/**
 * Hook for managing message-related state
 * Consolidates all state management in one place
 */
export const useMessageState = (): MessageState => {
  const {
    controller,
    setController,
    messages,
    setMessages,
    embeddingController,
    setEmbeddingController,
  } = usePageAssist()

  const {
    setIsSearchingInternet,
    webSearch,
    setWebSearch,
    isSearchingInternet,
    temporaryChat,
    setTemporaryChat,
  } = useStoreMessageOption()

  const currentChatModelSettings = useStoreChatModelSettings()

  const [selectedModel, setSelectedModel] = useStorage("selectedModel")
  const [defaultInternetSearchOn] = useStorage("defaultInternetSearchOn", false)
  const [defaultChatWithWebsite] = useStorage("defaultChatWithWebsite", false)
  const [chatWithWebsiteEmbedding] = useStorage("chatWithWebsiteEmbedding", false)
  const [maxWebsiteContext] = useStorage("maxWebsiteContext", 4028)

  const {
    history,
    setHistory,
    setStreaming,
    streaming,
    setIsFirstMessage,
    historyId,
    setHistoryId,
    isLoading,
    setIsLoading,
    isProcessing,
    setIsProcessing,
    chatMode,
    setChatMode,
    setIsEmbedding,
    isEmbedding,
    currentURL,
    setCurrentURL,
    selectedQuickPrompt,
    setSelectedQuickPrompt,
  } = useStoreMessage()

  return {
    controller,
    setController,
    embeddingController,
    setEmbeddingController,
    messages,
    setMessages,
    history,
    setHistory,
    streaming,
    setStreaming,
    isLoading,
    setIsLoading,
    isProcessing,
    setIsProcessing,
    isEmbedding,
    setIsEmbedding,
    historyId,
    setHistoryId,
    chatMode,
    setChatMode,
    currentURL,
    setCurrentURL,
    isSearchingInternet,
    setIsSearchingInternet,
    webSearch,
    setWebSearch,
    temporaryChat,
    setTemporaryChat,
    selectedQuickPrompt,
    setSelectedQuickPrompt,
    selectedModel,
    setSelectedModel,
    currentChatModelSettings,
    defaultInternetSearchOn,
    defaultChatWithWebsite,
    chatWithWebsiteEmbedding,
    maxWebsiteContext,
  }
}

// Import useStoreMessage (will be from store)
const useStoreMessage = () => {
  // This is a placeholder - actual implementation is in store
  return {
    history: [],
    setHistory: () => {},
    setStreaming: () => {},
    streaming: false,
    setIsFirstMessage: () => {},
    historyId: "",
    setHistoryId: () => {},
    isLoading: false,
    setIsLoading: () => {},
    isProcessing: false,
    setIsProcessing: () => {},
    chatMode: "normal",
    setChatMode: () => {},
    setIsEmbedding: () => {},
    isEmbedding: false,
    currentURL: "",
    setCurrentURL: () => {},
    selectedQuickPrompt: null,
    setSelectedQuickPrompt: () => {},
  }
}
