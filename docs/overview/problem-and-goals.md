# Problem and goals

*Last reviewed: 2026-10-29 · Applies to: app 1.1.0 (v2)*

## Context

Counting birds in a pen is routine, repetitive and error-prone at scale. A person counting hundreds of
moving animals loses track. A model counting from a photo is fast, but it quietly misses birds that
overlap or are partly hidden, and nobody notices until the total is questioned.

The first versions of this project tried to make the model's answer more reliable by
**averaging three photos** ([ADR 0004](../decisions/0004-rounded-mean-voting.md)). That reduced random
error but could not fix systematic misses, and mistakes were only discovered *after* a count was
committed, forcing the operator to retake photos. The current version moves the check to *before*
the commit ([ADR 0005](../decisions/0005-human-in-the-loop-correction.md)). The full story is in the
[project history](../project/history.md).

> This section describes motivation from the project's own experience. It is not a measured
> baseline; see [How success is measured](#how-success-is-measured).

## Users and context of use

| Who | What they need |
|---|---|
| **Field staff** counting a pen with an Android phone (three phones in the current deployment) | A count they can trust, in a few taps, with one hand on the phone, under variable lighting and mobile signal. |
| **Operator/developer** (one person) | To change the model or threshold, rotate credentials and ship updates without rebuilding the app each time. |

## Goals

1. Produce a count the operator has **personally verified** before it enters the total.
2. Make verification **cheap**: boxes on every detection, one tap to add or remove, uncertain boxes highlighted.
3. Keep the **model API key off the phone** and the app **privately distributed**.
4. Let the operator **swap the model or tune the threshold** without touching the phones.
5. Keep a running **total that survives restarts**, with an audit trail of corrections.

## Non-goals (for now)

- Counting without a network connection (inference runs in the cloud; see the [roadmap](../project/roadmap.md) for on-device options).
- iOS, user accounts, or syncing totals between phones.
- Video or continuous live detection (a later phase; see [roadmap](../project/roadmap.md)).
- Identifying individual birds or tracking them between counts.

## Constraints

| Constraint | Consequence |
|---|---|
| Solo developer, short timelines | Prefer managed services and fast tooling ([ADR 0001](../decisions/0001-expo-react-native.md)). |
| Public third-party model (`chicken-counting/5`) | Hosted inference only; model weights are not assumed to be available for on-device use. |
| No public app-store distribution | Private APK installs ([ADR 0006](../decisions/0006-private-apk-distribution.md)). |
| Pay-per-call inference | One API call per count in v2, instead of three per set in v1. |

## How success is measured

The app stores, for every saved count, what the model found and what the operator changed
(`modelCount`, `added`, `removed`, `count`; see [Data flow](../architecture/data-flow.md#data-model)).
That makes quality measurable without extra instrumentation:

| Metric | Definition | Target | Current |
|---|---|---|---|
| **Correction rate** | Share of counts where the operator added or removed at least one box | Set after the first field trial | Not yet measured |
| **Net model error** | `(count − modelCount) / count`, averaged over counts. Negative means the model over-counted. | Set after the first field trial | Not yet measured |
| **Miss rate / false-positive rate** | `added / count` and `removed / modelCount` | Set after the first field trial | Not yet measured |
| **Time per count** | Seconds from camera open to *Add to total* | Not instrumented | Not yet measured |

Targets are deliberately left open: choosing a number before seeing field data would be guesswork.
Collecting the first dataset is on the [roadmap](../project/roadmap.md).

## Related

[Requirements](requirements.md) · [User guide](user-guide.md) · [Risks](../project/risks-fmea.md)
