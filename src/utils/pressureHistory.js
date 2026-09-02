// Persists a small rolling log of {timestamp, pressure} samples per
// location in localStorage, and returns the trend against ~3 hours ago on
// every read. This is the app's own substitute for a historical-pressure
// API (OpenWeatherMap doesn't offer one on the free tier) — it only works
// once a location has actually been visited that far back; there's no
// trend on a location's first-ever load.

import { computePressureTrend } from "./pressureTrend";

const STORAGE_PREFIX = "chum-weather:pressure-history:";
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6h of samples is ample for a 3h lookback

function locationKey(lat, lon) {
  // Rounded so trivial float differences between requests for "the same
  // city" (e.g. slightly different geocoding precision) still hit one log.
  return `${STORAGE_PREFIX}${lat.toFixed(2)},${lon.toFixed(2)}`;
}

function readHistory(key) {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeHistory(key, history) {
  try {
    window.localStorage.setItem(key, JSON.stringify(history));
  } catch (e) {
    // Storage unavailable, full, or disabled (private browsing, etc.) — the
    // trend feature just won't persist. Not fatal to the rest of the app.
  }
}

// Records `pressure` for (lat, lon) at `nowMs`, prunes samples older than
// MAX_AGE_MS, and returns the trend computed against the pre-existing
// history (i.e. not including the sample just recorded).
function recordPressureAndGetTrend(lat, lon, pressure, nowMs) {
  if (typeof lat !== "number" || typeof lon !== "number") {
    return { trend: null, changeHPa: null };
  }

  const key = locationKey(lat, lon);
  const history = readHistory(key).filter((entry) => nowMs - entry.timestamp <= MAX_AGE_MS);

  const result = computePressureTrend(history, pressure, nowMs);

  if (typeof pressure === "number") {
    history.push({ timestamp: nowMs, pressure });
    writeHistory(key, history);
  }

  return result;
}

export { recordPressureAndGetTrend, locationKey };
