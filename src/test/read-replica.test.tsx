/**
 * Tests for the read-replica feature:
 *  - CreateReadReplicaModal rendering and submission
 *  - ServiceOverview Read replica section (empty state vs populated)
 *  - Full creation flow via App (integration)
 *  - Replica navigation
 *  - Delete flow (overview + services table)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// ─── Aquarium mock ────────────────────────────────────────────────────────────
// vi.mock is hoisted to the top of the file, so the factory must be self-contained
// (no references to variables declared in outer scope).

vi.mock('@aivenio/aquarium', () => {
  const React = require('react') as typeof import('react')
  const pass =
    (tag = 'div') =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ children, onClick, href, ...rest }: any) =>
      React.createElement(tag, { onClick, href, 'data-testid': rest['data-testid'] }, children)

  const Button = {
    Primary: ({ children, onClick, disabled }: { children?: React.ReactNode; onClick?: () => void; disabled?: boolean }) =>
      React.createElement('button', { onClick, disabled, 'data-type': 'primary' }, children),
    Secondary: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) =>
      React.createElement('button', { onClick, 'data-type': 'secondary' }, children),
    Ghost: ({ children, onClick, 'aria-label': ariaLabel }: { children?: React.ReactNode; onClick?: () => void; 'aria-label'?: string }) =>
      React.createElement('button', { onClick, 'aria-label': ariaLabel, 'data-type': 'ghost' }, children),
  }

  const Typography = {
    Default: pass('span'),
    DefaultStrong: pass('strong'),
    Small: pass('small'),
    SmallStrong: pass('strong'),
    Caption: pass('span'),
    Heading: pass('h2'),
    LargeHeading: pass('h1'),
  }

  const Modal = ({ open, children, title, onClose }: { open: boolean; children?: React.ReactNode; title?: string; onClose?: () => void }) =>
    open
      ? React.createElement('div', { role: 'dialog', 'aria-label': title },
          React.createElement('button', { onClick: onClose, 'aria-label': 'close' }, '×'),
          children,
        )
      : null

  const Section = ({ title, children, actions }: {
    title?: string
    children?: React.ReactNode
    actions?: { text: string; onClick?: () => void }
    [key: string]: unknown
  }) =>
    React.createElement('section', {},
      React.createElement('h3', {}, title),
      actions ? React.createElement('button', { onClick: actions.onClick }, actions.text) : null,
      children,
    )

  const Alert = ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { role: 'alert' }, children)

  const Input = ({ labelText, value, onChange, description }: { labelText?: string; value?: string; onChange?: React.ChangeEventHandler<HTMLInputElement>; description?: string }) =>
    React.createElement('div', {},
      labelText ? React.createElement('label', {}, labelText) : null,
      description ? React.createElement('span', {}, description) : null,
      React.createElement('input', { value, onChange, 'aria-label': labelText }),
    )

  const Box = ({ children, component, onClick, ...rest }: { children?: React.ReactNode; component?: string; onClick?: () => void; style?: unknown; [key: string]: unknown }) => {
    const tag = component ?? 'div'
    return React.createElement(tag as string, { onClick, 'data-testid': rest['data-testid'] }, children)
  }

  const TagLabelComp = ({ title }: { title?: string }) =>
    React.createElement('span', { 'data-testid': 'tag-label' }, title)

  const Link = ({ children, onClick, href }: { children?: React.ReactNode; onClick?: React.MouseEventHandler; href?: string }) =>
    React.createElement('a', { onClick, href }, children)

  // DropdownMenu: uses React context to propagate onAction from parent to items
  const DropdownCtx = React.createContext<((key: string) => void) | undefined>(undefined)
  const DropdownMenu = Object.assign(
    ({ children, onAction }: { children?: React.ReactNode; onAction?: (key: string) => void }) =>
      React.createElement(DropdownCtx.Provider, { value: onAction },
        React.createElement('div', {}, children),
      ),
    {
      Trigger: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
      Items: ({ children }: { children?: React.ReactNode }) => React.createElement('ul', {}, children),
      Item: ({ children, id }: { children?: React.ReactNode; id?: string }) => {
        const onAction = React.useContext(DropdownCtx)
        return React.createElement('button', { onClick: () => onAction?.(id ?? '') }, children)
      },
    },
  )

  // PageHeader: renders title, subtitle, primaryAction button, and wires onAction for menu items.
  const PageHeader = ({
    title,
    subtitle,
    primaryAction,
    menu,
    onAction,
  }: {
    title?: string
    subtitle?: React.ReactNode
    primaryAction?: { text: string; onClick?: () => void }
    menu?: React.ReactNode
    onAction?: (key: string) => void
    [key: string]: unknown
  }) =>
    React.createElement('div', {},
      React.createElement('h1', {}, title),
      subtitle ? React.createElement('div', {}, subtitle) : null,
      primaryAction
        ? React.createElement('button', { onClick: primaryAction.onClick, 'data-type': 'primary' }, primaryAction.text)
        : null,
      React.createElement(DropdownCtx.Provider, { value: onAction },
        React.createElement('button', { 'aria-label': 'menu' }, 'menu'),
        menu,
      ),
    )

  const Breadcrumbs = Object.assign(
    ({ children }: { children?: React.ReactNode }) => React.createElement('nav', {}, children),
    {
      Crumb: ({ children }: { children?: React.ReactNode }) => React.createElement('span', {}, children),
    },
  )

  const Tabs = Object.assign(
    ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
    {
      Tab: ({ title }: { title?: string }) => React.createElement('button', {}, title),
    },
  )

  const Tooltip = ({ children }: { children?: React.ReactNode }) => React.createElement('span', {}, children)
  const Icon = () => React.createElement('span', { 'aria-hidden': true })

    const NavigationComp = Object.assign(
      ({ children }: { children?: React.ReactNode }) => React.createElement('nav', {}, children),
      {
        Header: Object.assign(
          ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
          {
            Title: pass('h2'),
            Subtitle: pass('span'),
          },
        ),
        Item: ({ children, onClick, href }: { children?: React.ReactNode; onClick?: React.MouseEventHandler; href?: string }) =>
          React.createElement('a', { onClick, href }, children),
        Divider: () => React.createElement('hr', {}),
      },
    )

    const BadgeComp = Object.assign(pass(), {
      Notification: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
    })

    const RadioButton = ({ children, caption }: { children?: React.ReactNode; caption?: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', {},
        React.createElement('span', {}, children),
        caption ? React.createElement('span', {}, caption) : null,
      )

    return {
      Box,
      Button,
      Typography,
      Modal,
      Section,
      Alert,
      Input,
      InputBase: Input,
      TagLabel: TagLabelComp,
      Link,
      DropdownMenu,
      Tabs,
      Tooltip,
      Icon,
      Badge: BadgeComp,
      Navigation: NavigationComp,
      PageHeader,
      Breadcrumbs,
      StatusChip: ({ text, badge }: { text?: string; badge?: number; [key: string]: unknown }) =>
        React.createElement('span', {}, badge != null ? `${text} ${badge}` : text),
      Switch: pass(),
      Table: Object.assign(pass(), {
        Head: pass(),
        Body: pass(),
        Row: pass(),
        Cell: pass('td'),
      }),
      Select: pass(),
      RadioButton,
      ChoiceChip: pass(),
      ChoiceChipGroup: pass(),
      DataTable: pass(),
    }
  })

vi.mock('@aivenio/aquarium/icons/infoSign', () => ({ default: {} }))
vi.mock('@aivenio/aquarium/icons/database', () => ({ default: {} }))
vi.mock('@aivenio/aquarium/icons/database02', () => ({ default: {} }))
vi.mock('@aivenio/aquarium/icons/tag', () => ({ default: {} }))

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import App from '../App'
import CreateReadReplicaModal from '../screens/CreateReadReplicaModal'
import CreateForkModal from '../screens/CreateForkModal'
import ServiceOverview from '../screens/ServiceOverview'
import ProjectServices from '../screens/ProjectServices'
import type { ServiceRow } from '../screens/ProjectServices'
import type { CreatedServicePayload } from '../screens/CreateService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MYSQL_SERVICE: ServiceRow = {
  id: 'mysql-204e49c9',
  serviceName: 'mysql-204e49c9',
  serviceType: 'MySQL',
  serviceTypeId: 'mysql',
  status: 'Running',
  nodes: 'Nodes 1',
  planName: 'Startup-4',
  planDetails: '1 CPU / 4 GB RAM',
  cloudRegion: 'Google Cloud: asia-east1',
  location: 'Asia, Taiwan',
  created: '16 minutes ago',
  iconLetter: 'M',
}

const PG_SERVICE: ServiceRow = {
  ...MYSQL_SERVICE,
  id: 'pg-abc123',
  serviceName: 'pg-abc123',
  serviceType: 'PostgreSQL',
  serviceTypeId: 'postgresql',
  iconLetter: 'P',
}

function makeReplica(sourceServiceId: string, id = 'replica-mysql-204e49c9'): ServiceRow {
  return {
    id,
    serviceName: id,
    serviceType: 'MySQL',
    serviceTypeId: 'mysql',
    status: 'Running',
    nodes: 'Nodes 1',
    planName: 'Startup',
    planDetails: '1 CPU / 4 GB RAM',
    cloudRegion: 'Google Cloud: asia-east1',
    location: 'Asia, Taiwan',
    created: 'Just now',
    iconLetter: 'M',
    replicationRole: 'read_replica',
    sourceServiceId,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ServiceRow model', () => {
  it('accepts replicationRole and sourceServiceId fields', () => {
    const replica: ServiceRow = makeReplica('mysql-204e49c9')
    expect(replica.replicationRole).toBe('read_replica')
    expect(replica.sourceServiceId).toBe('mysql-204e49c9')
  })

  it('leaves replicationRole undefined for standalone services', () => {
    expect(MYSQL_SERVICE.replicationRole).toBeUndefined()
    expect(MYSQL_SERVICE.sourceServiceId).toBeUndefined()
  })
})

describe('CreateReadReplicaModal', () => {
  it('does not render when open=false', () => {
    const { container } = render(
      <CreateReadReplicaModal
        open={false}
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateReplica={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders when open=true', () => {
    render(
      <CreateReadReplicaModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateReplica={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog', { name: /create read-replica/i })).toBeInTheDocument()
  })

  it('pre-fills the replica name from the source service id', () => {
    render(
      <CreateReadReplicaModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateReplica={vi.fn()}
      />,
    )
    expect(screen.getByDisplayValue('replica-mysql-204e49c9')).toBeInTheDocument()
  })

  it('calls onCreateReplica with the entered name on submit', async () => {
    const onCreateReplica = vi.fn()
    const user = userEvent.setup()
    render(
      <CreateReadReplicaModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateReplica={onCreateReplica}
      />,
    )
    const input = screen.getByDisplayValue('replica-mysql-204e49c9')
    await user.clear(input)
    await user.type(input, 'my-custom-replica')
    await user.click(screen.getByText('Create read-replica'))
    expect(onCreateReplica).toHaveBeenCalledWith('my-custom-replica')
  })

  it('disables the submit button when the name is cleared', async () => {
    const user = userEvent.setup()
    render(
      <CreateReadReplicaModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateReplica={vi.fn()}
      />,
    )
    const input = screen.getByDisplayValue('replica-mysql-204e49c9')
    await user.clear(input)
    expect(screen.getByText('Create read-replica').closest('button')).toBeDisabled()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <CreateReadReplicaModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={onClose}
        onCreateReplica={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows the primary service name and plan in the modal', () => {
    render(
      <CreateReadReplicaModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateReplica={vi.fn()}
      />,
    )
    expect(screen.getAllByText('mysql-204e49c9').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Startup-4').length).toBeGreaterThan(0)
  })

  it('renders the single-node info alert', () => {
    render(
      <CreateReadReplicaModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateReplica={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/single-node/i)
  })

  it('shows the service summary panel', () => {
    render(
      <CreateReadReplicaModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateReplica={vi.fn()}
      />,
    )
    expect(screen.getByText('Service summary')).toBeInTheDocument()
    expect(screen.getAllByText(/\$75/).length).toBeGreaterThan(0)
  })
})

describe('ServiceOverview — Read replica section', () => {
  const baseProps = {
    serviceId: 'mysql-204e49c9',
    serviceTypeId: 'mysql' as const,
    services: [] as ServiceRow[],
    onBackToProject: vi.fn(),
    onDeleteService: vi.fn(),
    onCreateReplica: vi.fn(),
    onReplicaClick: vi.fn(),
  }

  beforeEach(() => vi.clearAllMocks())

  it('shows the empty-state description when there are no replicas', () => {
    render(<ServiceOverview {...baseProps} />)
    expect(screen.getByText(/create a read-only replica for better performance/i)).toBeInTheDocument()
  })

  it('"Create replica" action calls onCreateReplica', async () => {
    const onCreateReplica = vi.fn()
    const user = userEvent.setup()
    render(<ServiceOverview {...baseProps} onCreateReplica={onCreateReplica} />)
    await user.click(screen.getByText('Create replica'))
    expect(onCreateReplica).toHaveBeenCalledOnce()
  })

  it('renders a replica row when a matching replica exists', () => {
    const replica = makeReplica('mysql-204e49c9')
    render(<ServiceOverview {...baseProps} services={[MYSQL_SERVICE, replica]} />)
    expect(screen.getByText('replica-mysql-204e49c9')).toBeInTheDocument()
  })

  it('shows Active tag for the replica', () => {
    const replica = makeReplica('mysql-204e49c9')
    render(<ServiceOverview {...baseProps} services={[MYSQL_SERVICE, replica]} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('does not show replicas belonging to a different source service', () => {
    const otherReplica = makeReplica('pg-abc123', 'replica-pg-abc123')
    render(<ServiceOverview {...baseProps} services={[MYSQL_SERVICE, otherReplica]} />)
    expect(screen.queryByText('replica-pg-abc123')).not.toBeInTheDocument()
    expect(screen.getByText(/create a read-only replica/i)).toBeInTheDocument()
  })

  it('calls onReplicaClick with the replica id when the link is clicked', async () => {
    const onReplicaClick = vi.fn()
    const user = userEvent.setup()
    const replica = makeReplica('mysql-204e49c9')
    render(<ServiceOverview {...baseProps} services={[MYSQL_SERVICE, replica]} onReplicaClick={onReplicaClick} />)
    await user.click(screen.getByText('replica-mysql-204e49c9'))
    expect(onReplicaClick).toHaveBeenCalledWith('replica-mysql-204e49c9')
  })

  it('renders multiple replicas for the same service', () => {
    const r1 = makeReplica('mysql-204e49c9', 'replica-1')
    const r2 = makeReplica('mysql-204e49c9', 'replica-2')
    render(<ServiceOverview {...baseProps} services={[MYSQL_SERVICE, r1, r2]} />)
    expect(screen.getByText('replica-1')).toBeInTheDocument()
    expect(screen.getByText('replica-2')).toBeInTheDocument()
  })

  it('hides empty-state text once at least one replica exists', () => {
    const replica = makeReplica('mysql-204e49c9')
    render(<ServiceOverview {...baseProps} services={[MYSQL_SERVICE, replica]} />)
    expect(screen.queryByText(/create a read-only replica for better performance/i)).not.toBeInTheDocument()
  })
})

describe('ProjectServices — replica as normal service row', () => {
  it('renders a replica in the services table alongside primary services', () => {
    const replica = makeReplica('mysql-204e49c9')
    render(
      <ProjectServices
        services={[MYSQL_SERVICE, replica]}
        onCreateServiceClick={vi.fn()}
      />,
    )
    expect(screen.getByText('mysql-204e49c9')).toBeInTheDocument()
    expect(screen.getByText('replica-mysql-204e49c9')).toBeInTheDocument()
  })

  it('clicking a replica row calls onServiceClick with the replica id', async () => {
    const onServiceClick = vi.fn()
    const user = userEvent.setup()
    const replica = makeReplica('mysql-204e49c9')
    render(
      <ProjectServices
        services={[MYSQL_SERVICE, replica]}
        onCreateServiceClick={vi.fn()}
        onServiceClick={onServiceClick}
      />,
    )
    await user.click(screen.getByText('replica-mysql-204e49c9'))
    expect(onServiceClick).toHaveBeenCalledWith('replica-mysql-204e49c9')
  })

  it('calls onDeleteService when "Delete service" is chosen for a replica row', async () => {
    const onDeleteService = vi.fn()
    const user = userEvent.setup()
    const replica = makeReplica('mysql-204e49c9')
    render(
      <ProjectServices
        services={[MYSQL_SERVICE, replica]}
        onCreateServiceClick={vi.fn()}
        onDeleteService={onDeleteService}
      />,
    )
    // Each row has an "Open service menu" button with aria-label
    const menuButtons = screen.getAllByRole('button', { name: /open service menu/i })
    // The replica is the second row
    await user.click(menuButtons[1])
    await user.click(screen.getAllByText('Delete service')[1])
    expect(onDeleteService).toHaveBeenCalledWith('replica-mysql-204e49c9')
  })
})

describe('App — full create-replica flow (integration)', () => {
  beforeEach(() => vi.clearAllMocks())

  async function openServiceOverview() {
    const user = userEvent.setup()
    render(<App />)
    // The initial MySQL service is rendered in the services table; click it to open overview
    await user.click(screen.getByText('mysql-204e49c9'))
    return user
  }

  it('navigates to the service overview on row click', async () => {
    await openServiceOverview()
    // Service name appears in the overview (could appear more than once)
    expect(screen.getAllByText('mysql-204e49c9').length).toBeGreaterThan(0)
  })

  it('opens the Create read-replica modal when "Create replica" is clicked', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create replica'))
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /create read-replica/i })).toBeInTheDocument()
    })
  })

  it('closes the modal when × is clicked', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create replica'))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByRole('button', { name: /close/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create read-replica/i })).not.toBeInTheDocument()
    })
  })

  it('creates a replica and shows it in the Read replica section of the primary service', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create replica'))
    await waitFor(() => screen.getByRole('dialog'))

    // Submit with the pre-filled default name
    await user.click(screen.getByText('Create read-replica'))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create read-replica/i })).not.toBeInTheDocument()
    })

    // Stays on the primary service overview; replica appears in the Read replica section
    expect(screen.getByText('replica-mysql-204e49c9')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('replica appears in the Read replica section immediately after creation', async () => {
    const user = await openServiceOverview()
    // Empty state before creation
    expect(screen.getByText(/create a read-only replica for better performance/i)).toBeInTheDocument()

    await user.click(screen.getByText('Create replica'))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByText('Create read-replica'))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create read-replica/i })).not.toBeInTheDocument()
    })

    // Still on primary service overview; replica row now visible
    expect(screen.getByText('replica-mysql-204e49c9')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.queryByText(/create a read-only replica for better performance/i)).not.toBeInTheDocument()
  })

  it('deleting a replica from its overview removes it from the primary read-replica section', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create replica'))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByText('Create read-replica'))

    // Still on primary overview; click the replica link to navigate to replica's own overview
    await waitFor(() => screen.getByText('replica-mysql-204e49c9'))
    const replicaLink = screen.getAllByText('replica-mysql-204e49c9').find((el) => el.closest('a'))
    expect(replicaLink).toBeTruthy()
    await user.click(replicaLink!)

    // Now on replica's overview — delete via the standard ⋯ service menu
    await waitFor(() => screen.getByRole('button', { name: /^menu$/i }))
    await user.click(screen.getByRole('button', { name: /^menu$/i }))
    await user.click(screen.getByText('Delete service'))

    // Navigated back to project services; replica gone
    await waitFor(() => {
      expect(screen.queryByText('replica-mysql-204e49c9')).not.toBeInTheDocument()
    })

    // Open primary service — read-replica section is empty again
    await user.click(screen.getByText('mysql-204e49c9'))
    await waitFor(() => {
      expect(screen.getByText(/create a read-only replica for better performance/i)).toBeInTheDocument()
    })
  })

  it('deleting a replica from the project services table removes it from primary read-replica section', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create replica'))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByText('Create read-replica'))

    // Navigate back to project services from the primary overview
    await waitFor(() => screen.getByText('replica-mysql-204e49c9'))
    const backLinks = screen.getAllByText('← Back to project')
    await user.click(backLinks[0])

    // Both mysql service and replica are in the services list
    await waitFor(() => {
      expect(screen.getByText('replica-mysql-204e49c9')).toBeInTheDocument()
    })

    // Delete the replica via its row's "Open service menu" button (aria-label)
    const menuButtons = screen.getAllByRole('button', { name: /open service menu/i })
    // Replica is the second row (mysql is first)
    await user.click(menuButtons[1])
    await user.click(screen.getAllByText('Delete service')[1])

    // Replica no longer in the list
    await waitFor(() => {
      expect(screen.queryByText('replica-mysql-204e49c9')).not.toBeInTheDocument()
    })

    // Open primary service — read-replica section is empty
    await user.click(screen.getByText('mysql-204e49c9'))
    await waitFor(() => {
      expect(screen.getByText(/create a read-only replica for better performance/i)).toBeInTheDocument()
    })
  })

  it('navigating to replica overview from primary service shows standard service overview', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create replica'))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByText('Create read-replica'))

    // Replica is now visible in the primary service's Read replica section
    await waitFor(() => screen.getByText('Active'))
    const replicaLinks = screen.getAllByText('replica-mysql-204e49c9')
    const replicaAnchor = replicaLinks.find((el) => el.closest('a'))
    expect(replicaAnchor).toBeTruthy()
    await user.click(replicaAnchor!)

    // Now on the replica's standard service overview
    await waitFor(() => {
      expect(screen.getAllByText('replica-mysql-204e49c9').length).toBeGreaterThan(0)
    })
    // Standard service overview elements present: the ⋯ menu button and Quick connect
    expect(screen.getByRole('button', { name: /^menu$/i })).toBeInTheDocument()
    expect(screen.getByText('Quick connect')).toBeInTheDocument()
  })

  it('replica created for service A is not shown in service B read replica section', () => {
    // Directly test ServiceOverview isolation: replicas filter by sourceServiceId
    const replica = makeReplica('mysql-204e49c9')
    render(
      <ServiceOverview
        serviceId="pg-abc123"
        serviceTypeId="postgresql"
        services={[PG_SERVICE, replica]}
        onCreateReplica={vi.fn()}
        onReplicaClick={vi.fn()}
      />,
    )
    expect(screen.queryByText('replica-mysql-204e49c9')).not.toBeInTheDocument()
    expect(screen.getByText(/create a read-only replica/i)).toBeInTheDocument()
  })
})

// ─── Fork helpers ─────────────────────────────────────────────────────────────

function makeFork(sourceServiceId: string, id = 'fork-mysql-204e49c9'): ServiceRow {
  return {
    id,
    serviceName: id,
    serviceType: 'MySQL',
    serviceTypeId: 'mysql',
    status: 'Running',
    nodes: 'Nodes 1',
    planName: 'Startup',
    planDetails: '1 CPU / 2 GB RAM',
    cloudRegion: 'Google Cloud: asia-east1',
    location: 'Asia, Taiwan',
    created: 'Just now',
    iconLetter: 'M',
    replicationRole: 'fork',
    sourceServiceId,
  }
}

// ─── ServiceRow model — fork ──────────────────────────────────────────────────

describe('ServiceRow model — fork', () => {
  it('accepts replicationRole="fork" and sourceServiceId', () => {
    const fork = makeFork('mysql-204e49c9')
    expect(fork.replicationRole).toBe('fork')
    expect(fork.sourceServiceId).toBe('mysql-204e49c9')
  })
})

// ─── CreateForkModal ──────────────────────────────────────────────────────────

describe('CreateForkModal', () => {
  it('does not render when open=false', () => {
    const { container } = render(
      <CreateForkModal
        open={false}
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders when open=true', () => {
    render(
      <CreateForkModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog', { name: /create.*fork/i })).toBeInTheDocument()
  })

  it('pre-fills the fork name as "fork-{serviceName}"', () => {
    render(
      <CreateForkModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    expect(screen.getByDisplayValue('fork-mysql-204e49c9')).toBeInTheDocument()
  })

  it('calls onCreateFork with the entered name on submit', async () => {
    const onCreateFork = vi.fn()
    const user = userEvent.setup()
    render(
      <CreateForkModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateFork={onCreateFork}
      />,
    )
    const input = screen.getByDisplayValue('fork-mysql-204e49c9')
    await user.clear(input)
    await user.type(input, 'my-custom-fork')
    await user.click(screen.getByText('Create fork'))
    expect(onCreateFork).toHaveBeenCalledWith('my-custom-fork')
  })

  it('disables the submit button when the name is cleared', async () => {
    const user = userEvent.setup()
    render(
      <CreateForkModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    const input = screen.getByDisplayValue('fork-mysql-204e49c9')
    await user.clear(input)
    expect(screen.getByText('Create fork').closest('button')).toBeDisabled()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <CreateForkModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={onClose}
        onCreateFork={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows the source service name and plan', () => {
    render(
      <CreateForkModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    expect(screen.getAllByText('mysql-204e49c9').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Startup-4').length).toBeGreaterThan(0)
  })

  it('shows the service summary panel', () => {
    render(
      <CreateForkModal
        open
        sourceService={MYSQL_SERVICE}
        onClose={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    expect(screen.getByText('Service summary')).toBeInTheDocument()
    expect(screen.getAllByText(/\$75/).length).toBeGreaterThan(0)
  })
})

// ─── ServiceOverview — fork badges ───────────────────────────────────────────

describe('ServiceOverview — fork', () => {
  it('shows "Fork" tag when the service has replicationRole="fork"', () => {
    const fork = makeFork('mysql-204e49c9')
    render(
      <ServiceOverview
        serviceId={fork.id}
        serviceTypeId="mysql"
        services={[MYSQL_SERVICE, fork]}
        onCreateReplica={vi.fn()}
        onReplicaClick={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    expect(screen.getByText('Fork')).toBeInTheDocument()
  })

  it('shows "Forked from" link pointing to the source service', () => {
    const fork = makeFork('mysql-204e49c9')
    render(
      <ServiceOverview
        serviceId={fork.id}
        serviceTypeId="mysql"
        services={[MYSQL_SERVICE, fork]}
        onCreateReplica={vi.fn()}
        onReplicaClick={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    expect(screen.getByText(/forked from/i)).toBeInTheDocument()
    expect(screen.getByText('mysql-204e49c9', { selector: 'a' })).toBeInTheDocument()
  })

  it('"Forked from" link calls onReplicaClick with the source service id', async () => {
    const onReplicaClick = vi.fn()
    const user = userEvent.setup()
    const fork = makeFork('mysql-204e49c9')
    render(
      <ServiceOverview
        serviceId={fork.id}
        serviceTypeId="mysql"
        services={[MYSQL_SERVICE, fork]}
        onCreateReplica={vi.fn()}
        onReplicaClick={onReplicaClick}
        onCreateFork={vi.fn()}
      />,
    )
    await user.click(screen.getByText('mysql-204e49c9', { selector: 'a' }))
    expect(onReplicaClick).toHaveBeenCalledWith('mysql-204e49c9')
  })

  it('"Create fork" action calls onCreateFork', async () => {
    const onCreateFork = vi.fn()
    const user = userEvent.setup()
    render(
      <ServiceOverview
        serviceId="mysql-204e49c9"
        serviceTypeId="mysql"
        services={[MYSQL_SERVICE]}
        onCreateReplica={vi.fn()}
        onReplicaClick={vi.fn()}
        onCreateFork={onCreateFork}
      />,
    )
    await user.click(screen.getByText('Create fork'))
    expect(onCreateFork).toHaveBeenCalledOnce()
  })

  it('fork does not appear in the Read replica section', () => {
    const fork = makeFork('mysql-204e49c9')
    render(
      <ServiceOverview
        serviceId="mysql-204e49c9"
        serviceTypeId="mysql"
        services={[MYSQL_SERVICE, fork]}
        onCreateReplica={vi.fn()}
        onReplicaClick={vi.fn()}
        onCreateFork={vi.fn()}
      />,
    )
    // Read replica section should show empty state (fork is not a replica)
    expect(screen.getByText(/create a read-only replica for better performance/i)).toBeInTheDocument()
  })
})

// ─── ProjectServices — fork as normal service row ────────────────────────────

describe('ProjectServices — fork as normal service row', () => {
  it('renders a fork in the services table alongside the source service', () => {
    const fork = makeFork('mysql-204e49c9')
    render(
      <ProjectServices
        services={[MYSQL_SERVICE, fork]}
        onCreateServiceClick={vi.fn()}
      />,
    )
    expect(screen.getByText('mysql-204e49c9')).toBeInTheDocument()
    expect(screen.getByText('fork-mysql-204e49c9')).toBeInTheDocument()
  })

  it('clicking a fork row calls onServiceClick with the fork id', async () => {
    const onServiceClick = vi.fn()
    const user = userEvent.setup()
    const fork = makeFork('mysql-204e49c9')
    render(
      <ProjectServices
        services={[MYSQL_SERVICE, fork]}
        onCreateServiceClick={vi.fn()}
        onServiceClick={onServiceClick}
      />,
    )
    await user.click(screen.getByText('fork-mysql-204e49c9'))
    expect(onServiceClick).toHaveBeenCalledWith('fork-mysql-204e49c9')
  })

  it('calls onDeleteService when "Delete service" is chosen for a fork row', async () => {
    const onDeleteService = vi.fn()
    const user = userEvent.setup()
    const fork = makeFork('mysql-204e49c9')
    render(
      <ProjectServices
        services={[MYSQL_SERVICE, fork]}
        onCreateServiceClick={vi.fn()}
        onDeleteService={onDeleteService}
      />,
    )
    const menuButtons = screen.getAllByRole('button', { name: /open service menu/i })
    await user.click(menuButtons[1])
    await user.click(screen.getAllByText('Delete service')[1])
    expect(onDeleteService).toHaveBeenCalledWith('fork-mysql-204e49c9')
  })
})

// ─── App — full create-fork flow (integration) ───────────────────────────────

describe('App — full create-fork flow (integration)', () => {
  beforeEach(() => vi.clearAllMocks())

  async function openServiceOverview() {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByText('mysql-204e49c9'))
    return user
  }

  it('opens the Create fork modal when "Create fork" is clicked', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create fork'))
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /create.*fork/i })).toBeInTheDocument()
    })
  })

  it('closes the fork modal when × is clicked', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create fork'))
    await waitFor(() => screen.getByRole('dialog', { name: /create.*fork/i }))
    await user.click(screen.getByRole('button', { name: /close/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create.*fork/i })).not.toBeInTheDocument()
    })
  })

  /** Click "Create fork" submit button inside the open modal dialog. */
  async function submitForkModal(user: ReturnType<typeof userEvent.setup>) {
    const dialog = screen.getByRole('dialog', { name: /create.*fork/i })
    const submitBtn = dialog.querySelector('button[data-type="primary"]') as HTMLElement
    await user.click(submitBtn)
  }

  it('creates a fork with auto-generated name and stays on primary service overview', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create fork'))
    await waitFor(() => screen.getByRole('dialog', { name: /create.*fork/i }))

    await submitForkModal(user)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create.*fork/i })).not.toBeInTheDocument()
    })

    // Still on the primary service overview
    expect(screen.getAllByText('mysql-204e49c9').length).toBeGreaterThan(0)
  })

  it('fork appears in the services list after creation', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create fork'))
    await waitFor(() => screen.getByRole('dialog', { name: /create.*fork/i }))
    await submitForkModal(user)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create.*fork/i })).not.toBeInTheDocument()
    })

    // Navigate back to project services
    const backLinks = screen.getAllByText('← Back to project')
    await user.click(backLinks[0])

    await waitFor(() => {
      expect(screen.getByText('fork-mysql-204e49c9')).toBeInTheDocument()
    })
  })

  it('fork can be opened from the services list as a standard service overview', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create fork'))
    await waitFor(() => screen.getByRole('dialog', { name: /create.*fork/i }))
    await submitForkModal(user)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create.*fork/i })).not.toBeInTheDocument()
    })

    const backLinks = screen.getAllByText('← Back to project')
    await user.click(backLinks[0])

    await waitFor(() => screen.getByText('fork-mysql-204e49c9'))
    await user.click(screen.getByText('fork-mysql-204e49c9'))

    await waitFor(() => {
      expect(screen.getAllByText('fork-mysql-204e49c9').length).toBeGreaterThan(0)
      expect(screen.getByText('Fork')).toBeInTheDocument()
      expect(screen.getByText(/forked from/i)).toBeInTheDocument()
    })
    // Standard service overview controls present
    expect(screen.getByText('Quick connect')).toBeInTheDocument()
  })

  it('deleting a fork from its overview removes it from the services list', async () => {
    const user = await openServiceOverview()
    await user.click(screen.getByText('Create fork'))
    await waitFor(() => screen.getByRole('dialog', { name: /create.*fork/i }))
    await submitForkModal(user)

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /create.*fork/i })).not.toBeInTheDocument()
    })

    const backLinks = screen.getAllByText('← Back to project')
    await user.click(backLinks[0])

    await waitFor(() => screen.getByText('fork-mysql-204e49c9'))
    await user.click(screen.getByText('fork-mysql-204e49c9'))

    // Delete via ⋯ menu on fork's overview
    await waitFor(() => screen.getByRole('button', { name: /^menu$/i }))
    await user.click(screen.getByRole('button', { name: /^menu$/i }))
    await user.click(screen.getByText('Delete service'))

    // Back to project services; fork gone
    await waitFor(() => {
      expect(screen.queryByText('fork-mysql-204e49c9')).not.toBeInTheDocument()
    })
    expect(screen.getByText('mysql-204e49c9')).toBeInTheDocument()
  })
})

