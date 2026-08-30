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

export { metersToMiles, degreesToCompass };
