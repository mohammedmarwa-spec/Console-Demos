import type { ComponentManifest } from '@/lib/experiments/types'
import { billingInvoiceScreenManifest } from '@/lib/experiments/sharedScreenManifests'

export const componentManifest: ComponentManifest = {
  ...billingInvoiceScreenManifest,
  notes: [
    'ExperimentPageShell launcher for scenario "invoice-plan-acumixed".',
    'Map describes shared BillingInvoiceDetail (src/screens), not this folder.',
  ],
}
