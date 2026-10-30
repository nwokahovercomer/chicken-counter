# ADR 0003: Call the model's REST API directly with header authentication

- **Status:** Accepted
- **Date:** 2026-09 (desktop prototype; carried into the proxy)

## Context

The vendor's Python SDK would not install on the prototype's Python version (no compatible build
existed yet). It is a thin client over an HTTP endpoint. Separately, the first working calls failed
with HTTP 401 after a key was rotated: the program silently fell back to a hard-coded old key, and
the key was being sent in the URL query string.

## Options considered

1. **Pin an older Python so the SDK installs:** works, but ties the project to an old runtime.
2. **Call the REST endpoint directly:** a few lines of code, no extra dependency.

## Decision

Call the endpoint directly (`requests` in the prototype, `fetch` in the Worker) and send the key only
in an `Authorization: Bearer` header. Read the key from the environment or a secret; **no fallback
value in code**.

## Consequences

**Good:** fewer dependencies; no Python version coupling; keys never appear in URLs or logs.
**Costs and risks:** API changes must be tracked by hand. The 401s stopped after two changes were
applied together (header-only auth and a fresh key), so the exact root cause was not isolated.
The lesson is recorded in [Lessons learned](../project/lessons-learned.md).

## Related

[Setup and build](../engineering/dev-setup-and-build.md#troubleshooting-log) · [Security](../architecture/security-and-privacy.md)
