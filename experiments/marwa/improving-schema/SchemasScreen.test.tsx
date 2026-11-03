import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { Context } from '@aivenio/aquarium'
import { SchemasScreen } from './SchemasScreen'
import { createDefaultSubjects, type SchemaSubject, type SchemaVersion } from './schemaData'

afterEach(() => {
  cleanup()
})

function version(partial: Partial<SchemaVersion> & Pick<SchemaVersion, 'version' | 'schemaId'>): SchemaVersion {
  return { id: String(partial.version), softDeleted: false, ...partial }
}

const oneVersion: SchemaSubject[] = [
  {
    name: 'metrics_data_gen-value',
    compatibility: null,
    versions: [version({ version: 1, schemaId: 1 })],
  },
]

const severalVersions: SchemaSubject[] = [
  {
    name: 'orders-value',
    compatibility: 'FULL',
    versions: [
      version({ version: 1, schemaId: 2 }),
      version({ version: 2, schemaId: 3 }),
      version({ version: 3, schemaId: 4, softDeleted: true }),
    ],
  },
]

function renderScreen(subjects?: SchemaSubject[]) {
  return render(
    <Context>
      <SchemasScreen initialSubjects={subjects} />
    </Context>,
  )
}

describe('schema subject list', () => {
  it('renders a flat subject table and one primary action', () => {
    renderScreen(oneVersion)

    expect(screen.getByRole('heading', { name: 'Schemas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create new schema' })).toBeInTheDocument()
    const compatibilityControl = screen.getByRole('link', { name: 'Global compatibility level' })
    expect(compatibilityControl).toBeInTheDocument()
    expect(compatibilityControl).not.toHaveTextContent('BACKWARD')
    expect(screen.getAllByText('BACKWARD').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'List' })).not.toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search subjects' })).toHaveAttribute('placeholder', 'Search subjects')
    expect(screen.getByRole('link', { name: 'metrics_data_gen-value' })).toBeInTheDocument()
    expect(screen.getByText('inherited')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions for metrics_data_gen-value' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Subject' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Type' })).not.toBeInTheDocument()
  })

  it('shows only the first page', () => {
    renderScreen(createDefaultSubjects())

    expect(screen.getByRole('link', { name: 'metrics_data_gen-value' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'heartbeats-key' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Page' })).not.toBeInTheDocument()
  })

  it('hides pagination for a single page and shows the empty state when there are no subjects', () => {
    renderScreen(oneVersion)
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    cleanup()

    renderScreen([])
    expect(screen.getByText('No subjects yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create new schema' })).toBeInTheDocument()
  })

  it('opens set global compatibility from the settings icon', async () => {
    const user = userEvent.setup()
    renderScreen(oneVersion)

    await user.click(screen.getByRole('link', { name: 'Global compatibility level' }))
    const dialog = await screen.findByRole('dialog', { name: 'Set global compatibility' })
    expect(dialog).toHaveTextContent(
      'Set the global compatibility for all the subjects. If compatibility is not set for subject, the global compatibility will apply.',
    )
    expect(within(dialog).getByRole('button', { name: 'Set compatibility' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('names the subject in the delete confirmation and removes it', async () => {
    const user = userEvent.setup()
    renderScreen(oneVersion)

    await user.click(screen.getByRole('button', { name: 'Actions for metrics_data_gen-value' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete subject' }))

    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveTextContent('Delete subject metrics_data_gen-value?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete subject' }))

    expect(screen.queryByRole('link', { name: 'metrics_data_gen-value' })).not.toBeInTheDocument()
    expect(screen.getByText('No subjects yet')).toBeInTheDocument()
  })

  it('returns focus to the subject actions button after the dialog closes', async () => {
    const user = userEvent.setup()
    renderScreen(oneVersion)
    const trigger = screen.getByRole('button', { name: 'Actions for metrics_data_gen-value' })

    await user.click(trigger)
    await user.click(await screen.findByRole('menuitem', { name: 'Set compatibility level' }))
    const dialog = await screen.findByRole('dialog', { name: 'Set metrics_data_gen-value compatibility level' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(trigger).toHaveFocus()
  })
})

describe('schema subject detail', () => {
  it('disables compare when the subject has fewer than 2 versions', async () => {
    const user = userEvent.setup()
    renderScreen(oneVersion)

    await user.click(screen.getByRole('link', { name: 'metrics_data_gen-value' }))

    expect(screen.getByRole('heading', { name: 'metrics_data_gen-value' })).toBeInTheDocument()
    expect(screen.getByText('inherited')).toBeInTheDocument()
    const compare = screen.getByRole('button', { name: 'Compare schemas' })
    expect(compare).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Add version' })).toBeEnabled()
    expect(screen.queryByRole('columnheader', { name: 'Soft deleted' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Created' })).not.toBeInTheDocument()

    await user.hover(compare)
    expect(await screen.findByText('Needs at least 2 versions')).toBeInTheDocument()
  })

  it('enables compare when the subject has at least 2 versions', async () => {
    const user = userEvent.setup()
    renderScreen(severalVersions)

    await user.click(screen.getByRole('link', { name: 'orders-value' }))

    const addVersion = screen.getByRole('button', { name: 'Add version' })
    const compare = screen.getByRole('button', { name: 'Compare schemas' })
    const actions = screen.getByRole('button', { name: 'Actions for orders-value' })
    expect(compare).toBeEnabled()
    expect(screen.queryByText('inherited')).not.toBeInTheDocument()
    expect(screen.getByText('Soft deleted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Actions for version 2' })).toBeInTheDocument()
    expect(addVersion.compareDocumentPosition(compare) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(compare.compareDocumentPosition(actions) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    await user.click(compare)
    expect(screen.getByRole('heading', { name: 'Compare schema versions' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Compare Version' })).toHaveValue('1')
    expect(screen.getByRole('textbox', { name: 'To Version' })).toHaveValue('1')
  })

  it('names the version in the delete confirmation and marks it soft deleted', async () => {
    const user = userEvent.setup()
    renderScreen(severalVersions)

    await user.click(screen.getByRole('link', { name: 'orders-value' }))
    await user.click(screen.getByRole('button', { name: 'Actions for version 1' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete version' }))

    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveTextContent('Delete version 1 of orders-value?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete version' }))

    expect(screen.getAllByText('Soft deleted').length).toBeGreaterThan(1)
  })

  it('returns to the list after deleting the subject', async () => {
    const user = userEvent.setup()
    renderScreen(oneVersion)

    await user.click(screen.getByRole('link', { name: 'metrics_data_gen-value' }))
    await user.click(screen.getByRole('button', { name: 'Actions for metrics_data_gen-value' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete subject' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete subject' }))

    expect(screen.getByRole('heading', { name: 'Schemas' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'metrics_data_gen-value' })).not.toBeInTheDocument()
  })

  it('returns focus to the version actions button after the dialog closes', async () => {
    const user = userEvent.setup()
    renderScreen(severalVersions)
    await user.click(screen.getByRole('link', { name: 'orders-value' }))
    const trigger = screen.getByRole('button', { name: 'Actions for version 1' })

    await user.click(trigger)
    await user.click(await screen.findByRole('menuitem', { name: 'Delete version' }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(trigger).toHaveFocus()
  })
})
