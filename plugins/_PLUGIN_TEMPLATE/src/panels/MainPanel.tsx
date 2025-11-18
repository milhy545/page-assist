import React, { useState, useEffect } from 'react'
import type { PluginPanelProps } from '@page-assist/plugin-system'
import { Button, Card, Input, Badge } from '@page-assist/ui'
import { Sparkles } from 'lucide-react'

/**
 * Main Panel Component
 *
 * This is the main UI for your plugin
 * You receive the plugin instance as props
 */
export const MainPanel: React.FC<PluginPanelProps> = ({ plugin, panel }) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Use plugin API
      const api = plugin.context.getPluginAPI<{
        getData: () => Promise<any>
      }>('CHANGEME')

      const result = await api?.getData()
      setData(result)
    } catch (error) {
      console.error('Failed to load data:', error)
      plugin.context.notify('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    try {
      // Use plugin API
      const api = plugin.context.getPluginAPI<{
        doSomething: (param: string) => Promise<string>
      }>('CHANGEME')

      const result = await api?.doSomething('test')

      plugin.context.notify(result || 'Action completed!', 'success')

      // Emit event
      await plugin.context.eventBus.emit('yourplugin.action.completed', {
        action: 'button-click',
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Action failed:', error)
      plugin.context.notify('Action failed', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {panel.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {panel.description}
            </p>
          </div>
        </div>
        <Badge variant="success">Active</Badge>
      </div>

      {/* Content */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Example Section</h2>

        <div className="space-y-4">
          <Input
            label="Example Input"
            placeholder="Type something..."
            helperText="This is an example input field"
          />

          <Button onClick={handleAction} icon={<Sparkles className="h-4 w-4" />}>
            Do Something
          </Button>

          {data && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <pre className="text-xs text-gray-700 dark:text-gray-300">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>

      {/* Additional sections */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Features</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
        </ul>
      </Card>
    </div>
  )
}
