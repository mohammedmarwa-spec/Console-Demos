import type { StaticImageData } from 'next/image'

export type ImageSource = string | StaticImageData

export function imageSrc(source: ImageSource): string {
  return typeof source === 'string' ? source : source.src
}
