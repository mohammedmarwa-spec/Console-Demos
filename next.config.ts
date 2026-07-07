import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: rootDir,
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /raw/,
      type: 'asset/source',
    })
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: { not: [/raw/] },
      type: 'asset/resource',
    })
    return config
  },
}

export default nextConfig
