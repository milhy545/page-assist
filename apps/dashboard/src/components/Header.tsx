import React from 'react'
import type { PluginManager } from '@page-assist/plugin-system'
import { Button, Dropdown, useTheme } from '@page-assist/ui'
import { Menu, Sun, Moon, Monitor, Settings, Sparkles } from 'lucide-react'

interface HeaderProps {
  pluginManager: PluginManager
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export function Header({ pluginManager, onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme()

  const themeItems = [
    {
      id: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />,
      onClick: () => setTheme('light'),
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: <Moon className="h-4 w-4" />,
      onClick: () => setTheme('dark'),
    },
    {
      id: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />,
      onClick: () => setTheme('system'),
    },
  ]

  const plugins = pluginManager.getAllPlugins()

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          icon={<Menu className="h-5 w-5" />}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        />

        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Page Assist
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{plugins.length} plugins loaded</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dropdown
          trigger={
            <Button variant="ghost" size="sm">
              {theme === 'light' ? (
                <Sun className="h-5 w-5" />
              ) : theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Monitor className="h-5 w-5" />
              )}
            </Button>
          }
          items={themeItems}
        />

        <Button
          variant="ghost"
          size="sm"
          icon={<Settings className="h-5 w-5" />}
          aria-label="Settings"
        />
      </div>
    </div>
  )
}
