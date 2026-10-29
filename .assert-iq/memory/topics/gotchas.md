# Active Gotchas

- **Git identity was not configured anywhere on this machine** (neither local nor global
  `user.name`/`user.email`) — the first commit attempt failed with "Author identity unknown".
  Per hard policy, Claude never runs `git config` itself (local or global, regardless of how
  explicitly asked) — the user must run it themselves. User has since set it (`Jarius Hayes`
  / `jarius.hayes@teamsparq.com`), scoped locally to this repo. *(resolved 2026-08-28)*
- **Stale PATH in this session's tool shells** — see `workflow.md` for the full workaround.
  The short version: prepend `export PATH="$HOME/.corepack-shims:/c/Program
  Files/nodejs:$PATH"` before any command needing node/npm/yarn; a Claude Code app
  restart does not fix it.
- **This install has no top-level `scripts/` directory.** `CLAUDE.md` and the
  `assert-iq-tailor` skill both reference `scripts/bootstrap.ps1`, `scripts/
  check-environment.ps1`, and `scripts/sync-agents.ps1`, but none exist in this repo as of
  2026-08-28. Unclear whether this install predates those scripts or they were never copied
  — worth checking before relying on any doctor/sync tooling those docs mention.
- **`.vscode/mcp.json` was found reverted** from its tailored form (just `github` + `git`
  servers) back to the full untailored server list, with `inputs` corrupted from an array of
  27 entries into a single malformed object — happened once on 2026-08-28, suspected cause is
  VS Code's own MCP servers UI re-serializing the file on open. Restored to the tailored
  version; if it recurs, re-check before assuming it's an intentional change.
- **react-scripts' Jest config sets `roots` to `["<rootDir>/src"]`**, so a manual mock for a
  node_modules package (e.g. `leaflet`) must live at `src/__mocks__/<pkg>.js` to be picked up
  automatically for every test — NOT the project-root-adjacent `__mocks__/` Jest normally
  documents for this. Confirmed working this way for `src/__mocks__/leaflet.js`.
  *(confirmed 2026-09-03)*
- **A long-running CRA dev server's webpack module-resolution cache can miss a brand-new
  file** even after it reports "Compiled successfully!" with no errors — confirmed with a
  freshly-created `src/utils/zipCode.js` that a dev server running since much earlier in the
  same session couldn't resolve ("Module not found"), despite a clean recompile. Fix: fully
  kill the process and start a new one — hot-reload alone doesn't recover from this.
  *(confirmed 2026-09-03)*
- **OpenWeatherMap's `/data/2.5/weather?q=<query>` doesn't validate that `q` looks like a
  city name** — a bare ZIP-shaped string (e.g. "30106") returns HTTP 200 with a real but
  unrelated place (confirmed live: resolved to a town in Costa Rica) instead of erroring.
  Any code treating unvalidated user input as a name query should route ZIP-shaped input
  through Geocoding-by-ZIP (`/geo/1.0/zip`) first — see
  [topics/openweathermap-api.md](openweathermap-api.md). *(confirmed 2026-09-03)*
- **Background-task completion notifications for long-running dev servers can be stale or
  simply wrong** — twice now (2026-09-09) a `react-scripts start` background task reported
  "stopped" or "failed with exit code 4" well after the fact, for a server independently
  confirmed healthy via a direct `curl localhost:3000` (HTTP 200). Trust a direct check
  (port listener, curl) over a delayed task-status notification before concluding a server
  actually died.
- **`yarn start` / `react-scripts start` exits immediately (exit 0, no error) in this session's
  shells** unless launched with `CI=true` — without it, `react-scripts/scripts/start.js` wires
  a `process.stdin.on('end', ...) → process.exit()` handler that fires the instant the tool
  shell's stdin hits EOF. Once that's fixed, Node 24's OpenSSL 3 breaks webpack 4's MD4 hash
  (`error:0308010C:digital envelope routines::unsupported`) — add
  `NODE_OPTIONS=--openssl-legacy-provider` too. Working launch:
  `BROWSER=none CI=true NODE_OPTIONS=--openssl-legacy-provider nohup yarn start > /tmp/cra-dev.log 2>&1 < /dev/null &`.
  Both are pre-existing environment quirks (Node 24 vs. a 2020-era CRA toolchain), not app bugs.
  *(confirmed 2026-10-29)*
- **`pkill -f "react-scripts start"` / `pkill -f webpack-dev-server` does not actually kill a
  backgrounded dev server** in this Git-Bash-on-Windows setup — it matches the `pkill`
  invocation itself, not the target node process. Fix: find the real PID via `netstat -ano |
  grep ":3000"`, then `taskkill //F //PID <pid>`. *(confirmed 2026-10-29)*
- **`python` (bare) now resolves correctly** in this session's shells, to the real
  `C:\Users\jarius.hayes\AppData\Local\Programs\Python\Python312\python.exe` (3.12.10) —
  this **contradicts** the earlier 2026-08-28 note that bare `python` hit a non-functional
  Microsoft Store stub. `python3` is still the broken stub; `py -3` still works too. Try bare
  `python` first now; fall back to `py -3` only if it fails. *(reconfirmed 2026-10-29)*
- **jsdom silently ignores a direct `window.localStorage.setItem = () => { throw ... }`
  override** in Jest tests — the mock never actually runs, so a "storage failure" test passes
  for the wrong reason (or doesn't catch the real behavior). Use
  `jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error(...) })`
  instead, and `.mockRestore()` after. Confirmed needed in both `src/utils/savedCities.test.js`
  and `src/App.test.js`. *(confirmed 2026-10-29)*
