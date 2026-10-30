# Changelog

*Last reviewed: 2026-10-29 · Applies to: all versions*

All notable changes, newest first. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/). Each released version is also a git tag, which
makes it the **baseline** for that release's documentation. Dates before October 2026 are approximate.

## [Unreleased]

### Added
- Planned work is tracked in the [roadmap](roadmap.md).

## [1.1.0] - Android v2: detect and correct (build and field validation in progress)

### Added
- Live camera with a **Detect** button; the frame freezes with a box on every detection and the count shown.
- Tap a box to remove it, tap empty space to add a missed bird, tap again to undo; low-confidence boxes in amber; 1×/2×/3× zoom ([ADR 0005](../decisions/0005-human-in-the-loop-correction.md)).
- **Add to total**, a running total that is always visible, and a list of saved counts showing what the model found and what was corrected.
- Counts persist across restarts ([ADR 0007](../decisions/0007-persist-counts-only.md)).
- Detection from a gallery photo.
- Proxy returns `boxes`, `imageWidth` and `imageHeight`, still returning `count` for older apps ([API reference](../architecture/api-reference.md)).
- Automated proxy tests (AT-01 to AT-08) and documentation checks in CI.

### Changed
- One model call per count (was three per set).

### Removed
- Sets of three photos, rounded-mean voting, auto-capture and the concurrent counting queue ([ADR 0004](../decisions/0004-rounded-mean-voting.md) superseded).

### Fixed
- Photos are now resized to at most 1600 px wide before upload; in v1 the resize was never triggered.

## [1.0.0] - 2026-10 (approximate) - Android v1: sets of three

### Added
- Manual capture and gallery selection, a review step (approve or replace a set), and edit and delete per set.
- **Auto-capture**: three photos in about 3.5 seconds after a short framing countdown.
- A set is counted as soon as it is approved, with a live cumulative total; at most three requests at a time.
- Cloudflare Worker proxy keeping the API key off the phone ([ADR 0002](../decisions/0002-cloudflare-worker-proxy.md)).
- Confirmed **Clear all**, custom icon (all adaptive layers), splash screen and app name.
- Private APK build and install ([ADR 0006](../decisions/0006-private-apk-distribution.md)).

### Fixed
- Missing `expo-font` peer dependency that failed the cloud build check; EAS preview profile now outputs an APK.

## [0.1.0] - 2026-09 (approximate) - Desktop prototype

### Added
- Windows app (Python, Dear PyGui): folders of three photos, rounded-mean voting, per-set results and CSV export.
- Direct REST calls with header authentication ([ADR 0003](../decisions/0003-direct-rest-header-auth.md)).
