import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../utils/cn'
import { Button } from './Button'

export interface PanelProps {
  /** Panel title */
  title?: string

  /** Panel icon */
  icon?: React.ReactNode

  /** Panel children */
  children: React.ReactNode

  /** Is panel open? */
  open: boolean

  /** On close callback */
  onClose?: () => void

  /** Panel position */
  position?: 'left' | 'right' | 'top' | 'bottom'

  /** Panel size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'

  /** Can panel be closed? */
  closable?: boolean

  /** Panel header actions */
  headerActions?: React.ReactNode

  /** Additional class names */
  className?: string
}

export const Panel: React.FC<PanelProps> = ({
  title,
  icon,
  children,
  open,
  onClose,
  position = 'right',
  size = 'md',
  closable = true,
  headerActions,
  className,
}) => {
  if (!open) return null

  const positions = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  }

  const sizes = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-80',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-[32rem]' : 'h-[32rem]',
    xl: position === 'left' || position === 'right' ? 'w-[48rem]' : 'h-[48rem]',
    full: 'w-full h-full',
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closable ? onClose : undefined}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed z-50 bg-white dark:bg-gray-900 shadow-xl',
          'flex flex-col',
          positions[position],
          size !== 'full' && sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || closable || headerActions) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="text-gray-500 dark:text-gray-400">{icon}</div>
              )}
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
            </div>

            <div className="flex items-center gap-2">
              {headerActions}
              {closable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  icon={<X className="h-5 w-5" />}
                  aria-label="Close panel"
                />
              )}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  )
}
