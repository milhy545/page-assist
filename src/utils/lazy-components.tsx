/**
 * Lazy Loading Components
 * Improves initial load time by splitting code into chunks
 */

import { lazy, Suspense, ComponentType } from 'react'
import { Spin } from 'antd'

/**
 * Loading fallback component
 */
const LoadingFallback = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        flexDirection: 'column',
      }}
    >
      <Spin size="large" />
      <p style={{ marginTop: '16px', color: '#666' }}>{message}</p>
    </div>
  )
}

/**
 * Higher-order component for lazy loading
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

/**
 * Lazy loaded routes for Page Assist
 */

// Main Pages
export const LazyPlayground = lazyLoad(
  () => import('@/components/Option/Playground'),
  <LoadingFallback message="Loading Chat..." />
)

export const LazySettings = lazyLoad(
  () => import('@/components/Option/Settings'),
  <LoadingFallback message="Loading Settings..." />
)

export const LazyModels = lazyLoad(
  () => import('@/components/Option/Models'),
  <LoadingFallback message="Loading Models..." />
)

export const LazyKnowledge = lazyLoad(
  () => import('@/components/Option/Knowledge'),
  <LoadingFallback message="Loading Knowledge Base..." />
)

export const LazyPrompts = lazyLoad(
  () => import('@/components/Option/Prompt'),
  <LoadingFallback message="Loading Prompts..." />
)

export const LazyShare = lazyLoad(
  () => import('@/components/Option/Share'),
  <LoadingFallback message="Loading Share..." />
)

// Heavy Components
export const LazyMarkdownRenderer = lazyLoad(
  () => import('@/components/Common/MarkdownRenderer'),
  <span>Loading...</span>
)

export const LazyCodeBlock = lazyLoad(
  () => import('@/components/Common/CodeBlock'),
  <pre>Loading code...</pre>
)

export const LazyImageGenerator = lazyLoad(
  () => import('@/components/ImageGeneration/ImageGenerator'),
  <LoadingFallback message="Loading Image Generator..." />
)

export const LazyMermaidDiagram = lazyLoad(
  () => import('@/components/Common/MermaidDiagram'),
  <div>Loading diagram...</div>
)

// Settings Subpages
export const LazyOllamaSettings = lazyLoad(
  () => import('@/components/Option/Settings/OllamaSettings')
)

export const LazyOpenAISettings = lazyLoad(
  () => import('@/components/Option/Settings/OpenAISettings')
)

export const LazyWebSearchSettings = lazyLoad(
  () => import('@/components/Option/Settings/WebSearchSettings')
)

export const LazyRAGSettings = lazyLoad(
  () => import('@/components/Option/Settings/RAGSettings')
)

export const LazyTTSSettings = lazyLoad(
  () => import('@/components/Option/Settings/TTSSettings')
)

/**
 * Preload component (for prefetching)
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  return () => {
    importFunc()
  }
}

/**
 * Usage examples:
 *
 * // In routes:
 * import { LazyPlayground, LazySettings } from '@/utils/lazy-components'
 *
 * <Route path="/playground" element={<LazyPlayground />} />
 * <Route path="/settings" element={<LazySettings />} />
 *
 * // Preload on hover:
 * const preloadPlayground = preloadComponent(() => import('@/components/Option/Playground'))
 * <Link to="/playground" onMouseEnter={preloadPlayground}>Playground</Link>
 */
