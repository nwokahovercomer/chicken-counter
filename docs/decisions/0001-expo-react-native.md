# ADR 0001: Build the Android app with Expo (React Native)

- **Status:** Accepted
- **Date:** 2026-09

## Context

An Android app was needed within days, built by one developer whose strongest language is Python.
It needed camera and gallery access, image resizing, and a way to try changes on a real phone
immediately, without installing and maintaining a local Android toolchain.

## Options considered

1. **Expo (React Native, TypeScript):** live testing on a phone with Expo Go, cloud builds, large library ecosystem.
2. **Flutter:** capable, but needs a local Android SDK setup first.
3. **Native Kotlin:** best long-term fit for Android-only, but the most code and the slowest start.
4. **Python on Android (Flet, Kivy, BeeWare):** familiar language, but camera access and packaging are the fragile parts of those stacks.

## Decision

Use Expo with TypeScript.

## Consequences

**Good:** fast edit-and-see loop on a real phone; builds happen in the cloud; one codebase if iOS is ever needed.
**Costs and risks:** Expo Go must match the project's SDK version, which broke testing once ([Troubleshooting](../engineering/dev-setup-and-build.md#troubleshooting-log)); cloud builds queue; some native libraries need a development build, which matters for on-device inference ([Roadmap](../project/roadmap.md)); a new language to learn.

## Related

[System overview](../architecture/system-overview.md) · [Risks R-09](../project/risks-fmea.md)
