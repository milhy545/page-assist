/**
 * Performance Monitoring and Optimization Utilities
 */

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  fn: () => T | Promise<T>,
  label: string = 'Operation'
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const start = performance.now()

    try {
      const result = await fn()
      const duration = performance.now() - start

      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)

      resolve({ result, duration })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Debounce function with immediate execution option
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  let lastResult: ReturnType<T>

  return function executedFunction(...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      lastResult = func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
    return lastResult
  }
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Cache with TTL (Time To Live)
 */
export class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>()

  constructor(private ttl: number = 60000) {} // Default 60s

  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
    })
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key)

    if (!item) return undefined

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }

    return item.value
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * Lazy initialization
 */
export function lazy<T>(factory: () => T): () => T {
  let instance: T | undefined
  return () => {
    if (instance === undefined) {
      instance = factory()
    }
    return instance
  }
}

/**
 * Bundle size analyzer helper
 */
export function logBundleSize(moduleName: string, sizeInKB: number): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Bundle] ${moduleName}: ${sizeInKB.toFixed(2)} KB`)

    if (sizeInKB > 500) {
      console.warn(`[Bundle] Warning: ${moduleName} is large (>${sizeInKB.toFixed(2)} KB)`)
    }
  }
}

/**
 * Performance observer for long tasks
 */
export function observeLongTasks(threshold: number = 50): void {
  if (typeof PerformanceObserver === 'undefined') return

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > threshold) {
          console.warn(`[Performance] Long task detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`)
        }
      }
    })

    observer.observe({ entryTypes: ['measure', 'longtask'] })
  } catch (error) {
    console.error('[Performance] Failed to observe long tasks:', error)
  }
}

/**
 * Memory usage tracker
 */
export function trackMemoryUsage(): void {
  if (typeof performance === 'undefined' || !(performance as any).memory) return

  const memory = (performance as any).memory

  const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
  const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2)
  const limitMB = (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)

  console.log(`[Memory] Used: ${usedMB} MB / ${totalMB} MB (Limit: ${limitMB} MB)`)

  const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100

  if (usagePercent > 80) {
    console.warn(`[Memory] Warning: High memory usage (${usagePercent.toFixed(1)}%)`)
  }
}

/**
 * Request animation frame helper for smooth animations
 */
export function rafThrottle<T extends (...args: any[]) => void>(callback: T): T {
  let rafId: number | null = null

  return ((...args: Parameters<T>) => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      callback(...args)
      rafId = null
    })
  }) as T
}

/**
 * Batch updates together
 */
export function batchUpdates<T>(
  items: T[],
  processor: (item: T) => void,
  batchSize: number = 10,
  delay: number = 0
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0

    function processBatch() {
      const batch = items.slice(index, index + batchSize)
      batch.forEach(processor)

      index += batchSize

      if (index < items.length) {
        setTimeout(processBatch, delay)
      } else {
        resolve()
      }
    }

    processBatch()
  })
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Code splitting helper
 */
export async function loadChunk<T>(
  importer: () => Promise<{ default: T }>,
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const module = await importer()
      return module.default
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
  throw new Error('Failed to load chunk')
}

/**
 * Virtual scrolling helper
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const end = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  return { start, end }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (process.env.NODE_ENV === 'development') {
    observeLongTasks(50)

    // Track memory every 30 seconds
    setInterval(trackMemoryUsage, 30000)

    // Log initial memory
    trackMemoryUsage()

    console.log('[Performance] Monitoring initialized')
  }
}

/**
 * Report Web Vitals
 */
export function reportWebVitals(metric: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value)
  }

  // In production, send to analytics
  // Example: sendToAnalytics(metric)
}
