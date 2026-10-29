// qi-trace: work-item="TODO(qi-trace): unresolved" acceptance-criteria="AC-1,AC-4,AC-6" risk-tier="medium" test-coverage="src/utils/savedCities.test.js"
// No real work-item ID exists for this story (GitHub Issues are disabled on
// the tracker repo) — flagged per qi-traceability.instructions.md rather
// than fabricated.
//
// Persists the user's saved/favorite cities as a single JSON array in
// localStorage, the same pattern as utils/pressureHistory.js. Unlike that
// module, a failed write here is surfaced to the caller (not swallowed)
// so the UI can show a non-blocking error instead of silently pretending a
// save succeeded.

const STORAGE_KEY = "chum-weather:saved-cities";

// Rounded the same way as pressureHistory.js's locationKey, so trivial float
// differences between two requests for "the same city" still match.
function cityKey(lat, lon) {
  return `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;
}

function matchesCoords(city, lat, lon) {
  return cityKey(city.lat, city.lon) === cityKey(lat, lon);
}

function normalizeCity({ name, country, lat, lon }) {
  return { name, country, lat, lon };
}

function getSavedCities() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeCities(cities) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
    return true;
  } catch (e) {
    // Storage unavailable, full, or disabled (private browsing, etc.) —
    // the caller decides how to surface this; it is not swallowed here.
    return false;
  }
}

function isCitySaved(cities, lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") return false;
  return cities.some((c) => matchesCoords(c, lat, lon));
}

// Adds `city` if it isn't already saved. Returns { cities, persisted }:
// `cities` is the list to use next (unchanged from the input list when the
// write failed, never a city the app can't actually find again later), and
// `persisted` is false when the write failed so the caller can show a
// non-blocking error.
function saveCity(city) {
  const current = getSavedCities();
  if (typeof city.lat !== "number" || typeof city.lon !== "number") {
    return { cities: current, persisted: false };
  }
  if (isCitySaved(current, city.lat, city.lon)) {
    return { cities: current, persisted: true };
  }
  const updated = [...current, normalizeCity(city)];
  const persisted = writeCities(updated);
  return { cities: persisted ? updated : current, persisted };
}

// Removes the city at (lat, lon) if present. Same { cities, persisted }
// shape as saveCity.
function removeSavedCity(lat, lon) {
  const current = getSavedCities();
  const updated = current.filter((c) => !matchesCoords(c, lat, lon));
  if (updated.length === current.length) {
    return { cities: current, persisted: true };
  }
  const persisted = writeCities(updated);
  return { cities: persisted ? updated : current, persisted };
}

export { getSavedCities, saveCity, removeSavedCity, isCitySaved, cityKey };
