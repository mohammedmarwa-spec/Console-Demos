'use client'

import { useTheme, type ThemePreference } from '../theme'
import './appearance-switcher.css'

function ThemeOption({
  label,
  value,
  current,
  onSelect,
}: {
  label: string
  value: ThemePreference
  current: ThemePreference
  onSelect: (value: ThemePreference) => void
}) {
  const active = current === value
  return (
    <button
      type="button"
      className={`appearance-switcher__btn${active ? ' appearance-switcher__btn--active' : ''}`}
      onClick={() => onSelect(value)}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

export function AppearanceSwitcher({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme()

  return (
    <div
      className={['appearance-switcher', className].filter(Boolean).join(' ')}
      role="group"
      aria-label="Appearance"
    >
      <ThemeOption label="System" value="system" current={preference} onSelect={setPreference} />
      <ThemeOption label="Light" value="light" current={preference} onSelect={setPreference} />
      <ThemeOption label="Dark" value="dark" current={preference} onSelect={setPreference} />
    </div>
  )
}

AppearanceSwitcher.displayName = 'AppearanceSwitcher'
