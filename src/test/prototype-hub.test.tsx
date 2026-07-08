import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Context } from '@aivenio/aquarium'
import { vi } from 'vitest'
import { PrototypeHub } from '../components/hub/PrototypeHub'
import { checkPreviewImageAvailable, _clearPreviewAvailabilityCache } from '../lib/prototypePreview'
import { ThemeProvider } from '../theme'

vi.mock('../lib/prototypePreview', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/prototypePreview')>()
  return {
    ...actual,
    checkPreviewImageAvailable: vi.fn(actual.checkPreviewImageAvailable),
  }
})

const mockedCheckPreview = vi.mocked(checkPreviewImageAvailable)

function renderHub() {
  return render(
    <Context>
      <ThemeProvider>
        <PrototypeHub />
      </ThemeProvider>
    </Context>,
  )
}

describe('PrototypeHub', () => {
  beforeEach(() => {
    _clearPreviewAvailabilityCache()
    mockedCheckPreview.mockReset()
  })

  it('filters by search query', async () => {
    const user = userEvent.setup()
    renderHub()

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)

    await user.type(screen.getByLabelText(/search prototypes/i), 'ownership')

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: 'Caio' })).toBeInTheDocument()
  })

  it('switches type tabs', async () => {
    const user = userEvent.setup()
    renderHub()

    expect(screen.getAllByRole('button', { name: 'Start in Cursor' })).toHaveLength(15)

    await user.click(screen.getByRole('tab', { name: 'Templates' }))

    expect(screen.getByRole('tab', { name: 'Templates' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByRole('button', { name: 'Start in Cursor' })).toHaveLength(11)
    expect(screen.queryByText('Create test environment')).not.toBeInTheDocument()
  })

  it('shows preview image on card hover when available', async () => {
    mockedCheckPreview.mockResolvedValue(true)
    const user = userEvent.setup()
    renderHub()

    await user.hover(screen.getByText('Create test environment'))

    await waitFor(
      () => {
        expect(
          screen.getByRole('img', { name: 'Preview of Create test environment' }),
        ).toBeInTheDocument()
      },
      { timeout: 1000 },
    )
  })

  it('shows placeholder on card hover when preview is missing', async () => {
    mockedCheckPreview.mockResolvedValue(false)
    const user = userEvent.setup()
    renderHub()

    await user.hover(screen.getByText('Empty project'))

    await waitFor(
      () => {
        expect(screen.getByText('Preview coming soon')).toBeInTheDocument()
      },
      { timeout: 1000 },
    )
  })
})
