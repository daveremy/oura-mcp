# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.3] - 2026-03-11

### Added
- Companion `/oura` skill for conversational health data queries

## [0.1.2] - 2026-03-11

### Added
- CHANGELOG.md and release script (`scripts/release.sh`)

### Fixed
- OAuth CSRF protection: added `state` parameter to auth flow
- Auth timeout race: clear timeout immediately on valid callback, use `unref()`
- MCP server uses singleton client to preserve refreshed tokens across tool calls

## [0.1.1] - 2026-03-11

### Added
- Claude Code plugin packaging (`.claude-plugin/plugin.json`, `marketplace.json`)
- `src/version.ts` as single source of truth for version

### Changed
- Scoped npm package name to `@daveremy/oura-mcp`
- Fixed bin paths for npm publish

## [0.1.0] - 2026-03-11

### Added
- 10 MCP tools: daily_summary, sleep, readiness, activity, workouts, heart_rate, stress, spo2, sessions, trends
- CLI commands for all endpoints
- OAuth2 with automatic token refresh and personal access token support
- `oura_trends` uses 2 concurrent range queries instead of N sequential calls
- Local date handling (fixes UTC bug near midnight)
- Serialized token refresh to prevent race conditions with concurrent requests
- Skip useless OAuth refresh when using personal access tokens
- npm publish metadata (`files`, `prepublishOnly`, `keywords`, `repository`)

[Unreleased]: https://github.com/daveremy/oura-mcp/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/daveremy/oura-mcp/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/daveremy/oura-mcp/releases/tag/v0.1.2
[0.1.1]: https://github.com/daveremy/oura-mcp/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/daveremy/oura-mcp/releases/tag/v0.1.0
