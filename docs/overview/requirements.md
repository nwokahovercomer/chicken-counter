# Requirements and traceability

*Last reviewed: 2026-10-29 · Applies to: app 1.1.0 (v2)*

Requirements are written as testable statements with stable IDs. Each one is traced forward to
the design that satisfies it and the test that verifies it, so any change shows what else is
affected. New work enters through a [user story](https://github.com/nwokahovercomer/chicken-counter/issues/new?template=user_story.yml)
and gets an ID here. See [Waterfall or Agile?](../meta/documentation-approach.md) for why requirements are kept lightweight and living.

Priority uses MoSCoW: **M**ust, **S**hould, **C**ould.

## Functional requirements

| ID | Pri | Requirement |
|---|---|---|
| FR-01 | M | The user can capture an image with the phone camera or choose one from the gallery. |
| FR-02 | M | The system detects chickens in the image, draws a box on each one and shows the count. |
| FR-03 | M | The user can add a chicken the model missed (tap empty space), remove a wrong box (tap it), and undo a removal. |
| FR-04 | M | A count enters the total only after an explicit **Add to total**. **Rescan** discards it, with confirmation if the user made edits. |
| FR-05 | M | The running total is always visible. Deleting a saved count subtracts it. |
| FR-06 | S | Saved counts and the total persist across app restarts. |
| FR-07 | S | Detections the model is unsure about are visibly distinguished. |
| FR-08 | S | The user can zoom and pan the frozen image to correct dense groups. |
| FR-09 | C | Each saved count records what the model found and how many boxes were added or removed. |

## Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Security | The model API key is never present in the app binary. |
| NFR-02 | Security | Only requests carrying the app token are served by the proxy. (Limits casual abuse; the token is extractable from an APK. See [Security](../architecture/security-and-privacy.md).) |
| NFR-03 | Distribution | The app installs without a public store and can be updated in place. |
| NFR-04 | Maintainability | The model and confidence threshold can be changed without rebuilding or reinstalling the app. |
| NFR-05 | Resilience | Network failures and server errors time out, retry where safe, and show a clear message. The app never crashes on them. |
| NFR-06 | Efficiency | Images are downscaled to at most 1600 px wide before upload; one API call per count. |
| NFR-07 | Privacy | The app does not save photos in its own storage; only counts are persisted. Photos go only to the proxy and the model. |

**Out of scope:** offline detection, iOS, accounts and sync. See [Problem and goals](problem-and-goals.md#non-goals-for-now).

## Traceability

Test IDs refer to [Testing](../engineering/testing.md): `AT-` are automated, `TC-` are manual cases.

| Requirement | Design (where it is satisfied) | Implementation | Verified by |
|---|---|---|---|
| FR-01 | [Data flow](../architecture/data-flow.md) | `app/App.tsx` (camera and gallery paths) | TC-01, TC-02, TC-03, TC-19 |
| FR-02 | [System overview](../architecture/system-overview.md) | `app/App.tsx`, `app/src/api.ts`, `proxy/src/index.js` | AT-05, TC-02, TC-04 |
| FR-03 | [ADR 0005](../decisions/0005-human-in-the-loop-correction.md) | `app/src/ReviewCanvas.tsx`, `toggleBox` and `addBoxAt` in `app/App.tsx` | TC-06, TC-07, TC-08 |
| FR-04 | [ADR 0005](../decisions/0005-human-in-the-loop-correction.md) | `addToTotal` and `rescan` in `app/App.tsx` | TC-09, TC-10, TC-11 |
| FR-05 | [Data flow](../architecture/data-flow.md#data-model) | Derived total in `app/App.tsx` | TC-09, TC-12 |
| FR-06 | [ADR 0007](../decisions/0007-persist-counts-only.md) | `app/src/storage.ts` | TC-13 |
| FR-07 | [User guide](user-guide.md) | `LOW_CONFIDENCE` in `app/src/ReviewCanvas.tsx` | TC-05 |
| FR-08 | [ADR 0005](../decisions/0005-human-in-the-loop-correction.md) | Zoom in `app/src/ReviewCanvas.tsx` | TC-08 |
| FR-09 | [Problem and goals](problem-and-goals.md#how-success-is-measured) | `Entry` type in `app/src/types.ts` | TC-12 |
| NFR-01 | [ADR 0002](../decisions/0002-cloudflare-worker-proxy.md) | `proxy/src/index.js` (key read from a Cloudflare secret) | AT-06, CI secret scan |
| NFR-02 | [Security](../architecture/security-and-privacy.md) | `X-App-Token` check in `proxy/src/index.js` | AT-02, TC-15 |
| NFR-03 | [ADR 0006](../decisions/0006-private-apk-distribution.md) | `eas.json` (APK, auto-incremented version code) | TC-18 |
| NFR-04 | [Runbook](../engineering/operations-runbook.md) | `MODEL_ID` and `CONFIDENCE` in `proxy/wrangler.toml` | AT-07 |
| NFR-05 | [API reference](../architecture/api-reference.md#errors) | Timeouts and retry in `app/src/api.ts` | AT-08, TC-14, TC-15, TC-16 |
| NFR-06 | [Data flow](../architecture/data-flow.md) | `app/src/imagePrep.ts` | TC-17 |
| NFR-07 | [ADR 0007](../decisions/0007-persist-counts-only.md) | `app/src/storage.ts` (counts only) | Code review; TC-13 |

## Related

[Problem and goals](problem-and-goals.md) · [Risks](../project/risks-fmea.md) · [Changelog](../project/changelog.md)
