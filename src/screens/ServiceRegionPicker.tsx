import { useId, useMemo } from 'react'
import { Box, ChoiceChip, ChoiceChipGroup, Select } from '@aivenio/aquarium'
import { CloudProviderIcon } from './CloudProviderIcon'
import {
  CLOUD_PROVIDERS,
  type CloudProviderId,
  findRegionBySelectValue,
  formatRegionSelectValue,
  type Region,
  regionsToGroupedSelectOptions,
} from './serviceRegions'

export type ServiceRegionPickerProps = {
  cloud: CloudProviderId
  regionId: string
  onRegionChange: (regionId: string) => void
  regionsByCloud: Record<CloudProviderId, Region[]>
  /** Outer max width for the cloud row + select stack (Create Service uses 700) */
  maxWidth?: number | string
  /** Extra margin below cloud chips (when shown) */
  cloudChipsMarginBottom?: number
  /**
   * When false, cloud provider chips are hidden; `cloud` selects which region list to use.
   * @default true
   */
  showCloudPicker?: boolean
  /** Required when `showCloudPicker` is true (default). */
  onCloudChange?: (cloud: CloudProviderId) => void
}

/**
 * Cloud provider chips + grouped region Select — same pattern as the Professional
 * "Cloud" section in {@link ./CreateService.tsx}.
 */
export function ServiceRegionPicker({
  cloud,
  onCloudChange,
  regionId,
  onRegionChange,
  regionsByCloud,
  maxWidth = 700,
  cloudChipsMarginBottom = 24,
  showCloudPicker = true,
}: ServiceRegionPickerProps) {
  const chipGroupName = useId()
  const regions = regionsByCloud[cloud] ?? []
  const selectedRegion = useMemo(() => {
    const found = regions.find((r) => r.id === regionId)
    return found ?? regions[0]
  }, [regions, regionId])

  const groupedOptions = useMemo(() => regionsToGroupedSelectOptions(regions), [regions])

  return (
    <>
      {showCloudPicker && (
        <Box style={{ marginBottom: cloudChipsMarginBottom }}>
          <ChoiceChipGroup
            name={chipGroupName}
            selectionMode="radio"
            value={cloud}
            onChange={(v) => onCloudChange?.(v as CloudProviderId)}
          >
            {CLOUD_PROVIDERS.map((c) => (
              <ChoiceChip key={c.id} value={c.id}>
                <Box component="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CloudProviderIcon id={c.id} />
                  {c.label}
                </Box>
              </ChoiceChip>
            ))}
          </ChoiceChipGroup>
        </Box>
      )}
      <Box style={{ maxWidth }}>
        <Select
          labelText="Select region"
          options={groupedOptions}
          value={selectedRegion ? formatRegionSelectValue(selectedRegion) : ''}
          onChange={(val) => {
            const found = findRegionBySelectValue(regions, String(val ?? ''))
            if (found) onRegionChange(found.id)
          }}
        />
      </Box>
    </>
  )
}

ServiceRegionPicker.displayName = 'ServiceRegionPicker'
