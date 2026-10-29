# MEMORY.md -- Project Memory Index

_Last consolidated: 2026-10-29_

<!--
Long-term memory INDEX for the Assert.IQ Dreaming feature (loaded at session
start, index only). Maintained by the /dream consolidation pass:
  - Hard cap: 200 lines; one-line pointers into topics/.
  - Absolute dates only. Facts/decisions/preferences, not transcript excerpts.
Hand-edit freely; the instruction files under .github/instructions/ are the
immutable rules tier and are never modified by dreaming.
-->

## Architecture

- [topics/architecture.md](topics/architecture.md) — what chumsweatherapp is (React/CRA
  weather app, solo hobby project, Firebase-hosted) and its feature set as of 2026-10-29
  (forecast, AQI/UV, precipitation, weather map, favorite/saved cities). Assert.IQ pack
  **graduated to committed mode + was reinstalled 2026-10-29** — old tailoring (tracker=none,
  maturity=mid) did NOT survive; check this file before trusting any prior tailoring note.

## OpenWeatherMap API

- [topics/openweathermap-api.md](topics/openweathermap-api.md) — confirmed free-tier vs
  paid-only endpoint catalog, and precipitation field behavior — check here before assuming
  something needs a paid plan.

## Workflow

- [topics/workflow.md](topics/workflow.md) — contributing via fork+PR (origin is read-only
  for this machine's GitHub credentials, always push to `fork`); PRs #1-#5 merged by
  2026-09-03, PR #7 open as of 2026-10-29; the working PATH fix for node/npm/yarn in this
  session's tool shells.

## Active Gotchas

- [topics/gotchas.md](topics/gotchas.md) — stale tool-shell PATH persists across app
  restarts; no top-level `scripts/` dir in this install; a `.vscode/mcp.json` reversion
  incident; CRA/Jest manual mocks for node_modules packages must live under `src/__mocks__/`;
  a long-running dev server can miss brand-new files; OpenWeatherMap silently resolves a
  ZIP-shaped name query to the wrong place; background task notifications for dev servers can
  be stale/wrong; `yarn start` needs `CI=true` + `NODE_OPTIONS=--openssl-legacy-provider` to
  run at all in this env; killing it needs `taskkill //F //PID`, not `pkill`; bare `python`
  works again (was broken); jsdom ignores a direct `localStorage.setItem` override in tests —
  use `jest.spyOn(Storage.prototype, "setItem")`.
