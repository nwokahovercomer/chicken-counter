# ADR 0008: Document with Agile, docs-as-code practices

- **Status:** Accepted
- **Date:** 2026-10

## Context

The project needs documentation that recruiters and engineers can trust. Requirements changed with
nearly every iteration, so any document frozen early would be wrong within days.

## Options considered

1. **Waterfall documentation:** complete specifications written and signed off before building.
2. **Agile, docs-as-code:** small documents kept in the repository, changed with the code, reviewed in pull requests and checked by CI.
3. **A single README:** cheap, but cannot carry requirements, decisions and test evidence.

## Decision

Option 2, with a few borrowed engineering controls: stable requirement IDs and a traceability table,
immutable decision records, a risk register, test records, and a changelog as the release baseline.

## Consequences

**Good:** documentation travels with the code and fails CI when it drifts; the project's reasoning is auditable.
**Costs and risks:** it needs the discipline of the Definition of Done. The docs generator (Zensical) is pre-1.0, so the version is pinned and the content stays plain Markdown and Mermaid so the generator can be replaced.

## Related

[Waterfall or Agile?](../meta/documentation-approach.md) · [Documentation system](../meta/documentation-system.md)