// ─── CreatedServicePayload type ───────────────────────────────────────────────

describe('CreatedServicePayload type', () => {
  it('contains all required fields with correct types', () => {
    const payload: CreatedServicePayload = {
      serviceName: 'pg-test',
      serviceTypeId: 'postgresql',
      tier: 'professional',
      cloud: 'UpCloud',
      region: 'sg-sin',
      regionLabel: 'Singapore',
      location: 'Asia, Singapore',
      planName: 'Startup-4',
      planDetails: '2 CPU / 4 GB / 80 GB storage',
      nodeCount: 1,
      cpuCount: 2,
      ramCapacity: '4 GB',
      storageCapacity: '80 GB',
    }
    expect(payload.planName).toBe('Startup-4')
    expect(payload.nodeCount).toBe(1)
    expect(payload.ramCapacity).toBe('4 GB')
    expect(payload.storageCapacity).toBe('80 GB')
  })
})

// ─── ServiceRow model — resource fields ───────────────────────────────────────

describe('ServiceRow model — resource fields', () => {
  it('accepts nodeCount, cpuCount, ramCapacity, storageCapacity', () => {
    const row: ServiceRow = {
      ...MYSQL_SERVICE,
      nodeCount: 2,
      cpuCount: 2,
      ramCapacity: '4 GB',
      storageCapacity: '80 GB',
    }
    expect(row.nodeCount).toBe(2)
    expect(row.ramCapacity).toBe('4 GB')
    expect(row.storageCapacity).toBe('80 GB')
  })

  it('resource fields are optional — existing rows without them are still valid', () => {
    const row: ServiceRow = MYSQL_SERVICE
    expect(row.nodeCount).toBeUndefined()
    expect(row.ramCapacity).toBeUndefined()
    expect(row.storageCapacity).toBeUndefined()
  })
})

