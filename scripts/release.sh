#!/usr/bin/env bash
set -euo pipefail

# Release script for @daveremy/oura-mcp
# Usage: ./scripts/release.sh <patch|minor|major>
#
# This script:
# 1. Validates the working tree is clean
# 2. Bumps the version in all 4 locations
# 3. Updates CHANGELOG.md [Unreleased] -> new version
# 4. Builds and verifies with npm pack --dry-run
# 5. Commits, tags, and pushes
# 6. Publishes to npm

BUMP=${1:-}
if [[ -z "$BUMP" || ! "$BUMP" =~ ^(patch|minor|major)$ ]]; then
  echo "Usage: $0 <patch|minor|major>"
  exit 1
fi

# Ensure clean working tree
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree is not clean. Commit or stash changes first."
  exit 1
fi

# Get current and new version
OLD_VERSION=$(node -p "require('./package.json').version")
npm version "$BUMP" --no-git-tag-version > /dev/null
NEW_VERSION=$(node -p "require('./package.json').version")

echo "Bumping $OLD_VERSION -> $NEW_VERSION"

# Update version in all locations
sed -i '' "s/export const VERSION = \"$OLD_VERSION\"/export const VERSION = \"$NEW_VERSION\"/" src/version.ts
sed -i '' "s/\"version\": \"$OLD_VERSION\"/\"version\": \"$NEW_VERSION\"/g" .claude-plugin/plugin.json
sed -i '' "s/\"version\": \"$OLD_VERSION\"/\"version\": \"$NEW_VERSION\"/g" .claude-plugin/marketplace.json

# Update CHANGELOG: rename [Unreleased] to new version with today's date
TODAY=$(date +%Y-%m-%d)
sed -i '' "s/## \[Unreleased\]/## [Unreleased]\n\n## [$NEW_VERSION] - $TODAY/" CHANGELOG.md

# Update CHANGELOG links
sed -i '' "s|\[Unreleased\]: \(.*\)/compare/v.*\.\.\.HEAD|[Unreleased]: \1/compare/v$NEW_VERSION...HEAD|" CHANGELOG.md
OLD_LINK="\[$OLD_VERSION\]:"
NEW_LINK="[$NEW_VERSION]: https://github.com/daveremy/oura-mcp/compare/v$OLD_VERSION...v$NEW_VERSION"
sed -i '' "s|^\\[$OLD_VERSION\\]:.*|$NEW_LINK\n[$OLD_VERSION]: https://github.com/daveremy/oura-mcp/releases/tag/v$OLD_VERSION|" CHANGELOG.md

# Build and verify
echo "Building..."
npm run build

echo "Verifying package contents..."
npm pack --dry-run

echo ""
read -p "Publish @daveremy/oura-mcp@$NEW_VERSION? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted. Changes are staged but not committed."
  exit 1
fi

# Commit, tag, push
git add package.json src/version.ts .claude-plugin/plugin.json .claude-plugin/marketplace.json CHANGELOG.md
git commit -m "Release v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin main --tags

# Publish
npm publish --access public

echo "Published @daveremy/oura-mcp@$NEW_VERSION"
