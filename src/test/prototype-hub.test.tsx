import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Context } from '@aivenio/aquarium'
import { PrototypeHub } from '../components/hub/PrototypeHub'
import type { DiscoveredPage } from '@/lib/experiments/types'
import { ThemeProvider } from '../theme'

const experiments: DiscoveredPage[] = [
  {
    id: 'experiment/elena/shorter-create-service',
    title: 'Shorter create service flow',
    description: 'Advanced settings hidden by default — experiment from Create test environment',
    slug: 'shorter-create-service',
    kind: 'experiment',
    ownerSlug: 'elena',
    route: '/experiments/elena/shorter-create-service',
  },
  {
    id: 'experiment/caio/ownership-test',
    title: 'Workspace ownership in test env',
    description: 'Explicit personal vs org workspace choice during test environment onboarding',
    slug: 'ownership-test',
    kind: 'experiment',
    ownerSlug: 'caio',
    route: '/experiments/caio/ownership-test',
  },
]

const templates: DiscoveredPage[] = [
  {
    id: 'template/onboarding-starter',
    title: 'Onboarding starter',
    description: 'Template based on Create test environment — fork this to start a new experiment',
    slug: 'onboarding-starter',
    kind: 'template',
    route: '/experiments/_templates/onboarding-starter',
  },
]

function renderHub() {
  return render(
    <Context>
      <ThemeProvider>
        <PrototypeHub experiments={experiments} templates={templates} />
      </ThemeProvider>
    </Context>,
  )
}

describe('PrototypeHub', () => {
  it('filters by search query', async () => {
    const user = userEvent.setup()
    renderHub()

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)

    await user.type(screen.getByLabelText('Search'), 'ownership')

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: 'Caio' })).toBeInTheDocument()
  })

  it('switches between experiments and templates tabs', async () => {
    const user = userEvent.setup()
    renderHub()

    expect(screen.getAllByRole('button', { name: 'Start in Cursor' })).toHaveLength(2)
    expect(screen.getByRole('heading', { level: 2, name: 'Elena' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Templates' }))

    expect(screen.getByRole('tab', { name: 'Templates' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getAllByRole('button', { name: 'Start in Cursor' })).toHaveLength(1)
    expect(screen.getByText('Onboarding starter')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Elena' })).not.toBeInTheDocument()
  })
})