// ─── ProjectServices — table row renders plan/cloud data ──────────────────────

describe('ProjectServices — table row renders plan and cloud data', () => {
  const service: ServiceRow = {
    ...MYSQL_SERVICE,
    planName: 'Startup-4',
    planDetails: '2 CPU / 4 GB / 80 GB storage',
    cloudRegion: 'UpCloud: sg-sin',
    location: 'Asia, Singapore',
    nodes: 'Nodes 2',
    nodeCount: 2,
    ramCapacity: '4 GB',
    storageCapacity: '80 GB',
  }

  it('renders planName in the Plan column', () => {
    render(<ProjectServices services={[service]} onCreateServiceClick={vi.fn()} />)
    expect(screen.getByText('Startup-4')).toBeInTheDocument()
  })

  it('renders planDetails in the Plan column', () => {
    render(<ProjectServices services={[service]} onCreateServiceClick={vi.fn()} />)
    expect(screen.getByText('2 CPU / 4 GB / 80 GB storage')).toBeInTheDocument()
  })

  it('renders cloudRegion in the Cloud column', () => {
    render(<ProjectServices services={[service]} onCreateServiceClick={vi.fn()} />)
    expect(screen.getByText('UpCloud: sg-sin')).toBeInTheDocument()
  })

  it('renders location in the Cloud column', () => {
    render(<ProjectServices services={[service]} onCreateServiceClick={vi.fn()} />)
    expect(screen.getByText('Asia, Singapore')).toBeInTheDocument()
  })

  it('renders node count string in the Nodes column', () => {
    render(<ProjectServices services={[service]} onCreateServiceClick={vi.fn()} />)
    expect(screen.getByText('Nodes 2')).toBeInTheDocument()
  })
})

