import React, { useEffect, useState } from 'react'
import { PluginManager } from '@page-assist/plugin-system'
import { globalEventBus } from '@page-assist/event-bus'
import { ToastProvider } from '@page-assist/ui'
import pageAssistPlugin from '@page-assist/plugin-page-assist'
import monitoringPlugin from '@page-assist/plugin-monitoring'
import Dashboard from './components/Dashboard'

function App() {
  const [pluginManager] = useState(() => new PluginManager(globalEventBus))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializePlugins()
  }, [])

  const initializePlugins = async () => {
    try {
      console.log('[Dashboard] Initializing plugins...')

      // Register all plugins
      await pluginManager.registerPlugin(pageAssistPlugin)
      await pluginManager.registerPlugin(monitoringPlugin)

      console.log('[Dashboard] All plugins loaded successfully')
      setLoading(false)
    } catch (err) {
      console.error('[Dashboard] Failed to initialize plugins:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize plugins')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Loading Page Assist Dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <Dashboard pluginManager={pluginManager} />
    </ToastProvider>
  )
}

export default App
