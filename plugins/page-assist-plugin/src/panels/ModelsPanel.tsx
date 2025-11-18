import React, { useEffect, useState } from 'react'
import type { PluginPanelProps } from '@page-assist/plugin-system'
import { Card, Badge, Button } from '@page-assist/ui'
import { Check } from 'lucide-react'

interface Model {
  id: string
  name: string
  provider: string
}

export const ModelsPanel: React.FC<PluginPanelProps> = ({ plugin }) => {
  const [models, setModels] = useState<Model[]>([])
  const [currentModel, setCurrentModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const api = plugin.context.getPluginAPI<{
        getModels: () => Promise<Model[]>
        getCurrentModel: () => Promise<Model>
      }>('page-assist')

      const [allModels, current] = await Promise.all([
        api?.getModels() || [],
        api?.getCurrentModel(),
      ])

      setModels(allModels)
      setCurrentModel(current || null)
    } catch (error) {
      console.error('Failed to load models:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectModel = async (model: Model) => {
    try {
      const api = plugin.context.getPluginAPI<{
        setModel: (modelId: string) => Promise<void>
      }>('page-assist')

      await api?.setModel(model.id)
      setCurrentModel(model)

      plugin.context.notify(`Switched to ${model.name}`, 'success')

      // Emit event
      await plugin.context.eventBus.emit('model.changed', {
        modelName: model.name,
        provider: model.provider,
      })
    } catch (error) {
      console.error('Failed to set model:', error)
      plugin.context.notify('Failed to switch model', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          Loading models...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Available Models</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select an AI model to use
        </p>
      </div>

      <div className="space-y-2">
        {models.map((model) => {
          const isActive = currentModel?.id === model.id

          return (
            <Card
              key={model.id}
              hoverable
              className={isActive ? 'ring-2 ring-blue-600' : ''}
              onClick={() => handleSelectModel(model)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {model.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {model.provider}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <Badge variant="success">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      Select
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
