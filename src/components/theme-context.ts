import { createContext } from 'react'

type Theme = 'light' | 'dark'

export const STORAGE_KEY = '***'

export type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
