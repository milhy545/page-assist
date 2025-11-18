import React from 'react'
import { cn } from '../utils/cn'

export interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      {children}
    </div>
  )
}

export interface LayoutHeaderProps {
  children: React.ReactNode
  className?: string
}

export const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </header>
  )
}

export interface LayoutSidebarProps {
  children: React.ReactNode
  position?: 'left' | 'right'
  width?: string
  className?: string
}

export const LayoutSidebar: React.FC<LayoutSidebarProps> = ({
  children,
  position = 'left',
  width = '16rem',
  className,
}) => {
  return (
    <aside
      className={cn(
        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        position === 'left' ? 'border-r' : 'border-l',
        className
      )}
      style={{ width }}
    >
      {children}
    </aside>
  )
}

export interface LayoutMainProps {
  children: React.ReactNode
  className?: string
}

export const LayoutMain: React.FC<LayoutMainProps> = ({ children, className }) => {
  return <main className={cn('flex-1 overflow-auto', className)}>{children}</main>
}

export interface LayoutContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}

export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  children,
  maxWidth = 'full',
  className,
}) => {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidths[maxWidth], className)}>
      {children}
    </div>
  )
}
