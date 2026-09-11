import type { Metadata } from 'next'
import '@aivenio/aquarium/dist/styles.css'
import '../index.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Console Prototype Lab',
  description: 'Shared design playground for Aiven product designers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
