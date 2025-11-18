/**
 * useMessageRAG - RAG (Retrieval-Augmented Generation) logic
 * Handles knowledge base retrieval and embeddings
 */

import { PAMemoryVectorStore } from "@/libs/PAMemoryVectorStore"
import { pageAssistEmbeddingModel } from "@/models/embedding"
import { memoryEmbedding } from "@/utils/memory-embeddings"
import { formatDocs } from "@/chain/chat-with-x"
import { getNoOfRetrievedDocs } from "@/services/app"

export interface RAGOptions {
  embeddingModel?: string
  maxDocs?: number
  threshold?: number
  chunkSize?: number
  chunkOverlap?: number
}

export interface RAGResult {
  documents: any[]
  context: string
  sources: string[]
}

/**
 * Hook for RAG functionality
 */
export const useMessageRAG = () => {
  /**
   * Retrieve relevant documents using vector search
   */
  const retrieveDocuments = async (
    query: string,
    vectorStore: PAMemoryVectorStore,
    options: RAGOptions = {}
  ): Promise<RAGResult> => {
    const { maxDocs = 4, threshold = 0.7 } = options

    try {
      const results = await vectorStore.similaritySearch(query, maxDocs)

      const documents = results.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      }))

      const context = formatDocs(results)
      const sources = [...new Set(results.map(doc => doc.metadata.source))]

      return {
        documents,
        context,
        sources,
      }
    } catch (error) {
      console.error('Error retrieving documents:', error)
      return {
        documents: [],
        context: '',
        sources: [],
      }
    }
  }

  /**
   * Create vector store from documents
   */
  const createVectorStore = async (
    documents: any[],
    embeddingModel: string,
    abortController?: AbortController
  ): Promise<PAMemoryVectorStore | null> => {
    try {
      const embeddings = await pageAssistEmbeddingModel({
        model: embeddingModel,
      })

      const vectorStore = await PAMemoryVectorStore.fromDocuments(
        documents,
        embeddings,
        {
          signal: abortController?.signal,
        }
      )

      return vectorStore
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Vector store creation aborted')
      } else {
        console.error('Error creating vector store:', error)
      }
      return null
    }
  }

  /**
   * Add documents to existing vector store
   */
  const addDocuments = async (
    vectorStore: PAMemoryVectorStore,
    documents: any[],
    abortController?: AbortController
  ): Promise<boolean> => {
    try {
      await vectorStore.addDocuments(documents, {
        signal: abortController?.signal,
      })
      return true
    } catch (error) {
      console.error('Error adding documents:', error)
      return false
    }
  }

  /**
   * Create embeddings for text
   */
  const createEmbedding = async (
    text: string,
    embeddingModel: string
  ): Promise<number[] | null> => {
    try {
      const embeddings = await pageAssistEmbeddingModel({
        model: embeddingModel,
      })

      const embedding = await embeddings.embedQuery(text)
      return embedding
    } catch (error) {
      console.error('Error creating embedding:', error)
      return null
    }
  }

  /**
   * Calculate semantic similarity between two texts
   */
  const calculateSimilarity = async (
    text1: string,
    text2: string,
    embeddingModel: string
  ): Promise<number> => {
    try {
      const [embedding1, embedding2] = await Promise.all([
        createEmbedding(text1, embeddingModel),
        createEmbedding(text2, embeddingModel),
      ])

      if (!embedding1 || !embedding2) return 0

      // Cosine similarity
      const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0)
      const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0))
      const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0))

      return dotProduct / (magnitude1 * magnitude2)
    } catch (error) {
      console.error('Error calculating similarity:', error)
      return 0
    }
  }

  /**
   * Process memory embeddings for chat history
   */
  const processMemoryEmbeddings = async (
    messages: any[],
    maxMessages: number = 10
  ): Promise<string> => {
    try {
      const recentMessages = messages.slice(-maxMessages)
      const memoryContext = await memoryEmbedding(recentMessages)
      return memoryContext || ''
    } catch (error) {
      console.error('Error processing memory embeddings:', error)
      return ''
    }
  }

  /**
   * Chunk text for embedding
   */
  const chunkText = (
    text: string,
    chunkSize: number = 1000,
    chunkOverlap: number = 200
  ): string[] => {
    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      chunks.push(text.slice(start, end))
      start = end - chunkOverlap
    }

    return chunks
  }

  /**
   * Get retrieval configuration
   */
  const getRetrievalConfig = async () => {
    const numDocs = await getNoOfRetrievedDocs()
    return {
      numDocs,
      threshold: 0.7,
      strategy: 'similarity',
    }
  }

  /**
   * Filter documents by relevance
   */
  const filterByRelevance = (
    documents: any[],
    threshold: number = 0.7
  ): any[] => {
    return documents.filter(doc => {
      const score = doc.metadata?.score || 0
      return score >= threshold
    })
  }

  /**
   * Deduplicate documents
   */
  const deduplicateDocuments = (documents: any[]): any[] => {
    const seen = new Set<string>()
    return documents.filter(doc => {
      const key = doc.pageContent.substring(0, 100)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * Format RAG context for prompt
   */
  const formatRAGContext = (documents: any[]): string => {
    if (documents.length === 0) return ''

    const formatted = documents
      .map((doc, index) => {
        const source = doc.metadata?.source || 'Unknown'
        return `[Document ${index + 1}] (Source: ${source})\n${doc.pageContent}`
      })
      .join('\n\n---\n\n')

    return `## Retrieved Context\n\n${formatted}\n\n## End of Context\n\n`
  }

  return {
    retrieveDocuments,
    createVectorStore,
    addDocuments,
    createEmbedding,
    calculateSimilarity,
    processMemoryEmbeddings,
    chunkText,
    getRetrievalConfig,
    filterByRelevance,
    deduplicateDocuments,
    formatRAGContext,
  }
}
