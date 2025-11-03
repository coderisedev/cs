import React, { createContext, useContext, useReducer, useEffect } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeState {
  theme: Theme
  isDark: boolean
}

type ThemeAction = 
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'TOGGLE_THEME' }
  | { type: 'LOAD_THEME'; payload: Theme }

const initialState: ThemeState = {
  theme: 'dark',
  isDark: true,
}

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME': {
      const isDark = action.payload === 'dark'
      return {
        theme: action.payload,
        isDark,
      }
    }
    case 'TOGGLE_THEME': {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      return {
        theme: newTheme,
        isDark: newTheme === 'dark',
      }
    }
    case 'LOAD_THEME': {
      const isDark = action.payload === 'dark'
      return {
        theme: action.payload,
        isDark,
      }
    }
    default:
      return state
  }
}

interface ThemeContextType extends ThemeState {
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cockpit-theme') as Theme
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      dispatch({ type: 'LOAD_THEME', payload: savedTheme })
    }
  }, [])

  // Save theme to localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('cockpit-theme', state.theme)
    
    // Apply theme to document root
    const root = document.documentElement
    root.setAttribute('data-theme', state.theme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', state.isDark ? '#1a1a1a' : '#ffffff')
    }
  }, [state.theme, state.isDark])

  const setTheme = (theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme })
  }

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' })
  }

  return (
    <ThemeContext.Provider
      value={{
        ...state,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