// ─── ServiceOverview — plan usage reflects service resource fields ─────────────

describe('ServiceOverview — plan usage reflects service resource fields', () => {
  function renderWithService(overrides: Partial<ServiceRow> = {}) {
    const service: ServiceRow = { ...MYSQL_SERVICE, ...overrides }
    return render(
      <ServiceOverview
        serviceId={service.id}
        serviceTypeId="mysql"
        services={[service]}
        onCreateReplica={vi.fn()}
        onReplicaClick={vi.fn()}
      />,
    )
  }

  it('shows RAM capacity from the service in the plan usage bar', () => {
    renderWithService({ ramCapacity: '4 GB' })
    expect(screen.getByText(/of 4 GB/)).toBeInTheDocument()
  })

  it('shows storage capacity from the service in the plan usage bar', () => {
    renderWithService({ storageCapacity: '350 GB' })
    expect(screen.getByText(/of 350 GB/)).toBeInTheDocument()
  })

  it('falls back to 8 GB RAM when service has no ramCapacity', () => {
    // MYSQL_SERVICE has no ramCapacity
    renderWithService()
    expect(screen.getByText(/of 8 GB/)).toBeInTheDocument()
  })

  it('falls back to 80 GB storage when service has no storageCapacity', () => {
    // MYSQL_SERVICE has no storageCapacity
    renderWithService()
    expect(screen.getByText(/of 80 GB/)).toBeInTheDocument()
  })

  it('RAM and storage values change independently with different capacities', () => {
    renderWithService({ ramCapacity: '16 GB', storageCapacity: '1000 GB' })
    expect(screen.getByText(/of 16 GB/)).toBeInTheDocument()
    expect(screen.getByText(/of 1000 GB/)).toBeInTheDocument()
  })
})

