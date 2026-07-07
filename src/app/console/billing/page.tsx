'use client'

import BillingInvoiceDetail from '../../../screens/BillingInvoiceDetail'
import { usePlaygroundState } from '../../../contexts/PlaygroundStateContext'

export default function BillingPage() {
  const { navigateToOrg, navigateToBilling } = usePlaygroundState()

  return (
    <BillingInvoiceDetail
      onBack={navigateToBilling}
      onOrgHomeClick={navigateToOrg}
      onBillingClick={navigateToBilling}
    />
  )
}
