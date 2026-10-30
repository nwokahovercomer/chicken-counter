# ADR 0007: Persist counts on the phone, never photos

- **Status:** Accepted
- **Date:** 2026-10

## Context

v1 held everything in memory, so closing the app lost the total. A running total that disappears is a
regression waiting to happen. Photos, on the other hand, are heavy and are a privacy concern.

## Options considered

1. **Keep state in memory:** simple, loses data.
2. **Save photos and results:** enables re-checking and retraining, but costs storage and widens the privacy surface.
3. **Save counts only, on the phone:** small and sufficient for the total and an audit trail.
4. **Server-side database:** enables syncing between phones; far more to build and secure.

## Decision

Save only the list of counts (`count`, `modelCount`, `added`, `removed`, time) in the phone's local
key-value storage. The total is derived from that list.

## Consequences

**Good:** the total survives restarts and crashes; nothing sensitive is stored; no server to run.
**Costs and risks:** data is local to one phone and is lost if the app's data is cleared or the app is uninstalled; the storage is not encrypted (the data is non-sensitive counts); retraining the model from corrections would need an explicit opt-in to save frames ([Roadmap](../project/roadmap.md)).

## Related

[Data flow](../architecture/data-flow.md#data-model) · [Requirements FR-06, NFR-07](../overview/requirements.md) · [Risk R-12](../project/risks-fmea.md)
