import { useMemo, useState } from 'react'
import { Box, Button, Card, TextareaBase, Typography } from '@aivenio/aquarium'
import sendIcon from '@aivenio/aquarium/icons/send'
import { ServiceIcon } from '../../components/ServiceIcon'
import { OnboardingStepIndicator } from './OnboardingStepIndicator'
import {
  BROWSE_AI_SUGGESTIONS,
  BROWSE_SERVICES,
  type BrowseServiceId,
  type BrowseServiceOption,
} from './browseServicesCatalog'
import {
  ONBOARDING_CHECKABLE_CARD_CSS,
  ONBOARDING_CHECKABLE_CARD_RING_CSS,
  OnboardingPanelPage,
  OnboardingPanelTitle,
} from './playgroundShared'

export type BrowseServicesProps = {
  onBack: () => void
  onContinue: (selected: BrowseServiceId[]) => void
}

function BrowseServiceCard({
  service,
  selected,
  onCheckedChange,
}: {
  service: BrowseServiceOption
  selected: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <Card
      fullWidth
      checkable
      value={service.id}
      checked={selected}
      onCheckedChange={({ checked }) => onCheckedChange(checked)}
      title={
        <Card.Title>
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
            <ServiceIcon serviceTypeId={service.id} size={40} alt="" />
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
              <Typography.DefaultStrong color="intense">{service.title}</Typography.DefaultStrong>
              <Typography.Small color="muted">{service.description}</Typography.Small>
            </Box>
          </Box>
        </Card.Title>
      }
    />
  )
}

BrowseServiceCard.displayName = 'BrowseServiceCard'

function AskAiPanel() {
  const [draft, setDraft] = useState('')

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        height: '100%',
        padding: 16,
        borderRadius: 8,
        border: '1px solid var(--aquarium-border-color-muted)',
        backgroundColor: 'var(--aquarium-background-color-muted)',
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography.DefaultStrong color="intense">✦ Ask AI</Typography.DefaultStrong>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography.Small color="muted">Not sure? Ask about our products and services</Typography.Small>
          <Typography.Small color="muted">one of these to start:</Typography.Small>
        </Box>
      </Box>

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
        {BROWSE_AI_SUGGESTIONS.map((suggestion) => (
          <Button.Secondary
            key={suggestion}
            type="button"
            dense
            onClick={() => setDraft(suggestion)}
          >
            {suggestion}
          </Button.Secondary>
        ))}
      </Box>

      <Box style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Typography.Small color="intense">Describe your need</Typography.Small>
        <Box style={{ position: 'relative' }}>
          <TextareaBase
            placeholder="My app is a......"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              minHeight: 96,
              resize: 'none',
              paddingRight: 44,
              paddingBottom: 36,
              boxSizing: 'border-box',
            }}
          />
          <Box
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Button.Icon type="button" dense aria-label="Send" icon={sendIcon} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

AskAiPanel.displayName = 'AskAiPanel'

export function BrowseServices({ onBack, onContinue }: BrowseServicesProps) {
  const [selected, setSelected] = useState<Set<BrowseServiceId>>(() => new Set())

  const selectedCount = selected.size
  const selectedList = useMemo(() => [...selected], [selected])

  function setServiceSelected(id: BrowseServiceId, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <OnboardingPanelPage>
      <style>{`${ONBOARDING_CHECKABLE_CARD_RING_CSS}\n${ONBOARDING_CHECKABLE_CARD_CSS}`}</style>
      <Box
        style={{
          width: '100%',
          maxWidth: 1120,
          maxHeight: 'calc(100vh - 200px)',
          borderRadius: 12,
          backgroundColor: 'var(--aquarium-background-color-layer)',
          border: '1px solid var(--aquarium-border-color-muted)',
          boxShadow:
            '0 24px 48px -8px color-mix(in srgb, var(--aquarium-colors-black) 10%, transparent), 0 12px 24px -8px color-mix(in srgb, var(--aquarium-colors-black) 6%, transparent)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            padding: '18px 24px 17px',
            borderBottom: '1px solid var(--aquarium-border-color-muted)',
          }}
        >
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 200 }}>
            <Box
              component="span"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: 'var(--aquarium-text-color-muted)',
              }}
            >
              Browse services · {selectedCount} selected
            </Box>
            <OnboardingPanelTitle>Choose services for your project</OnboardingPanelTitle>
          </Box>
          <OnboardingStepIndicator step={2} />
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)',
            gap: 20,
            padding: '16px 24px 24px',
            overflow: 'auto',
            flex: 1,
            minHeight: 0,
            alignItems: 'stretch',
          }}
        >
          <Box className="onboarding-checkable-cards">
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12,
                alignContent: 'start',
                alignItems: 'stretch',
              }}
            >
              {BROWSE_SERVICES.map((service) => (
                <BrowseServiceCard
                  key={service.id}
                  service={service}
                  selected={selected.has(service.id)}
                  onCheckedChange={(checked) => setServiceSelected(service.id, checked)}
                />
              ))}
            </Box>
          </Box>

          <AskAiPanel />
        </Box>

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 24px 20px',
            borderTop: '1px solid var(--aquarium-border-color-muted)',
          }}
        >
          <Button.Ghost dense type="button" onClick={onBack}>
            ← Back
          </Button.Ghost>
          <Button.Primary
            type="button"
            disabled={selectedCount === 0}
            onClick={() => onContinue(selectedList)}
          >
            Continue with {selectedCount || 0} service{selectedCount === 1 ? '' : 's'}
          </Button.Primary>
        </Box>
      </Box>
    </OnboardingPanelPage>
  )
}

BrowseServices.displayName = 'BrowseServices'
