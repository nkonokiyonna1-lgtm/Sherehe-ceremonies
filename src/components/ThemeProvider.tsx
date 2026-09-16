import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  STORAGE_KEY,
  ThemeContext,
  type ThemeContextValue,
} from '@/components/theme-context'

type Theme = 'light' | 'dark'

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    return null
  }
  return null
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function subscribeSystemTheme(onChange: () => void) {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

// While nothing is stored the app keeps following the OS; a stored choice
// always wins over the system on later loads (spec 0002 theme rules).
function useResolvedTheme(stored: Theme | null): Theme {
  return useSyncExternalStore(
    stored ? () => () => {} : subscribeSystemTheme,
    () => stored ?? systemTheme(),
    () => 'light' as Theme
  )
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<Theme | null>(() => readStoredTheme())
  const theme = useResolvedTheme(stored)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be blocked (private mode); the toggle still applies live.
    }
    setStored(next)
  }

  const value: ThemeContextValue = { theme, toggleTheme }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
