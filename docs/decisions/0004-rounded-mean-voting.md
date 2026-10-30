# ADR 0004: Combine three photos per set with a rounded mean

- **Status:** Superseded by [ADR 0005](0005-human-in-the-loop-correction.md) in the Android app. Still used in the archived desktop prototype.
- **Date:** 2026-09

## Context

A single photo gives one noisy count. The requirement was to take **three photos of the same group**
and report one reliable number per set, then sum the sets.

## Options considered

1. **Median of three:** robust to one bad photo.
2. **Majority vote:** only works when two counts match exactly.
3. **Rounded mean:** always produces a value; with three whole numbers the mean can never fall exactly on .5, so rounding is unambiguous.

## Decision

Count each of the three photos and round the mean. The mobile app (v1) also counted each set as soon
as it was approved and capped concurrent requests at three.

## Consequences

**Good:** simple, always defined, reduces random error between photos.
**Costs and risks:** if all three photos miss the same birds, the mean is still wrong; it costs three
model calls per set; and mistakes were discovered only **after** a set was counted, forcing the
operator to retake photos. That last point drove [ADR 0005](0005-human-in-the-loop-correction.md).

## Related

[Project history](../project/history.md) · [Problem and goals](../overview/problem-and-goals.md)
