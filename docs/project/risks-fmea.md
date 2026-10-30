# Risks and failure modes

*Last reviewed: 2026-10-29 · Applies to: app 1.1.0 (v2), proxy*

A lightweight FMEA-style register. Each row names a failure mode, its effect, and what is done about it.
**Severity (S)** and **Likelihood (L)** are scored 1 to 5 by judgement, **not from measurements**, and the
**score is S × L**. They will be revised once [field data](../overview/problem-and-goals.md#how-success-is-measured) exists.

| ID | Failure mode | Effect | S | L | Score | Mitigation | Status |
|---|---|---|---|---|---|---|---|
| R-01 | Model misses birds (overlap, occlusion, dense flock) | Undercount | 4 | 4 | **16** | Operator adds missed birds; amber highlights; zoom; correction data tracked ([ADR 0005](../decisions/0005-human-in-the-loop-correction.md)) | Partly mitigated |
| R-03 | Same birds counted twice across counts (operator error) | Overcount | 4 | 3 | **12** | Procedure in the [user guide](../overview/user-guide.md); group label planned (RM-07) | Open |
| R-04 | No signal or slow network at detect time | Cannot count | 3 | 4 | **12** | Timeout and one retry, clear message, nothing lost; on-device inference is a possible later phase (RM-09) | Partly mitigated |
| R-02 | False positives (feeders, shadows) | Overcount | 3 | 3 | 9 | Tap a box to remove it; restorable | Mitigated |
| R-08 | Android policy changes make sideloading harder | Install friction or blocked updates | 3 | 3 | 9 | Register a limited-distribution account (RM-03); ADB path ([Distribution](../engineering/distribution.md#platform-policy-android-developer-verification)) | Open |
| R-10 | Accuracy degrades with lighting, angle or breed | More corrections needed | 3 | 3 | 9 | Field validation; correction-rate metric; threshold tuning; own-model option (RM-09, RM-10) | Open |
| R-09 | Tooling drift (SDK mismatch, CLI bugs, docs generator end-of-life) | Blocked builds or docs | 2 | 4 | 8 | Pinned versions, `expo-doctor` before builds, [troubleshooting log](../engineering/dev-setup-and-build.md#troubleshooting-log), portable Markdown content | Partly mitigated |
| R-05 | App token extracted from the APK | Others spend model quota | 3 | 2 | 6 | Size cap; token rotation; rate limiting planned (RM-06); APK never published | Partly mitigated |
| R-07 | Model or hosting provider outage, pricing or quota change | Counting stops | 3 | 2 | 6 | Proxy isolates the app from the provider; model swap needs no rebuild; a provider swap needs proxy changes only | Partly mitigated |
| R-11 | Photos reach a third party (privacy) | Exposure of what is in frame | 3 | 2 | 6 | HTTPS; nothing stored by the app or proxy; keep people out of frame; review the vendor's terms | Partly mitigated |
| R-06 | Phone lost or stolen | Token exposed | 2 | 2 | 4 | [Rotate the token](../engineering/operations-runbook.md#lost-or-stolen-phone) | Mitigated by procedure |
| R-12 | App data cleared or app uninstalled | Local total lost | 2 | 2 | 4 | Accepted for now; CSV export planned (RM-07) | Accepted |

## Reading the register

- The top three are all about **counting accuracy and connectivity**, which is why the design puts the human check *before* the commit.
- A security failure (R-05, R-06) is cheaper than a wrong count here, which shaped where effort went: the key is protected firmly, and the token is deliberately treated as low value.

## Related

[Security](../architecture/security-and-privacy.md) · [Roadmap](roadmap.md) · [Testing](../engineering/testing.md)
