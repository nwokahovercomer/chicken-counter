# Testing

*Last reviewed: 2026-10-29 · Applies to: app 1.1.0 (v2), proxy*

## Strategy

The system is small, so the effort goes where failures are costly or invisible:

| Layer | Approach | Why |
|---|---|---|
| Proxy (security and contract) | **Automated** tests with a fake model, run in CI on every change | A silent regression here could leak a key or break every phone |
| Documentation | **Automated** checks: links, navigation, freshness, diagram syntax | Docs that drift are worse than none |
| Repository | **Automated** secret scan of the full history | Prevents publishing a credential |
| App behaviour | **Manual** test cases on real devices, with a recorded result per build | Camera, touch and layout cannot be trusted from code review alone |

Not yet automated: unit tests for the box maths and a TypeScript type-check in CI. Both are on the [roadmap](../project/roadmap.md).

## Automated tests (proxy)

Run: `node --test proxy/test/worker.test.mjs`. No network, no secrets.

| ID | Verifies | Requirement |
|---|---|---|
| AT-01 | Anything other than POST is rejected (405) | NFR-02 |
| AT-02 | Missing or wrong app token is rejected (401) and the model is never called | NFR-02 |
| AT-03 | Oversized upload is rejected by `Content-Length` (413) | NFR-02, NFR-06 |
| AT-04 | Empty body is rejected (400) | NFR-05 |
| AT-05 | Response has `count`, image size and `boxes`; low-confidence and malformed detections are dropped | FR-02 |
| AT-06 | The API key goes only in the `Authorization` header, never in the URL | NFR-01 |
| AT-07 | The `CONFIDENCE` setting changes the result without code changes | NFR-04 |
| AT-08 | An upstream failure becomes 502 and no upstream detail reaches the phone | NFR-05 |

## Manual test cases (app v2)

Run on a real phone against the real proxy. **Status** is updated per build in the log below.

| ID | Covers | Steps | Expected result | Status |
|---|---|---|---|---|
| TC-01 | FR-01 | First launch: deny, then grant, camera access | Clear prompt; works after granting | Not yet run |
| TC-02 | FR-01, FR-02 | Point at a real group, tap **Detect** | Frame freezes, boxes and count appear | Not yet run |
| TC-03 | FR-01 | **Gallery**, pick a photo | Same result as TC-02 | Not yet run |
| TC-04 | FR-02 | Compare boxes to birds in portrait | No offset or stretching | Not yet run |
| TC-05 | FR-07 | Look for low-confidence detections | Shown amber | Not yet run |
| TC-06 | FR-03 | Tap a box, then tap it again | Red and count −1, then restored and +1 | Not yet run |
| TC-07 | FR-03 | Tap empty space, then tap the new blue box | Count +1, then the box is deleted and −1 | Not yet run |
| TC-08 | FR-08, FR-03 | Zoom 3×, pan, add and remove | Taps land on the intended bird | Not yet run |
| TC-09 | FR-04, FR-05 | **Add to total** | Header total rises by the count; camera returns | Not yet run |
| TC-10 | FR-04 | Edit, then **Rescan** | Asks before discarding | Not yet run |
| TC-11 | FR-04 | Remove every box | **Add to total** is disabled | Not yet run |
| TC-12 | FR-05, FR-09 | Open the list; delete one count | Breakdown shown; total drops by that count | Not yet run |
| TC-13 | FR-06 | Force-close and reopen | Total and list unchanged | Not yet run |
| TC-14 | NFR-05 | Airplane mode, tap **Detect** | Clear network message; app recovers | Not yet run |
| TC-15 | NFR-02, NFR-05 | Build with a wrong token | Clear "Server error 401" message, no crash | Not yet run |
| TC-16 | NFR-05 | Point the app at an older proxy | Message that box positions are missing | Not yet run |
| TC-17 | NFR-06 | Detect from a 12-megapixel photo | Completes within the 30 s timeout on mobile data | Not yet run |
| TC-18 | NFR-03 | Install v2 over v1 | Installs as an update | Not yet run |
| TC-19 | FR-01 | Double-tap **Detect** quickly | One capture and one request | Not yet run |

## Static checks performed on the v2 code

| Check | Result | Date |
|---|---|---|
| TypeScript and JSX parse cleanly (all app files) | Pass | 2026-10 |
| Proxy tests AT-01 to AT-08 | Pass (8 of 8) | 2026-10-29 |
| Documentation checks and diagram validation | See CI | each push |

## Results log

Add one row per build. This is the evidence that the requirements are met.

| Date | Build | Device and Android version | Tester | Cases run | Failures | Notes |
|---|---|---|---|---|---|---|
| | | | | | | |

## Earlier versions

v1 (sets of three photos) had a 30-case manual plan covering permissions, manual capture, auto-capture,
set management, counting and field conditions. It was superseded together with the workflow
([History](../project/history.md)).

## Related

[Requirements and traceability](../overview/requirements.md) · [Risks](../project/risks-fmea.md) · [Documentation system](../meta/documentation-system.md)
