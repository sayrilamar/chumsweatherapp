// Small, pure formatting helpers for the "extra" current-condition fields
// (wind, visibility) that OpenWeatherMap's current-weather response already
// includes but the app wasn't displaying yet.

function metersToMiles(meters) {
  if (typeof meters !== "number" || Number.isNaN(meters)) return null;
  return Math.round((meters / 1609.34) * 10) / 10;
}

const COMPASS_POINTS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

function degreesToCompass(deg) {
  if (typeof deg !== "number" || Number.isNaN(deg)) return null;
  const index = Math.round(deg / 22.5) % 16;
  return COMPASS_POINTS[(index + 16) % 16];
}

// OpenWeatherMap's `pressure` field is in hPa, which is numerically
// identical to millibars (1 hPa = 1 mb exactly) — no conversion needed for
// that half; this converts to inches of mercury for the US-customary
// reading shown alongside it.
function hpaToInHg(hpa) {
  if (typeof hpa !== "number" || Number.isNaN(hpa)) return null;
  return Math.round(hpa * 0.0295299830714 * 100) / 100;
}

export { metersToMiles, degreesToCompass, hpaToInHg };
