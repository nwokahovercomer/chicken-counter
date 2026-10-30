# Chicken Counter documentation

*Last reviewed: 2026-10-29 · Applies to: app 1.1.0 (v2), proxy with box coordinates*

A phone app that counts chickens with computer vision **and a person in the loop**: the model proposes,
the operator verifies, and only a verified count reaches the total.

## Start here

| If you want to... | Read |
|---|---|
| See what it does and how it is used | [User guide](overview/user-guide.md) |
| Understand the problem and what "good" means | [Problem and goals](overview/problem-and-goals.md) |
| See the requirements and how each is verified | [Requirements and traceability](overview/requirements.md) |
| Understand how it is built | [System overview](architecture/system-overview.md) · [Data flow](architecture/data-flow.md) |
| Check the security posture | [Security and privacy](architecture/security-and-privacy.md) |
| Know why it is built this way | [Decision log](decisions/index.md) |
| Run, test, release or operate it | [Setup and build](engineering/dev-setup-and-build.md) · [Testing](engineering/testing.md) · [Distribution](engineering/distribution.md) · [Runbook](engineering/operations-runbook.md) |
| See what went wrong and what is next | [Risks](project/risks-fmea.md) · [Lessons learned](project/lessons-learned.md) · [Roadmap](project/roadmap.md) |
| Know how these docs stay current | [Waterfall or Agile?](meta/documentation-approach.md) · [Documentation system](meta/documentation-system.md) |

## Current status

| Item | State |
|---|---|
| Android app v2 | Feature complete; APK build and field validation in progress |
| Android app v1 | Built and sideloaded privately; superseded |
| Proxy | Deployed; backward compatible with v1 |
| Open items | See the [Roadmap](project/roadmap.md) and [Risks](project/risks-fmea.md) |

> **Reading guide.** Pages open with a *Last reviewed* date. Architecture decisions are immutable
> records with a status instead; if a decision changes, a new record supersedes the old one.
