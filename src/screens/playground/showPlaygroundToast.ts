import type { useToast } from '@aivenio/aquarium'
import tickIcon from '@aivenio/aquarium/icons/tick'

type AddToast = ReturnType<typeof useToast>

type PlaygroundToastOptions = {
  duration?: number
  /** Pass `undefined` to omit the default success icon. */
  icon?: typeof tickIcon | undefined
  variant?: 'default' | 'danger'
}

/** Aquarium Toast defaults for onboarding-playground (Feedback/Toast — default variant + icon). */
export function showPlaygroundToast(
  addToast: AddToast,
  message: string,
  options?: PlaygroundToastOptions,
) {
  addToast({
    variant: 'default',
    position: 'top-right',
    duration: 4000,
    icon: tickIcon,
    message,
    ...options,
  })
}
