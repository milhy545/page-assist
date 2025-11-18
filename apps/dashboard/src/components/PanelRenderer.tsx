import React from 'react'
import type { Plugin, PluginPanel } from '@page-assist/plugin-system'

interface PanelRendererProps {
  plugin: Plugin
  panel: PluginPanel
}

export function PanelRenderer({ plugin, panel }: PanelRendererProps) {
  const Component = panel.component

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Panel component not found</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <Component plugin={plugin} panel={panel} />
    </div>
  )
}
