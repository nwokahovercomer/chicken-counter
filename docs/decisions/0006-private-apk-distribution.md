# ADR 0006: Distribute privately as an APK built with EAS

- **Status:** Accepted
- **Date:** 2026-09

## Context

The app is for a small set of known phones and should not be publicly listed.

## Options considered

1. **Google Play (internal or closed testing):** requires a developer account and identity verification, and is slower to set up than the task warranted.
2. **Firebase App Distribution:** invite-only and tidy for many remote testers, with more setup.
3. **EAS internal distribution:** builds an APK in the cloud and gives an install link; the APK can also be installed over USB with ADB.

## Decision

Build with EAS using an `internal` profile that outputs an APK (the default output is a store bundle that
cannot be installed directly), and install by link or ADB.

## Consequences

**Good:** no store review; fast to ship; updates install in place when the signing key and an increasing version code are kept.
**Costs and risks:** sideloading friction; the install link and the APK must be kept private (the APK holds the app token); platform policy can change ([Distribution](../engineering/distribution.md#platform-policy-android-developer-verification), risk R-08).

## Related

[Distribution](../engineering/distribution.md) · [Requirements NFR-03](../overview/requirements.md#non-functional-requirements)
