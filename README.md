# oura-cli

Standalone CLI for the Oura Ring API. Query your sleep, readiness, and activity data from the command line.

## Setup

### 1. Create an Oura Application

Go to [https://cloud.ouraring.com/oauth/applications](https://cloud.ouraring.com/oauth/applications) and create a new application:

- **Redirect URI**: `http://localhost:9876/callback`
- Note your Client ID and Client Secret

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in `OURA_CLIENT_ID` and `OURA_CLIENT_SECRET`.

### 3. Install Dependencies

```bash
npm install
```

### 4. Authorize

```bash
source .env
npm run dev -- auth
```

This opens your browser for Oura authorization. After approval, tokens are printed to stdout. Add the `OURA_ACCESS_TOKEN` and `OURA_REFRESH_TOKEN` to your `.env`.

## Usage

Source your env file first:

```bash
source .env
```

### Commands

```bash
# Get sleep data (default: today)
npm run dev -- sleep
npm run dev -- sleep --date 2026-03-05

# Get readiness score
npm run dev -- readiness

# Get activity data
npm run dev -- activity

# Get everything for a day
npm run dev -- summary --date 2026-03-05
```

All commands output JSON to stdout.

### Build and Install

```bash
npm run build
npm link    # makes `oura` available globally
oura summary
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OURA_CLIENT_ID` | Yes | OAuth2 client ID from Oura developer portal |
| `OURA_CLIENT_SECRET` | Yes | OAuth2 client secret |
| `OURA_ACCESS_TOKEN` | Yes (for data commands) | OAuth2 access token (from `oura auth`) |
| `OURA_REFRESH_TOKEN` | Yes (for data commands) | OAuth2 refresh token (auto-refreshed on 401) |

## Future

- MCP server for exposing Oura data as tools to Claude and other AI assistants
