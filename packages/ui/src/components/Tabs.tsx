import React, { useState } from 'react'
import { cn } from '../utils/cn'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string
  onChange?: (tabId: string) => void
  children: (tabId: string) => React.ReactNode
  variant?: 'line' | 'pill'
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  children,
  variant = 'line',
  className,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id
  )

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId)
    }
    onChange?.(tabId)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Tab List */}
      <div
        className={cn(
          'flex gap-1',
          variant === 'line' && 'border-b border-gray-200 dark:border-gray-700'
        )}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const isDisabled = tab.disabled

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => !isDisabled && handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variant === 'line' && [
                  'border-b-2 -mb-px',
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600',
                ],
                variant === 'pill' && [
                  'rounded-lg',
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                ]
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panel */}
      <div className="mt-4" role="tabpanel">
        {children(activeTab)}
      </div>
    </div>
  )
}
