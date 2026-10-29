# OpenWeatherMap API — free-tier endpoint catalog

Confirmed directly against the live API with this project's real key (curl, not docs) across
several sessions. Use this before assuming an endpoint needs a paid plan.

## Free tier — confirmed working (HTTP 200)

- **Current Weather** (`/data/2.5/weather`) — by name (`q`), lat/lon, or ZIP (`zip`).
- **5-day / 3-hour Forecast** (`/data/2.5/forecast`) — 40 entries, 3-hour granularity only;
  there is no true hourly forecast on the free tier (see Paid-only below).
- **Geocoding** (`/geo/1.0/`) — `direct` (by name, prefix-friendly for autocomplete), `zip`
  (exact match by postal code, optionally `zip,CC`), `reverse` (lat/lon → place name; not
  currently used by name — the weather response's own `name` field already covers this need).
- **Air Pollution** (`/data/2.5/air_pollution`) — `current`, plus `forecast` (hourly, ~4 days,
  96 entries) and `history` (real server-side stored history) are ALSO free — confirmed
  2026-09-03, not yet used by this app.
- **UV Index** (`/data/2.5/uvi`) — current value; `/uvi/forecast` (multi-day) also free,
  confirmed 2026-09-03, not yet used. Note: this standalone endpoint is deprecated in
  OpenWeatherMap's docs in favor of One Call 3.0's `uvi` field, but still works as of
  2026-09-03.
- **Weather Map tiles** (`tile.openweathermap.org/map/<layer>/{z}/{x}/{y}.png`) — real PNG
  tiles, confirmed free. Layers used by this app: `precipitation_new`, `clouds_new`,
  `wind_new`, `temp_new`, `pressure_new`.

## Paid-only (confirmed 401 on this app's key)

- **One Call API 3.0** (includes historical/`timemachine` and government weather alerts).
- **Hourly Forecast** (`/data/2.5/forecast/hourly`).

Because of this, pressure-trend and any other "recent history" feature this app wants has to
track its own samples client-side (see `src/utils/pressureHistory.js`) rather than pulling
real history from the API — except Air Pollution, which genuinely does offer free history
(see above) and hasn't been used for that yet.

## Precipitation field behavior (confirmed 2026-09-03)

- **Current weather**: `rain`/`snow` objects (with a `"1h"` key, mm) appear on the response
  ONLY while it's actively precipitating — there's no explicit "0" case, the field is just
  absent when dry.
- **Forecast**: every 3-hour entry always carries `pop` (probability of precipitation, 0–1,
  even when 0); `rain`/`snow` (with a `"3h"` key) only appear on entries where some is
  forecast.
- **Gotcha**: a bare ZIP-shaped string passed as `q` to the by-name weather endpoint does NOT
  error — see [topics/gotchas.md](gotchas.md) for the confirmed wrong-city example and the fix.
