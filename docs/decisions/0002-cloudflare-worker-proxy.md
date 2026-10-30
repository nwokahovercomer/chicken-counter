# ADR 0002: Route model calls through a Cloudflare Worker

- **Status:** Accepted
- **Date:** 2026-09

## Context

The simplest design has the app call the model service directly, which means the app contains the API
key. An APK can be unpacked, so a key inside it is readable by anyone who has the file, and a leaked
key means someone else spends the quota.

## Options considered

1. **Key inside the app:** simplest, and not acceptable.
2. **Ask each user to type the key:** poor usability, and the key still ends up on every phone.
3. **Own proxy that holds the key:** one more component, but the key never reaches a phone.

## Decision

Run a small stateless Cloudflare Worker. The app sends the image and a shared app token; the Worker
checks the token and size, calls the model with the real key, and returns the count and boxes.

## Consequences

**Good:** the key never ships in the app ([NFR-01](../overview/requirements.md#non-functional-requirements)); the model and confidence threshold can change without rebuilding phones ([NFR-04](../overview/requirements.md#non-functional-requirements)); rate limiting and logging can be added in one place.
**Costs and risks:** one more thing to operate and monitor; the app token is itself extractable from the APK, so it only deters casual use ([Security](../architecture/security-and-privacy.md)); extra network hop; depends on a Cloudflare account and its free-tier limits.

## Related

[API reference](../architecture/api-reference.md) · [Runbook](../engineering/operations-runbook.md) · [Risks R-05, R-07](../project/risks-fmea.md)
