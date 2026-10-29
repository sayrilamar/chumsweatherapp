# Workflow

## Contributing to this repo: fork + PR, not direct push

- The git/GitHub credentials configured on this machine (`gh` account
  `fromjariuswithsparq`) have **read-only** access to `origin`
  (`sayrilamar/chumsweatherapp`) — `push` is denied with a 403. Confirmed via
  `gh api repos/sayrilamar/chumsweatherapp --jq .permissions` → `{"pull": true, "push": false}`.
  *(confirmed 2026-08-28)*
- Established, working flow: `gh repo fork --remote --remote-name=fork` (adds a `fork` remote
  pointing at `fromjariuswithsparq/chumsweatherapp`), commit on a feature branch, `git push
  fork <branch>:<branch>`, then `gh pr create --repo sayrilamar/chumsweatherapp --base master
  --head fromjariuswithsparq:<branch>`. Confirmed across PR #1 (CI workflow) through #4
  (forecast/details/stale-search fix), all merged. The branch
  `add-forecast-details-and-stale-search-fix` was reused for further work after its PR #4
  merged — 3 more commits (layout redesign + AQI/UV/pressure trend; full precipitation
  exposure; ZIP search + weather map) went into **PR #5**, opened and merged 2026-09-03.
  PRs #1-#5 have all merged cleanly with this flow. Pushing straight to `origin`
  (`sayrilamar/chumsweatherapp`) still 403s — this is a durable property of the fork workflow,
  always push to `fork` and open cross-fork with `--head <fork-owner>:<branch>`.
- The same branch name was reused a **third** time: after PR #5 merged, more commits landed on
  a local `add-forecast-details-and-stale-search-fix` (90-day release confidence report, the
  `/estimate-story` setup + favorite-cities story estimate, and the favorite-cities feature
  itself) and went into **PR #7** (https://github.com/sayrilamar/chumsweatherapp/pull/7),
  opened 2026-10-29, non-draft, `mergeable: MERGEABLE` / `mergeStateStatus: CLEAN`, Auto-fix
  monitoring enabled. (No record here of what PR #6 was — it isn't a PR against this repo's
  tracked work; don't assume it's missing/broken.)
- After a PR merges on GitHub, local `master` needs `git pull origin master` to fast-forward
  past GitHub's merge commit — local already has the feature commit directly, so `git status`
  shows "behind by 1" (just the merge commit) until pulled.

## Getting Node/Yarn working in this Claude Code session's tool shells

- Node.js (`C:\Program Files\nodejs\`, v24.20.0) and GitHub CLI are correctly present in the
  real Windows Machine `PATH`, but the Bash/PowerShell tool-invocation shells in this session
  inherited an environment snapshot that predates those installs. **Reopening/restarting the
  Claude Code app did NOT refresh it** — confirmed same result before and after a close/reopen
  on 2026-08-28, so it's tied to the underlying session/process, not the app window.
- `~/.bashrc`, `~/.bash_profile`, and a PowerShell `$PROFILE` do **not** get sourced by this
  tool's shell invocations (confirmed: they run non-interactive, non-login — `$-` showed
  `hBc`, no `i`). Editing those profile files does NOT fix the tool's own calls, though they
  remain useful for a real interactive terminal the user opens manually.
- **Working workaround**: prepend the path inline on every command that needs node/npm/yarn:
  `export PATH="$HOME/.corepack-shims:/c/Program Files/nodejs:$PATH"` (Bash), or the PowerShell
  equivalent. Verified working repeatedly on 2026-08-28.
- `yarn` isn't bundled with this Node install. `corepack enable` fails with `EPERM` writing
  into `C:\Program Files\nodejs` (no admin rights). Fix: `corepack enable --install-directory
  ~/.corepack-shims` (a user-writable dir), then include that dir in the PATH prepend above.
  Yields yarn 1.22.22.
- `python` (bare) in Git Bash resolves to a non-functional Microsoft Store stub on this
  machine — use `py -3` instead, which correctly finds the real install at
  `C:\Users\jarius.hayes\AppData\Local\Programs\Python\Python312\python.exe` (3.12.10).
