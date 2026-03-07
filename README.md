# oura-mcp

A CLI and MCP server for the [Oura Ring](https://ouraring.com/) API v2. Query sleep, readiness, and activity data from the command line or through Claude Code / any MCP client.

## Features

- **CLI**: Query sleep, readiness, and activity data for any date
- **MCP Server**: 5 tools for integration with Claude Code and other MCP clients
- **Auth**: Supports both personal access tokens and OAuth2 with automatic token refresh

## MCP Tools

| Tool | Description |
|------|-------------|
| `oura_daily_summary` | Sleep score, readiness score, sleep details, and activity for a date |
| `oura_sleep` | Detailed sleep session data (duration, stages, HR, HRV) |
| `oura_readiness` | Readiness score and contributors |
| `oura_activity` | Daily activity data (steps, calories, distance) |
| `oura_trends` | Multi-day sleep and readiness score trends |

## Setup

### 1. Get an Oura API Token

**Personal Access Token (simplest):**
1. Go to the [Oura Developer Portal](https://cloud.ouraring.com/personal-access-tokens)
2. Create a new personal access token
3. Set `OURA_TOKEN` in your environment

**OAuth2 (for automatic token refresh):**
1. Create an app at [Oura OAuth Applications](https://cloud.ouraring.com/oauth/applications)
2. Set redirect URI to `http://localhost:9876/callback`
3. Set `OURA_CLIENT_ID` and `OURA_CLIENT_SECRET` in your environment
4. Run `oura auth` to complete the flow

### 2. Install

```bash
git clone https://github.com/daveremy/oura-mcp.git
cd oura-mcp
npm install
npm run build
```

### 3. Use as CLI

```bash
export OURA_TOKEN=your_token

oura sleep                    # Today's sleep data
oura sleep --date 2026-03-05  # Specific date
oura readiness                # Today's readiness
oura activity                 # Today's activity
oura summary                  # Everything for today
```

All commands output JSON to stdout.

### 4. Use as MCP Server

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "oura": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/oura-mcp/dist/mcp.js"],
      "env": {
        "OURA_TOKEN": "your_token"
      }
    }
  }
}
```

Or register via CLI:

```bash
claude mcp add oura --scope project -- node /path/to/oura-mcp/dist/mcp.js
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OURA_TOKEN` | Option A | Personal access token (simplest) |
| `OURA_ACCESS_TOKEN` | Option B | OAuth2 access token |
| `OURA_REFRESH_TOKEN` | Option B | OAuth2 refresh token |
| `OURA_CLIENT_ID` | Option B | OAuth2 client ID |
| `OURA_CLIENT_SECRET` | Option B | OAuth2 client secret |

## Requirements

- Node.js 18+
- An Oura Ring with API access

## License

MIT
