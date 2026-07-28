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
    id: 'experiment/elena/first-time-user',
    title: 'First-time user',
    description: 'Alias of Empty project — onboarding state, no services',
    slug: 'first-time-user',
    kind: 'experiment',
    ownerSlug: 'elena',
    route: '/experiments/elena/first-time-user',
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

    expect(screen.getByText('Shorter create service flow')).toBeInTheDocument()
    expect(screen.getByText('First-time user')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Search'), 'shorter')

    expect(screen.getByText('Shorter create service flow')).toBeInTheDocument()
    expect(screen.queryByText('First-time user')).not.toBeInTheDocument()
  })

  it('switches between experiments and templates tabs', async () => {
    const user = userEvent.setup()
    renderHub()

    expect(screen.getByRole('button', { name: 'Open Shorter create service flow' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Elena' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start in Cursor' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Templates' }))

    expect(screen.getByRole('tab', { name: 'Templates' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Onboarding starter')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'Elena' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start in Cursor' })).not.toBeInTheDocument()
  })
})
