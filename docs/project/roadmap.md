# Roadmap

*Last reviewed: 2026-10-29 · Applies to: after app 1.1.0*

A short, honest list ordered by what unblocks the most. Items move on **evidence from the field**, not
on a calendar. The live backlog is in [GitHub Issues](https://github.com/nwokahovercomer/chicken-counter/issues) (use the *User story* template).

## Now

| ID | Item | Why | Done when |
|---|---|---|---|
| RM-01 | Run the v2 manual cases on real phones and record the results | Requirements are unverified until then | Results log filled in ([Testing](../engineering/testing.md#results-log)) |
| RM-02 | Confirm the proxy with box coordinates is deployed and rotate the app token and model key | Credentials were exposed during development ([Lessons](lessons-learned.md)) | Rotation recorded in the [runbook](../engineering/operations-runbook.md) |
| RM-03 | Register a limited-distribution Android developer account | Policy risk R-08 ([Distribution](../engineering/distribution.md#platform-policy-android-developer-verification)) | Account active |

## Next

| ID | Item | Why | Gate |
|---|---|---|---|
| RM-04 | Collect the first field dataset and set accuracy targets | Targets are open until there is data ([Problem and goals](../overview/problem-and-goals.md#how-success-is-measured)) | RM-01 done |
| RM-05 | Unit tests for the box maths, plus a TypeScript type-check in CI | The app layer has no automated tests yet | None |
| RM-06 | Rate limiting on the proxy | Residual cost-abuse risk R-05 | None |
| RM-07 | A group or pen label on each count, and CSV export | Reduces double-counting (R-03) and makes totals reportable | RM-01 feedback |

## Later (each needs a gate)

| ID | Item | Gate before starting |
|---|---|---|
| RM-08 | **Phase 2: boxes refresh every 1 to 2 seconds** while moving the camera | Field feedback says framing is the main pain, and the per-call cost is acceptable |
| RM-09 | **Phase 3: on-device detection** (true real-time, works without signal) | A model whose weights can be exported (a self-trained one), plus evidence that connectivity is a problem. Needs a development build and a different camera library. |
| RM-10 | Opt-in saving of corrected frames to retrain the model | Privacy decision, plus enough corrections to matter |
| RM-11 | Pinch-to-zoom | Needs a gesture library; only if the 1×/2×/3× buttons prove awkward |

## Out of scope

iOS, user accounts, syncing between phones, and video recording.

## Related

[Risks](risks-fmea.md) · [History](history.md) · [ADR 0005](../decisions/0005-human-in-the-loop-correction.md)
