# Waterfall or Agile? The documentation decision

*Last reviewed: 2026-10-29 · Applies to: all versions · Record: [ADR 0008](../decisions/0008-agile-docs-as-code.md)*

## Decision

**Agile documentation, kept as code, with a few controls borrowed from Waterfall.**
Small living pages are changed together with the software and checked automatically; the traceability,
change records, risk register and release baselines that engineering reviewers expect are kept in
lightweight form.

## The two approaches, for documentation

| | Waterfall documentation | Agile documentation |
|---|---|---|
| **When it is written** | Up front, phase by phase, then signed off | Continuously, alongside the work |
| **Shape** | Large specifications: requirements, design, test and acceptance documents | Small living pages and short records |
| **Handling change** | Formal change request and re-approval | Edit in a pull request; history is in version control |
| **Strength** | Clear audit trail and scope; suits fixed requirements and regulated work | Stays accurate; low overhead; fits changing requirements |
| **Weakness** | Costly to change; drifts from reality when requirements move | Can turn thin or inconsistent without discipline |
| **Natural home** | Safety-critical, regulated, fixed-scope delivery | Evolving software products |

## Why Agile fits this project

1. **The requirements really did change.** The core workflow was replaced twice in a month, driven by using the software ([History](../project/history.md)). A specification frozen at the start would have been wrong within days.
2. **One developer, short cycles.** A heavyweight document set would have cost more than it returned.
3. **The ground moved.** Expo Go, the hosting CLI and even the docs generator changed during the project ([Lessons learned](../project/lessons-learned.md)). Documentation had to track that, not fight it.
4. **Working software is the proof.** The docs exist to explain and verify it, so they live beside it and are tested like it.
5. **The audience wants current truth and the path to it.** Reviewers can see today's state and every decision that led there ([Decision log](../decisions/index.md)).

## What was borrowed from Waterfall

Rigor is not lost; it is made lightweight.

| Control | Where it lives |
|---|---|
| Requirement IDs and a traceability matrix | [Requirements](../overview/requirements.md#traceability) |
| Change control with recorded rationale | [Decision records](../decisions/index.md): immutable, superseded rather than edited |
| Risk analysis | [Risk register](../project/risks-fmea.md) (FMEA-style) |
| Verification evidence | [Testing](../engineering/testing.md#results-log) results log |
| Release baselines | [Changelog](../project/changelog.md) plus a git tag per release |
| Interface specification | [API reference](../architecture/api-reference.md) and [`openapi.yaml`](../architecture/openapi.yaml) |
| Operating procedures | [Runbook](../engineering/operations-runbook.md) |

## When Waterfall would be the right call

- **Safety-critical or regulated work**, such as functional safety of safety instrumented systems in process plants, where documents are gated deliverables read by an independent assessor.
- **Fixed-scope contracts** with acceptance criteria agreed before work begins, and long-lead hardware where late changes are expensive.
- **Handover to an operator who needs a complete, signed document set** (for example factory and site acceptance documentation).

Documentation effort should match the consequence of failure. Here, a person verifies every count, so a wrong detection is a quality
problem rather than a safety event, and the lighter approach is proportionate.

## What would trigger a switch

If counts began to drive billing, compliance or other regulated decisions, this project would add a
baselined specification, formal reviews and independent verification. The traceability and record
structure already in place would carry over.

## Related

[Documentation system](documentation-system.md) · [ADR 0008](../decisions/0008-agile-docs-as-code.md) · [Project history](../project/history.md)
