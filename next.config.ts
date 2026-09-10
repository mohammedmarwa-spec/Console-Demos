import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** GitHub Pages serves this repo at /Console-Demos — keep local/Vercel on `/`. */
const githubPages = process.env.GITHUB_PAGES === 'true'
const repoBasePath = '/Console-Demos'

const nextConfig: NextConfig = {
  output: 'export',
  outputFileTracingRoot: rootDir,
  ...(githubPages
    ? {
        basePath: repoBasePath,
        assetPrefix: repoBasePath,
        trailingSlash: true,
      }
    : {
        trailingSlash: false,
      }),
  images: {
    unoptimized: true,
  },
  webpack(config, { dev }) {
    if (dev && config.output) {
      config.output.chunkLoadTimeout = 300_000
    }
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
