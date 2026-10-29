# Release Confidence Report — 90-day window (2026-07-29 → 2026-10-27)

**Verdict:** GO-WITH-MITIGATION
**Date:** 2026-10-27
**Scope:** Rolling 90-day lookback, `chumsweatherapp` (solo-maintainer repo, `monorepo` workspace role). Candidate = current `master` HEAD, PR [#5](https://github.com/sayrilamar/chumsweatherapp/pull/5) (`400975f`), encompassing all 5 merged PRs in the window.
**Signals available:** git history/diff, live-executed test + coverage run, GitHub Actions run history, repo config/governance docs.
**Signal gaps:** No production telemetry/error tracking (`release.outcome_sources: ["none"]`); no issue tracker (`tracker.type: "none"`) so no escape/incident data exists to check against; no hotspot-map registry generated yet (`hotspot-map.json` absent) so Change risk has no automated criticality tiering, only manual review; no git tag exists (`release.identifier_source: "tag"` configured but repo has cut none) — release is therefore framed as "current HEAD over the 90-day window," not a tagged artifact.

**Confidence modifier:** Reduced — Outcome layer could not be independently verified (no telemetry, no tracker, no oracle verdicts on file).
**Assumptions:** Outcome scored Medium per partial-signal-mode default; Change risk based on manual review (no service-criticality map or hotspot registry configured, both empty/absent — this is a static, single-service frontend with no auth/payments/PII/migration paths, so criticality is judged low by inspection).

## Layer Scores

| Layer | Score | Key Evidence |
|---|---|---|
| Change risk | **High** | 8 commits / 5 merged PRs over 90 days, single maintainer, all confined to this one React SPA (no backend/DB owned here). No touches to `migrations/schema/proto/openapi` (the configured irreversible-path globs). Firebase static hosting → fully reversible via redeploy. `release.service_criticality` and the hotspot registry are both unset, so this is a qualitative read, not a weighted score. |
| Protection | **High** | Live run just now: `CI=true yarn test --coverage --watchAll=false` → **98.95% stmts / 96.9% branch / 99.1% funcs / 99.31% lines**, 181/181 tests passing across 21 suites. Clears `merge_gate.coverage.line_min` (80%) and `risk_weighted_min` (90%) with margin. Every feature commit in the window added its own test file(s) in the same commit (not retrofitted). Traceability is 0% but that is a deliberate, configured state (`tracker.type: "none"`), not a gap. |
| Signal trust | **High** | GitHub Actions `test.yml`: 8 runs since 2026-08-28, 7/8 green. The 1 failure was the first-ever run of the newly added workflow against the then-still-stale CRA boilerplate test — pre-dates every feature PR in this window and was fixed same day; every run since (including the two most recent feature merges, 2026-08-30 and 2026-09-03) is green. No skip/xfail/quarantine markers found anywhere in `src/`. No overridden checks. |
| Outcome evidence | **Unable to assess (scored Medium)** | `release.outcome_sources: ["none"]` — no APM/error-tracking/incident tooling wired to this static hosting deploy. `tracker.type: "none"` — no escape or defect history exists to check. `.assert-iq/oracles/outcomes/` is empty — oracle grading (enabled in config, weighted 20% at this `mid` tier) has not actually been run against any artifact in this window. |

## Work-Item Evidence Ledger

| Type | In Scope Count | Assessed Count | Unverified Count | Evidence Links |
|---|---:|---:|---:|---|
| Epic | None in scope | — | — | `tracker.type: "none"` — no tracker configured, by design (solo hobby project) |
| Feature | None in scope | — | — | same |
| User Story | None in scope | — | — | same |
| Bug | None in scope | — | — | same |
| Task | None in scope | — | — | same |
| PR | 5 | 5 | 0 | [#1](https://github.com/sayrilamar/chumsweatherapp/pull/1) CI workflow · [#2](https://github.com/sayrilamar/chumsweatherapp/pull/2) real test coverage · [#3](https://github.com/sayrilamar/chumsweatherapp/pull/3) redesign/autocomplete/local time · [#4](https://github.com/sayrilamar/chumsweatherapp/pull/4) 5-day forecast + stale-search fix · [#5](https://github.com/sayrilamar/chumsweatherapp/pull/5) AQI/UV/precip/pressure/ZIP/radar map — all merged, all CI-green |

No Epics/Features/Stories/Bugs/Tasks exist to assess because this repo deliberately runs without a work-item tracker (`qi-traceability.instructions.md` dormancy note). All real delivery units in this window are commits/PRs, and all 5 are accounted for with merge + CI evidence.

## Red Flags

- **Coverage jump 2026-08-28** (0 real tests → 54.95% → 100% same day): a genuine *first-time bootstrap* of real test coverage on a repo that previously had only the unmodified CRA "learn react" boilerplate test (documented in [coverage-report.md](coverage-report.md)), not a pre-release inflation — coverage has stayed consistently 94–100% across every subsequent commit through 2026-09-03, which is the opposite of a gaming pattern (spike then regress). Noted, not treated as disqualifying.
- **New test files concentrated on 2026-09-02/09-03** (AirQuality, TodayForecastStrip, WeatherMap, zipCode, etc.): each new test file lands in the *same commit* as the feature it covers (verified via `git log --stat`), consistent with the pattern across the whole 90-day window — not a last-minute dump before shipping. New suites in that 48h window are ≈4 of 21 total (≈19%), under the 30%-of-suite threshold that would otherwise force a Trust downgrade.
- No overridden/skipped CI checks found.
- No rollback plan is explicitly written down, though Firebase Hosting's native "roll back to previous release" covers this for a static SPA with no DB/migrations involved.

*(No flags reach the "unmitigatable" bar; see Operational Readiness and Mitigations below.)*

## Operational Readiness

- **On-call:** None — solo maintainer (bus factor = 1). Acceptable for a hobby project; worth naming explicitly.
- **Rollback:** Not written down as a runbook, but implicitly available via Firebase Hosting's release history (no DB/schema to roll back).
- **Monitoring:** None — no error tracking (Sentry/Bugsnag/etc.) or uptime monitoring on the deployed app.
- **Deploy window:** Not specified; no evidence of a risky window (Friday evening/holiday) for this assessment.

## Mitigations Required (GO-WITH-MITIGATION)

| # | Mitigation | Owner | By When | Addresses |
|---|---|---|---|---|
| 1 | Do one manual smoke pass on the deployed Firebase URL (search a city, ZIP search, map tile load, AQI/UV/pressure panels) immediately after deploy | Jarius Hayes | At deploy time | Outcome — substitutes for missing telemetry on this release |
| 2 | Add lightweight client-side error visibility (even a free-tier Sentry browser SDK, or at minimum capture `window.onerror` to console/Firebase) | Jarius Hayes | Next iteration, non-blocking for this release | Outcome — closes the "no telemetry" gap for future releases |
| 3 | Write down the Firebase Hosting rollback command/steps (`firebase hosting:rollback` or redeploy prior build) somewhere durable (README or `.assert-iq/governance.md`) | Jarius Hayes | Before next release | Operational readiness — rollback plan currently implicit, not documented |

## Explicit Risk Acceptance

- **No production telemetry on a user-facing release** — accepted by Jarius Hayes (sole maintainer/sponsor) — rationale: hobby project, zero-cost deploy constraints, acceptable given high Protection/Trust scores and the manual-smoke-test mitigation above.
- **No cross-functional review on any of the 5 merged PRs** (self-merged, solo maintainer) — accepted by Jarius Hayes — rationale: documented in `.assert-iq/maturity-profile.md` as a known gap at this tier; no team exists to provide a second reviewer.

## What Would Change the Verdict

- **Upgrades to plain GO:** Wiring any outcome source (even a minimal Sentry/Firebase Crashlytics integration) and confirming zero errors post-deploy would move Outcome to High → all four layers High → GO.
- **Drops to HOLD:** A regression in the live-measured coverage run below 80% on any touched file, a red CI run on the current HEAD, or discovery of an unmitigated irreversible change (none found this window) would flip this to HOLD.

---
**Verdict ID:** `7597687d-5e18-4c62-b1e4-943ff0528138` — recorded to `.assert-iq/verdicts/archive/2026/10/verdicts-27.jsonl`, audit trail in [VERDICTS.md](.assert-iq/verdicts/VERDICTS.md)
**Maturity tier:** mid (per [.assert-iq/maturity-profile.md](.assert-iq/maturity-profile.md))
**Decision policy:** strict (`release.verdict_policy`) — an unverified Outcome layer is not rounded up to a plain GO under strict policy, hence GO-WITH-MITIGATION rather than GO despite 3 High layers.
