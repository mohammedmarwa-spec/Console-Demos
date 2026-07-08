import { Box } from '@aivenio/aquarium'
import { getDesignerAvatar } from '../../lib/designerAvatars'

export type DesignerAvatarProps = {
  owner: string
  size?: number
}

export function DesignerAvatar({ owner, size = 40 }: DesignerAvatarProps) {
  const avatar = getDesignerAvatar(owner)
  if (!avatar) return null

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
        src={avatar.src}
        alt=""
        width={size}
        height={size}
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </Box>
  )
}

DesignerAvatar.displayName = 'DesignerAvatar'
