# ADR 0005: Let the operator verify and correct detections before they count

- **Status:** Accepted (supersedes [ADR 0004](0004-rounded-mean-voting.md) in the app)
- **Date:** 2026-10

## Context

With v1, an inaccurate count was found after it had been recorded, so the operator had to rearrange
the set and retake photos. The aim for v2 was to prevent that regression: show the operator what the
model saw, let them fix it, and only then commit the count.

## Options considered

1. **Keep averaging photos (v1):** cannot fix birds every photo misses; errors still found late.
2. **Tap-to-correct directly on the live video:** birds and the phone are always moving, so a manual marker drifts onto the wrong bird within a second; the model also flickers between frames; and a bird added by hand would be double-counted once the model later detects it.
3. **On-device model with true real-time boxes:** the best experience, but it needs the model's weights (this model is a public hosted one) and a different camera stack and build setup.
4. **Freeze-frame correction:** live view for framing, then *Detect* freezes one frame so boxes stay fixed while the operator corrects them.

## Decision

Option 4, as Phase 1 of a staged plan. Flow: live camera, **Detect**, frozen frame with boxes, tap a box
to remove it, tap empty space to add a bird, **Add to total**. Low-confidence boxes are amber; zoom
helps in dense groups. Options 2 and 3 stay on the [roadmap](../project/roadmap.md) as later phases.

## Consequences

**Good:** errors are fixed before they are recorded; one model call per count instead of three; every
saved count records what was corrected, which is a free quality metric and future training data.
**Costs and risks:** a network connection is needed at detect time; the quality of a count now depends on
the operator's attention in dense flocks (mitigated by amber highlights and zoom); it is not a
continuous live view.

## Related

[Requirements FR-03, FR-04](../overview/requirements.md#functional-requirements) · [Data flow](../architecture/data-flow.md) · [Risks R-01, R-02, R-03](../project/risks-fmea.md)
