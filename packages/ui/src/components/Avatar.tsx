import React from 'react'
import { cn } from '../utils/cn'

export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback,
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  const [error, setError] = React.useState(false)

  const showFallback = !src || error

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden',
        sizes[size],
        className
      )}
    >
      {showFallback ? (
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setError(true)}
        />
      )}
    </div>
  )
}
