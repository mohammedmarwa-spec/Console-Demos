/**
 * Colors from aiven.io (`--color-*` on the live global stylesheet).
 * Keep in sync with https://aiven.io/ remix global CSS.
 */
export const aivenWeb = {
  black: '#05080f',
  white: '#ffffff',
  green: '#5ffa74',
  green50: '#1fdc6f',
  purple: '#df56f2',
  purple90: '#4c034f',
  yellow: '#fdcd12',
  deepBlue: '#6f64ff',
  deepBlue20: '#c2c9ff',
  deepBlue30: '#9ca5ff',
  teal: '#2ed0cd',
  lightBlue: '#59d2f4',
  grey70: '#2d2e30',
  grey80: '#0d0e10',
} as const

/** Hive accent colors drawn from the Aiven website stylesheet. */
export const hivePalette = [
  aivenWeb.teal,
  aivenWeb.purple,
  aivenWeb.green,
  aivenWeb.yellow,
  aivenWeb.lightBlue,
] as const
