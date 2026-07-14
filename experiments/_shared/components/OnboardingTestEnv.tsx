import type {
  TestEnvLocationId,
  TestEnvServiceId,
} from '../lib/testEnvServicesCatalog'

export type OnboardingTestEnvCreatePayload = {
  serviceTypeId: TestEnvServiceId
  serviceName: string
  projectName: string
  location: TestEnvLocationId
}

export type OnboardingTestEnvProps = {
  userInitials: string
  defaultProjectName: string
  onSkip: () => void
  onCreate: (payload: OnboardingTestEnvCreatePayload) => void
  onCustomizePlan: (serviceTypeId: TestEnvServiceId) => void
}
