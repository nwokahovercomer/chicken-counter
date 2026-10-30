# Lessons learned

*Last reviewed: 2026-10-29 · Applies to: all versions*

1. **Requirements move with every demo, so documentation has to move too.** The core workflow changed twice in a month. Frozen specifications would have been wrong early. See [Waterfall or Agile?](../meta/documentation-approach.md).

2. **Check before you commit, not after.** v1 found wrong counts after they were recorded. Making verification a cheap step *before* the commit removed a whole class of rework ([ADR 0005](../decisions/0005-human-in-the-loop-correction.md)).

3. **Put secrets behind a server boundary from day one.** An APK can be unpacked, so the key lives in a proxy ([ADR 0002](../decisions/0002-cloudflare-worker-proxy.md)). Anything shipped to a client is public.

4. **Treat any credential that appeared in a log, chat, or screenshot as compromised, and rotate it.** Credentials leaked into working notes during development; the rule now is rotate first, investigate second ([Security](../architecture/security-and-privacy.md)).

5. **Isolate one variable at a time.** The 401 errors were solved by hard-coding a fresh key temporarily to separate "is the key valid?" from "is my environment variable being read?". The cost of two changes at once was not knowing which one fixed it ([ADR 0003](../decisions/0003-direct-rest-header-auth.md)).

6. **Do not trust defaults; read the generated config.** EAS built a store bundle instead of an installable APK, a newer template needed three icon layers, and the splash screen needed an explicit plugin entry. Each looked like a bug and was a default ([troubleshooting log](../engineering/dev-setup-and-build.md#troubleshooting-log)).

7. **Tooling versions are a project risk, not a detail.** Expo Go moved to a newer SDK than the project; a docs generator reached end of life weeks before this site was built. Pin versions, keep content portable, and write the fix down ([risk R-09](risks-fmea.md)).

8. **Review your own code against the requirements.** Re-reading v1 for v2 showed photos were never resized because one argument was never passed. A traceability table ([requirements](../overview/requirements.md#traceability)) and a test per requirement are how this gets caught on purpose rather than by luck.

## Related

[History](history.md) · [Risks](risks-fmea.md) · [Roadmap](roadmap.md)
