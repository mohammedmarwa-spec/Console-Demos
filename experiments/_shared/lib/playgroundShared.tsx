/** Top-align radio/checkbox in checkable card title row (DS CardInputWrapper defaults to vertical center). */
export const ONBOARDING_CHECKABLE_CARD_CSS = `
  .onboarding-checkable-cards label.Aquarium-Card\\.Label input[type="radio"],
  .onboarding-checkable-cards label.Aquarium-Card\\.Label input[type="checkbox"] {
    align-self: start !important;
  }
  .onboarding-checkable-cards label.Aquarium-Card\\.Label .flex.flex-col.flex-auto > div:first-child {
    align-items: start !important;
    align-content: start !important;
  }
`

export const ONBOARDING_CHECKABLE_CARD_RING_CSS = `
  .onboarding-checkable-cards label.Aquarium-Card\\.Label {
    box-sizing: border-box !important;
    border: 2px solid var(--aquarium-border-color-muted) !important;
    outline: none !important;
    outline-offset: 0 !important;
    box-shadow: none !important;
    min-width: 0 !important;
    width: 100%;
  }
  .onboarding-checkable-cards label.Aquarium-Card\\.Label.ring-2 {
    --tw-ring-offset-shadow: 0 0 #0000 !important;
    --tw-ring-shadow: 0 0 #0000 !important;
    --tw-ring-width: 0 !important;
    --tw-ring-offset-width: 0 !important;
    border-color: var(--aquarium-border-color-primary-default) !important;
  }
`
