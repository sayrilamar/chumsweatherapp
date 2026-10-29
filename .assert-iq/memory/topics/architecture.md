# Architecture

- chumsweatherapp is a small React 16 app (Create React App / `react-scripts` 3.4.1) that
  looks up current weather via the OpenWeatherMap REST API, called directly from the browser
  — no owned backend, no auth, no payment/PII data. Built by Jarius Hayes as a hobby project
  for a family member ("Chum"); solo maintainer, no team. Deployed to Firebase Hosting
  (project `chum-weather`). *(observed 2026-08-28)*
- Test framework is Jest via `react-scripts test` (`yarn test`); tests are colocated with
  source (`src/App.test.js`, `src/components/WeatherCard/*.test.js`), no `tests/` dir.
  *(confirmed 2026-08-28)*
- GitHub repo `sayrilamar/chumsweatherapp`, default branch `master` (not `main`).
  *(confirmed 2026-08-28)*
- The OpenWeatherMap key lives in `.env.local` (gitignored) as
  `REACT_APP_OPENWEATHER_API_KEY`, read via `process.env` in `src/App.js` — the earlier
  hardcoded-key issue is resolved. *(confirmed 2026-09-03)*
- `leaflet` (vanilla, not `react-leaflet`) is a dependency as of 2026-09-03, added for the
  weather-map feature below — chosen specifically because it has no React-version coupling,
  unlike `react-leaflet` which would pin a React major version against this app's React 16.

## Feature set (as of 2026-10-29)

Built out incrementally across several sessions since 2026-08-28, all against OpenWeatherMap's
free tier (see [topics/openweathermap-api.md](openweathermap-api.md) for the endpoint catalog):
weather-reactive gradient theme, city autocomplete + ZIP code search, on-demand geolocation
("Use My Location"), local time/timezone display, 5-day + "later today" forecast strips, a
weather-details panel (wind/humidity/visibility/sunrise/sunset, barometric pressure with a
localStorage-backed 3-hour trend arrow in mb+inHg), air quality index + UV index, full
precipitation exposure (active rain/snow rate in both the hero card and a details tile,
mm+inches; a chance-of-rain badge with daily accumulation on both forecast strips — all hidden
entirely when there's nothing to show), a live "Weather Map" section (Leaflet + OpenStreetMap
base layer, toggling OpenWeatherMap's precipitation/clouds/wind/temp/pressure tile overlays,
centered on the searched city), and favorite/saved cities (star a city, see saved cities with
live at-a-glance weather, click to switch via stored coordinates — never a re-lookup by name —
remove a city, non-blocking error banner if localStorage read/write fails; `src/utils/
savedCities.js`).

## Assert.IQ pack — install state (confirmed 2026-10-29)

**Graduated to committed mode** on 2026-10-29 (`.assert-iq/`, `.github/instructions/`,
`.claude/`, `.kiro/`, etc. are now tracked in git — no longer hidden via `.git/info/exclude`).
`.assert-iq/.install-manifest.json` records pack version `2.1.3`.

The pack was also **reinstalled from scratch at the same timestamp** (`installed_at:
2026-10-29T00:19:37Z`) — the manifest shows `config.yaml`, `governance.md`,
`maturity-profile.md`, `signal-schema.json`, `CLAUDE.md`, `.github/copilot-instructions.md`,
and `AGENTS.md` all as `overwritten`. **This reset every prior `/assert-iq-tailor` choice back
to template defaults** — the earlier recorded decisions (`tracker.type: "none"`,
`maturity.tier: "mid"`, the trimmed `.vscode/mcp.json`) did **not** survive and must not be
assumed current. Confirmed current values instead of trusting old notes:

- `maturity.tier` is `"early"` (template default, `rationale` still the unfilled placeholder —
  nobody has deliberately chosen a tier since the reinstall).
- `tracker.type` is `"github"`, `tracker.github.repo: "fromjariuswithsparq/chumsweatherapp"`
  (the user's own fork, filled in manually during the 2026-10-29 session that set up
  `/estimate-story` — GitHub Issues are disabled on both the fork and upstream, so generated
  traceability markers still use `work-item="TODO(qi-trace): unresolved"` per
  `qi-traceability.instructions.md` rather than a fabricated ID).
- `client.name`, `client.account_id`, `client.embedded_team`, `test_framework.primary`,
  `test_framework.language`, `test_framework.test_command`, `tracker.regression_area_path`,
  `merge_gate.ci_provider`, and several other fields are **still the literal `<PLACEHOLDER>`
  template text** — the pack has not been re-tailored since the reinstall. A fresh
  `/assert-iq-tailor` pass is needed before skills that read those fields (test generation,
  merge-gate CI checks, etc.) can behave correctly for this repo.
- `business_metrics` figures also reset on reinstall: now `escape_incident_cost: 50000`,
  `engineer_burden_rate: 85` (template defaults) — these are **not** this solo project's real
  costs (the earlier $25/$25 nominal placeholders from 2026-08-28 are gone); treat
  `/measure-qi-impact` output as illustrative only until the user sets real figures.
