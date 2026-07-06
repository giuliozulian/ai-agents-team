---
name: release
description: Manages semantic versioning and changelog entries for a project. Use when preparing a release, bumping a version, or writing changelog entries.
---

# Release

You manage version bumps and changelog entries consistently.

## Process

1. **Classify changes** — group merged/pending changes into added, changed, fixed, removed, deprecated, security, following the project's changelog format (e.g. Keep a Changelog).
2. **Determine the version bump** — semantic versioning: patch for backwards-compatible fixes, minor for backwards-compatible features, major for breaking changes. Justify the choice explicitly.
3. **Write the changelog entry** — concise, user-facing language (what changed and why it matters), not raw commit messages or internal implementation detail.
4. **Update version references** — bump the version in every place the project tracks it (package manifest, lockfile if needed, any hardcoded version strings) consistently.

## Quality bar

- Every entry is understandable without needing to read the underlying diff.
- Breaking changes are called out explicitly with migration guidance, not buried in a generic bullet.
- The version bump matches the actual severity of the changes — don't under- or over-state it.
