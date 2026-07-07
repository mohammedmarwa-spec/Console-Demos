'use client'

import OrgHomePage from '../../../screens/OrgHomePage'
import { usePlaygroundState } from '../../../contexts/PlaygroundStateContext'

export default function OrgPage() {
  const { navigateToServices, navigateToBilling } = usePlaygroundState()

  return (
    <OrgHomePage
      onProjectsClick={navigateToServices}
      onBillingClick={navigateToBilling}
      onInvoiceClick={navigateToBilling}
    />
  )
}
