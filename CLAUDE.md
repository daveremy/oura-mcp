# oura-cli

Standalone Oura Ring CLI and (future) MCP server.

## Architecture

- `src/types.ts` — TypeScript types matching Oura API v2 responses
- `src/client.ts` — `OuraClient` class wrapping the Oura REST API with automatic token refresh
- `src/auth.ts` — OAuth2 authorization flow (browser + local callback server on port 9876)
- `src/cli.ts` — CLI entry point using commander

## Auth

OAuth2 authorization code flow:
1. User creates an Oura app at https://cloud.ouraring.com/oauth/applications
2. Set redirect URI to `http://localhost:9876/callback`
3. Set `OURA_CLIENT_ID` and `OURA_CLIENT_SECRET` in `.env`
4. Run `oura auth` to open browser and exchange code for tokens
5. Tokens are printed to stdout as JSON

The client auto-refreshes expired tokens on 401 responses and prints new tokens to stderr.

## CLI Commands

- `oura auth` — run OAuth flow
- `oura sleep [--date YYYY-MM-DD]` — daily sleep score + sleep periods
- `oura readiness [--date YYYY-MM-DD]` — daily readiness score
- `oura activity [--date YYYY-MM-DD]` — daily activity data
- `oura summary [--date YYYY-MM-DD]` — all data for a day

All data commands output JSON to stdout. Default date is today.

## Dev

- `npm run dev -- sleep` — run via tsx (no build needed)
- `npm run build` — compile TypeScript to dist/
- Requires: OURA_CLIENT_ID, OURA_CLIENT_SECRET, OURA_ACCESS_TOKEN, OURA_REFRESH_TOKEN

## Future

- MCP server exposing Oura data as tools for Claude
