import React, { useState } from 'react'
import type { PluginManager } from '@page-assist/plugin-system'
import { Layout, LayoutHeader, LayoutSidebar, LayoutMain } from '@page-assist/ui'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { PanelRenderer } from './PanelRenderer'

interface DashboardProps {
  pluginManager: PluginManager
}

export default function Dashboard({ pluginManager }: DashboardProps) {
  const [activePanelId, setActivePanelId] = useState<string>('page-assist:chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const panels = pluginManager.getAllPanels()

  // Find active panel
  const activePanel = panels.find(
    (p) => `${p.plugin.manifest.id}:${p.panel.id}` === activePanelId
  )

  return (
    <Layout>
      <LayoutHeader>
        <Header
          pluginManager={pluginManager}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
      </LayoutHeader>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <LayoutSidebar width="16rem">
            <Sidebar
              pluginManager={pluginManager}
              activePanelId={activePanelId}
              onPanelSelect={setActivePanelId}
            />
          </LayoutSidebar>
        )}

        <LayoutMain>
          {activePanel ? (
            <PanelRenderer
              plugin={activePanel.plugin}
              panel={activePanel.panel}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg">No panel selected</p>
                <p className="text-sm mt-2">Select a panel from the sidebar</p>
              </div>
            </div>
          )}
        </LayoutMain>
      </div>
    </Layout>
  )
}
