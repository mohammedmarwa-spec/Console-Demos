import { Box, Icon } from '@aivenio/aquarium'
import { getAwsIcon } from '../assets/icons/awsIcon'
import { useResolvedTheme } from '../theme/ThemeProvider'
import type { CloudProviderId } from './serviceRegions'
import cloudGoogle from '../assets/cloud-google.svg'
import cloudAzure1 from '../assets/cloud-azure-1.svg'
import cloudAzure2 from '../assets/cloud-azure-2.svg'
import cloudAzure3 from '../assets/cloud-azure-3.svg'
import cloudAzure4 from '../assets/cloud-azure-4.svg'
import cloudDigitalOcean from '../assets/cloud-digitalocean.svg'
import cloudUpCloud from '../assets/cloud-upcloud.png'

function AwsCloudProviderIcon({ size }: { size: number }) {
  const theme = useResolvedTheme()
  return <Icon icon={getAwsIcon(theme)} style={{ width: size, height: size, display: 'block' }} aria-hidden />
}

AwsCloudProviderIcon.displayName = 'AwsCloudProviderIcon'

export function CloudProviderIcon({ id, size = 20 }: { id: CloudProviderId; size?: number }) {
  switch (id) {
    case 'aws':
      return <AwsCloudProviderIcon size={size} />
    case 'google':
      return <img alt="" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} src={cloudGoogle} />
    case 'azure':
      return (
        <Box aria-hidden="true" style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
          <img alt="" style={{ position: 'absolute', top: 0, left: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure1} />
          <img alt="" style={{ position: 'absolute', top: 0, right: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure2} />
          <img alt="" style={{ position: 'absolute', bottom: 0, left: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure3} />
          <img alt="" style={{ position: 'absolute', bottom: 0, right: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure4} />
        </Box>
      )
    case 'digitalocean':
      return <img alt="" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} src={cloudDigitalOcean} />
    case 'upcloud':
      return <img alt="" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} src={cloudUpCloud} />
    default:
      return null
  }
}

CloudProviderIcon.displayName = 'CloudProviderIcon'
