import { Sun, Moon } from 'lucide-react'
import { Button } from './button'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`touch-target transition-all duration-300 ${
        isDark 
          ? 'text-neutral-50 hover:text-primary-400 hover:bg-background-elevated' 
          : 'text-foreground-primary hover:text-primary-500 hover:bg-background-elevated border border-border-primary'
      }`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon 
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
      <span className="sr-only">
        {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      </span>
    </Button>
  )
}
