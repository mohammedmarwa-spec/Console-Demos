import { aquariumSelectValue } from '../lib/aquariumSelect'

describe('aquariumSelectValue', () => {
  it('returns string options as-is', () => {
    expect(aquariumSelectValue('Caio')).toBe('Caio')
  })

  it('extracts value from Aquarium Select option objects', () => {
    expect(aquariumSelectValue({ label: 'Caio', value: 'Caio' }, 'all')).toBe('Caio')
  })

  it('falls back when selection is cleared', () => {
    expect(aquariumSelectValue(null, 'all')).toBe('all')
  })
})
