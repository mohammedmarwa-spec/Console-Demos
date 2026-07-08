/** Normalizes Aquarium Select `onChange` payloads (string option or `{ value }` object). */
export function aquariumSelectValue(
  selected: string | { value?: string } | null | undefined,
  fallback = '',
): string {
  if (selected == null) return fallback
  if (typeof selected === 'string') return selected
  return String(selected.value ?? fallback)
}