// ─── App — service creation propagates selected values ───────────────────────

describe('App — service creation data propagation (integration)', () => {
  beforeEach(() => vi.clearAllMocks())

  async function createNewPgService() {
    const user = userEvent.setup()
    render(<App />)
    // Open service type modal
    await user.click(screen.getByRole('button', { name: /create service/i }))
    await waitFor(() => screen.getByRole('dialog', { name: /select service type/i }))
    // Select PostgreSQL (renders as a button via Box component="button")
    await user.click(screen.getByText('PostgreSQL®'))
    // Creation modal opens with CreateService embedded inside
    await waitFor(() => screen.getByRole('dialog', { name: /create postgresql/i }))
    return user
  }

  it('newly created service appears in the services list', async () => {
    const user = await createNewPgService()
    // Click the primary Create button in the summary sidebar
    const dialog = screen.getByRole('dialog', { name: /create postgresql/i })
    const createBtn = dialog.querySelector('button[data-type="primary"]') as HTMLElement
    await user.click(createBtn)
    // App navigates to ServiceOverview then; go back to the list
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /create postgresql/i })).not.toBeInTheDocument())
    const backLinks = screen.getAllByText('← Back to project')
    await user.click(backLinks[0])
    // Default service name from CreateService is pg-2536119c
    await waitFor(() => {
      expect(screen.getByText('pg-2536119c')).toBeInTheDocument()
    })
  })

  it('newly created service shows the correct plan name in the list', async () => {
    const user = await createNewPgService()
    const dialog = screen.getByRole('dialog', { name: /create postgresql/i })
    const createBtn = dialog.querySelector('button[data-type="primary"]') as HTMLElement
    await user.click(createBtn)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const backLinks = screen.getAllByText('← Back to project')
    await user.click(backLinks[0])
    // Default plan is Startup-4
    await waitFor(() => {
      expect(screen.getByText('Startup-4')).toBeInTheDocument()
    })
  })

  it('service overview after creation shows RAM capacity from the selected plan', async () => {
    const user = await createNewPgService()
    const dialog = screen.getByRole('dialog', { name: /create postgresql/i })
    const createBtn = dialog.querySelector('button[data-type="primary"]') as HTMLElement
    await user.click(createBtn)
    // After creation, App navigates to ServiceOverview — RAM from default Startup-4 plan is 4 GB
    await waitFor(() => {
      expect(screen.getByText(/of 4 GB/)).toBeInTheDocument()
    })
  })

  it('service overview after creation shows storage capacity from the selected plan', async () => {
    const user = await createNewPgService()
    const dialog = screen.getByRole('dialog', { name: /create postgresql/i })
    const createBtn = dialog.querySelector('button[data-type="primary"]') as HTMLElement
    await user.click(createBtn)
    // Startup-4 plan has 80 GB storage
    await waitFor(() => {
      expect(screen.getByText(/of 80 GB/)).toBeInTheDocument()
    })
  })
})
