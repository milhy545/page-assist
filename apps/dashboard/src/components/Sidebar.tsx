import React from 'react'
import type { PluginManager } from '@page-assist/plugin-system'
import { cn } from '@page-assist/ui'

interface SidebarProps {
  pluginManager: PluginManager
  activePanelId: string
  onPanelSelect: (panelId: string) => void
}

export function Sidebar({ pluginManager, activePanelId, onPanelSelect }: SidebarProps) {
  const panels = pluginManager.getAllPanels()

  // Group panels by plugin
  const panelsByPlugin = panels.reduce((acc, { plugin, panel }) => {
    const pluginId = plugin.manifest.id
    if (!acc[pluginId]) {
      acc[pluginId] = { plugin, panels: [] }
    }
    acc[pluginId].panels.push(panel)
    return acc
  }, {} as Record<string, { plugin: any; panels: any[] }>)

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
          Panels
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {Object.entries(panelsByPlugin).map(([pluginId, { plugin, panels }]) => (
          <div key={pluginId}>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {plugin.manifest.name}
            </div>

            <div className="space-y-1">
              {panels.map((panel) => {
                const panelId = `${pluginId}:${panel.id}`
                const isActive = panelId === activePanelId
                const IconComponent = panel.icon

                return (
                  <button
                    key={panel.id}
                    onClick={() => onPanelSelect(panelId)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {IconComponent && (
                      typeof IconComponent === 'function' ? (
                        <IconComponent className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <span className="h-5 w-5 flex-shrink-0">{IconComponent}</span>
                      )
                    )}
                    <span className="flex-1 text-left">{panel.title}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer with plugin info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {Object.keys(panelsByPlugin).length} plugins •{' '}
          {panels.length} panels
        </div>
      </div>
    </div>
  )
}
