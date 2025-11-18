import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setThemeState(stored)
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => updateResolvedTheme(stored || 'system')
    mediaQuery.addEventListener('change', handleChange)

    updateResolvedTheme(stored || 'system')

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const updateResolvedTheme = (currentTheme: Theme) => {
    if (currentTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setResolvedTheme(isDark ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', isDark)
    } else {
      setResolvedTheme(currentTheme)
      document.documentElement.classList.toggle('dark', currentTheme === 'dark')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    updateResolvedTheme(newTheme)
  }

  return { theme, resolvedTheme, setTheme }
}
