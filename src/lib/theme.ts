export type ThemeName = 'laranja' | 'rosa'

const STORAGE_KEY = 'confectionery_theme'
const DEFAULT_THEME: ThemeName = 'laranja'

export const THEMES: { value: ThemeName; label: string }[] = [
  { value: 'laranja', label: 'Laranja' },
  { value: 'rosa', label: 'Rosa' },
]

export function getStoredTheme(): ThemeName {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'laranja' || stored === 'rosa') return stored
  } catch {}
  return DEFAULT_THEME
}

export function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {}
}
