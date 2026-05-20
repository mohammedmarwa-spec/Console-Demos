import { Box, Stepper } from '@aivenio/aquarium'

export type OnboardingStep = 1 | 2

export type OnboardingStepIndicatorProps = {
  step: OnboardingStep
}

/**
 * Widen step columns without column-gap — gap breaks dense Stepper connectors
 * (they are absolutely positioned per column, not across grid gaps).
 */
const STEPPER_LAYOUT_CSS = `
  .onboarding-stepper .Aquarium-Stepper > div {
    width: max-content;
    grid-template-columns: 148px 168px;
  }
  .onboarding-stepper .Aquarium-Stepper [role="listitem"] {
    font-size: 14px;
    line-height: 20px;
  }
`

/** Read-only 2-step progress indicator for the onboarding flow. */
export function OnboardingStepIndicator({ step }: OnboardingStepIndicatorProps) {
  return (
    <Box className="onboarding-stepper" style={{ flexShrink: 0, pointerEvents: 'none' }}>
      <style>{STEPPER_LAYOUT_CSS}</style>
      <Stepper activeIndex={step - 1} dense>
        <Stepper.Step>Get started</Stepper.Step>
        <Stepper.Step>Project set-up</Stepper.Step>
      </Stepper>
    </Box>
  )
}

OnboardingStepIndicator.displayName = 'OnboardingStepIndicator'
