import { useEffect, useState } from 'react'
import { THEME_STORAGE_KEY, type ThemeId } from './themes'

const DEFAULT_THEME: ThemeId = 'dreamy'

function getInitialTheme(): ThemeId {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (
    stored === 'dreamy' ||
    stored === 'garden' ||
    stored === 'berry' ||
    stored === 'ocean' ||
    stored === 'cosmos' ||
    stored === 'starlit' ||
    stored === 'nebula'
  ) {
    return stored
  }
  return DEFAULT_THEME
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(getInitialTheme)

  useEffect(() => {
    document.body.dataset.theme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  return { theme, setTheme }
}
