import { Box } from '@aivenio/aquarium'
import type { CloudProviderId } from './serviceRegions'
import cloudAwsVector from '../assets/cloud-aws-vector.svg'
import cloudAwsSmile from '../assets/cloud-aws-smile.svg'
import cloudGoogle from '../assets/cloud-google.svg'
import cloudAzure1 from '../assets/cloud-azure-1.svg'
import cloudAzure2 from '../assets/cloud-azure-2.svg'
import cloudAzure3 from '../assets/cloud-azure-3.svg'
import cloudAzure4 from '../assets/cloud-azure-4.svg'
import cloudDigitalOcean from '../assets/cloud-digitalocean.svg'
import cloudUpCloud from '../assets/cloud-upcloud.png'

export function CloudProviderIcon({ id }: { id: CloudProviderId }) {
  switch (id) {
    case 'aws':
      return (
        <Box aria-hidden="true" style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
          <img alt="" style={{ position: 'absolute', top: '18.75%', left: '4.52%', right: '3.87%', bottom: '49.71%', width: '91.61%', height: '31.54%', objectFit: 'contain' }} src={cloudAwsVector} />
          <img alt="" style={{ position: 'absolute', top: '56.35%', left: 0, right: 0, bottom: '21.17%', width: '100%', height: '22.48%', objectFit: 'contain' }} src={cloudAwsSmile} />
        </Box>
      )
    case 'google':
      return <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudGoogle} />
    case 'azure':
      return (
        <Box aria-hidden="true" style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
          <img alt="" style={{ position: 'absolute', top: 0, left: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure1} />
          <img alt="" style={{ position: 'absolute', top: 0, right: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure2} />
          <img alt="" style={{ position: 'absolute', bottom: 0, left: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure3} />
          <img alt="" style={{ position: 'absolute', bottom: 0, right: 0, width: '47.5%', height: '47.5%', objectFit: 'fill' }} src={cloudAzure4} />
        </Box>
      )
    case 'digitalocean':
      return <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudDigitalOcean} />
    case 'upcloud':
      return <img alt="" width={20} height={20} style={{ display: 'block', objectFit: 'contain' }} src={cloudUpCloud} />
    default:
      return null
  }
}

CloudProviderIcon.displayName = 'CloudProviderIcon'
