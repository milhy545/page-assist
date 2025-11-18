import React from 'react'
import { Menu } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../utils/cn'

export interface DropdownItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
}

export interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <Menu.Button as="div">{trigger}</Menu.Button>

      <Menu.Items
        className={cn(
          'absolute z-10 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800',
          'shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
          'border border-gray-200 dark:border-gray-700',
          align === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div className="py-1">
          {items.map((item) => (
            <Menu.Item key={item.id} disabled={item.disabled}>
              {({ active }) => (
                <button
                  onClick={item.onClick}
                  className={cn(
                    'flex w-full items-center gap-2 px-4 py-2 text-sm',
                    'transition-colors',
                    active && 'bg-gray-100 dark:bg-gray-700',
                    item.disabled && 'opacity-50 cursor-not-allowed',
                    item.danger
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-900 dark:text-gray-100'
                  )}
                  disabled={item.disabled}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  )
}
