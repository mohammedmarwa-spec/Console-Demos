'use client'

import { Suspense, useSyncExternalStore } from 'react'
import mockRouter from 'next-router-mock'
import { Providers } from '../app/providers'
import PlaygroundShell from '../components/playground/PlaygroundShell'
import ProjectServicesPage from '../app/console/project/services/page'
import ServiceOverviewClient from '../app/console/project/services/[serviceId]/ServiceOverviewClient'
import OrgPage from '../app/console/org/page'
import BillingPage from '../app/console/billing/page'
import TestEnvOnboardingPage from '../app/console/onboarding/test-env/page'
import PlaygroundOnboardingPage from '../app/console/onboarding/playground/page'
import { ROUTES } from '../lib/navigation'

function useMockPathname(): string {
  return useSyncExternalStore(
    (onStoreChange) => {
      const handler = () => onStoreChange()
      mockRouter.events.on('routeChangeComplete', handler)
      mockRouter.events.on('hashChangeComplete', handler)
      return () => {
        mockRouter.events.off('routeChangeComplete', handler)
        mockRouter.events.off('hashChangeComplete', handler)
      }
    },
    () => mockRouter.pathname,
    () => ROUTES.consoleServices,
  )
}

function RoutedConsoleContent() {
  const pathname = useMockPathname()

  if (pathname === ROUTES.consoleOrg) return <OrgPage />
  if (pathname === ROUTES.consoleBilling) return <BillingPage />
  if (pathname === ROUTES.consoleTestEnv) return <TestEnvOnboardingPage />
  if (pathname === ROUTES.consolePlayground) return <PlaygroundOnboardingPage />
  if (pathname.startsWith(`${ROUTES.consoleServices}/`) && pathname !== ROUTES.consoleServices) {
    return <ServiceOverviewClient />
  }
  if (pathname === ROUTES.consoleServices || pathname.startsWith('/console')) {
    return <ProjectServicesPage />
  }
  return <ProjectServicesPage />
}

/** Test harness that mirrors the Next.js console shell without the full app router. */
export default function ConsoleTestApp() {
  return (
    <Providers>
      <Suspense fallback={null}>
        <PlaygroundShell>
          <RoutedConsoleContent />
        </PlaygroundShell>
      </Suspense>
    </Providers>
  )
}
