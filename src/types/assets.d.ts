declare module '*.svg?raw' {
  const content: string
  export default content
}

declare module '*.png' {
  import type { StaticImageData } from 'next/image'
  const content: StaticImageData
  export default content
}

declare module '*.svg' {
  import type { StaticImageData } from 'next/image'
  const content: StaticImageData
  export default content
}
