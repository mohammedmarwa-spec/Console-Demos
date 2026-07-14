import { Box } from '@aivenio/aquarium'
import { getOwnerAvatarSrc, isKnownOwnerSlug } from '../../lib/designTeamOwners'

export type DesignerAvatarProps = {
  ownerSlug: string
  size?: number
}

export function DesignerAvatar({ ownerSlug, size = 40 }: DesignerAvatarProps) {
  if (!isKnownOwnerSlug(ownerSlug)) return null

  return (
    <Box
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <img
        src={getOwnerAvatarSrc(ownerSlug)}
        alt=""
        width={size}
        height={size}
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </Box>
  )
}

DesignerAvatar.displayName = 'DesignerAvatar'
