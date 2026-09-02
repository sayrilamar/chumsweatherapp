// Compares a current pressure reading against the closest historical sample
// from ~3 hours ago to classify the trend. Pure — takes the history array
// and "now" as plain arguments rather than reading a store or the clock
// itself, so it's testable without mocking anything.
//
// There's no free OpenWeatherMap endpoint for historical pressure (One
// Call's timemachine needs a paid "One Call by Call" subscription — 401 on
// this app's key, same as its live forecast). The history array this reads
// is built by the app itself over time (see utils/pressureHistory.js),
// which means a location shows no trend at all until it's been visited
// long enough to have a sample from ~3 hours back.

const TARGET_WINDOW_MS = 3 * 60 * 60 * 1000; // 3 hours
const TOLERANCE_MS = 45 * 60 * 1000; // accept a sample within 45min of exactly 3h ago
const TREND_THRESHOLD_HPA = 1; // meteorological convention: ~1 hPa/3h is a meaningful change

function findReferenceReading(history, nowMs) {
  if (!Array.isArray(history) || history.length === 0) return null;

  const targetMs = nowMs - TARGET_WINDOW_MS;
  let closest = null;
  let closestDiff = Infinity;

  for (const entry of history) {
    const diff = Math.abs(entry.timestamp - targetMs);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = entry;
    }
  }

  return closest && closestDiff <= TOLERANCE_MS ? closest : null;
}

function computePressureTrend(history, currentPressure, nowMs) {
  if (typeof currentPressure !== "number" || Number.isNaN(currentPressure)) {
    return { trend: null, changeHPa: null };
  }

  const reference = findReferenceReading(history, nowMs);
  if (!reference) return { trend: null, changeHPa: null };

  const changeHPa = Math.round((currentPressure - reference.pressure) * 10) / 10;
  let trend;
  if (changeHPa >= TREND_THRESHOLD_HPA) trend = "rising";
  else if (changeHPa <= -TREND_THRESHOLD_HPA) trend = "falling";
  else trend = "steady";

  return { trend, changeHPa };
}

export { computePressureTrend, findReferenceReading, TARGET_WINDOW_MS, TOLERANCE_MS, TREND_THRESHOLD_HPA };
