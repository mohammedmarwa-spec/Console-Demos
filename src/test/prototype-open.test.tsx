/**
 * Integration smoke: each migrated prototype scenario renders the expected console view.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Context } from '@aivenio/aquarium'
import mockRouter from 'next-router-mock'
import App from '../App'
import { PROTOTYPE_SCENARIOS } from '../content/prototype-scenarios'
import { resolveRuntime } from '../scenarios/scenarioRuntime'
import { viewToPath } from '../lib/navigation'
import { DEEPTRACE_DEMO_PG_ID } from '../mocks/services/deeptrace'

vi.mock('@aivenio/aquarium/charts', () => {
  const React = require('react') as typeof import('react')
  const passthrough = ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', {}, children)
  const Axis = {
    XAxis: { Time: () => null },
    YAxis: passthrough,
  }
  const BarChart = Object.assign(passthrough, {
    Tooltip: passthrough,
    Bar: () => null,
  })
  return {
    timeHour: { every: () => () => [] as unknown[] },
    Axis,
    BarChart,
  }
})

function launchScenario(scenarioId: string) {
  const runtime = resolveRuntime(scenarioId)
  const path = viewToPath(runtime.initialView, {
    serviceId: runtime.initialOverviewServiceId ?? null,
  })
  mockRouter.setCurrentUrl(`${path}?scenario=${encodeURIComponent(scenarioId)}`)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('scenario:active', scenarioId)
  }
  return render(
    <Context>
      <App />
    </Context>,
  )
}

/** Per-prototype assertion on rendered console content. */
const PROTOTYPE_EXPECTATIONS: Record<string, () => Promise<void> | void> = {
  'onboarding-playground': async () => {
    await waitFor(() => {
      expect(screen.getByText('Welcome to Aiven')).toBeInTheDocument()
    })
  },
  'first-time-user': async () => {
    await waitFor(() => {
      expect(screen.getByText('No services yet')).toBeInTheDocument()
    })
  },
  'mysql-acu-rollout': async () => {
    await waitFor(() => {
      expect(screen.getByText('mysql-prod-01')).toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: /New configuration and pricing for MySQL/i })).toBeInTheDocument()
    })
  },
  'invoice-mixed-services': async () => {
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Invoice for 1 February/i })).toBeInTheDocument()
    })
  },
  'invoice-plan-acumixed': async () => {
    await waitFor(() => {
      expect(screen.getByText(/Project: aiven-production/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Total: \$1,612\.45 USD/i)).toBeInTheDocument()
  },
  'replica-mixed-pricing': async () => {
    await waitFor(() => {
      expect(screen.getByText('mysql-both-acu')).toBeInTheDocument()
    })
  },
  'free-dev-upgrade-v4': async () => {
    await waitFor(() => {
      expect(screen.getByText('valkey-free-01')).toBeInTheDocument()
    })
  },
  'deeptrace-demo': async () => {
    await waitFor(() => {
      expect(screen.getAllByText(DEEPTRACE_DEMO_PG_ID).length).toBeGreaterThan(0)
    })
  },
}

describe('prototype scenarios open correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('scenario:active')
    }
    mockRouter.setCurrentUrl('/')
  })

  it('covers every catalogued prototype', () => {
    for (const scenario of PROTOTYPE_SCENARIOS) {
      expect(PROTOTYPE_EXPECTATIONS[scenario.id]).toBeDefined()
    }
  })

  it.each(PROTOTYPE_SCENARIOS.map((s) => [s.id, s.title] as const))(
    '%s (%s) renders expected console content',
    async (scenarioId) => {
      launchScenario(scenarioId)
      await PROTOTYPE_EXPECTATIONS[scenarioId]()
      expect(window.localStorage.getItem('scenario:active')).toBe(scenarioId)
    },
  )
})
