export const DEV_TOOLS_DOCS = {
  mcp: 'https://aiven.io/docs/tools/mcp-server',
  cli: 'https://aiven.io/docs/tools/cli',
  terraform: 'https://aiven.io/docs/tools/terraform',
  api: 'https://aiven.io/docs/tools/api',
  mcpSecurity: 'https://aiven.io/docs/tools/mcp-server#security-and-responsibility',
} as const

export const MCP_SERVER_BASE = 'https://mcp.aiven.live/mcp'

export type DevToolId = 'mcp' | 'cli' | 'terraform' | 'api'

export const DEV_TOOL_CHIPS: { id: DevToolId; label: string }[] = [
  { id: 'mcp', label: 'MCP' },
  { id: 'cli', label: 'CLI' },
  { id: 'terraform', label: 'Terraform' },
  { id: 'api', label: 'API' },
]

export type McpClientId = 'cursor' | 'claude-code' | 'claude-desktop' | 'vscode' | 'gemini-cli'

export const MCP_CLIENT_OPTIONS: { label: string; value: McpClientId }[] = [
  { label: 'Cursor', value: 'cursor' },
  { label: 'Claude Code', value: 'claude-code' },
  { label: 'Claude Desktop', value: 'claude-desktop' },
  { label: 'VS Code', value: 'vscode' },
  { label: 'Gemini CLI', value: 'gemini-cli' },
]

export const DEV_TOOLS_PROMO = {
  title: 'Work with Aiven your way',
  description: 'MCP, CLI, Terraform, and API',
  actionLabel: 'Get started',
} as const

export const CLI_QUICK_START = {
  title: 'CLI quick start',
  command: 'pip install aiven-client\navn user login',
  docsHref: DEV_TOOLS_DOCS.cli,
} as const

export const TERRAFORM_SNIPPET = `terraform {
  required_providers {
    aiven = {
      source  = "aiven/aiven"
      version = ">= 4.0.0"
    }
  }
}`

export const API_SNIPPET = `curl https://api.aiven.io/v1/project \\
  -H "Authorization: Bearer $AIVEN_TOKEN"`

export function getMcpServerUrl(readOnly: boolean): string {
  if (!readOnly) return MCP_SERVER_BASE
  return `${MCP_SERVER_BASE}?read_only=true`
}

export function getMcpSnippet(client: McpClientId, url: string): { filename: string; code: string } {
  if (client === 'claude-code') {
    return {
      filename: 'Terminal',
      code: `claude mcp add --transport http aiven "${url}"`,
    }
  }
  if (client === 'claude-desktop') {
    return {
      filename: 'claude_desktop_config.json',
      code: JSON.stringify(
        { mcpServers: { aiven: { command: 'npx', args: ['-y', 'mcp-remote', url] } } },
        null,
        2,
      ),
    }
  }
  if (client === 'vscode') {
    return {
      filename: '.vscode/mcp.json',
      code: JSON.stringify({ servers: { aiven: { type: 'http', url } } }, null, 2),
    }
  }
  if (client === 'gemini-cli') {
    return {
      filename: '~/.gemini/settings.json',
      code: JSON.stringify({ mcpServers: { aiven: { httpUrl: url } } }, null, 2),
    }
  }
  return {
    filename: '.cursor/mcp.json',
    code: JSON.stringify({ mcpServers: { aiven: { type: 'http', url } } }, null, 2),
  }
}

export function getCursorMcpInstallDeeplink(mcpServerUrl: string): string {
  const config = btoa(JSON.stringify({ url: mcpServerUrl }))
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=aiven&config=${encodeURIComponent(config)}`
}
