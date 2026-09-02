// Maps OpenWeatherMap's Air Pollution API (/data/2.5/air_pollution) fields
// to display-ready values. The API's `aqi` is its own 1-5 scale (not the US
// EPA 0-500 AQI) — labels per OpenWeatherMap's documented scale.

const AQI_LABELS = { 1: "Good", 2: "Fair", 3: "Moderate", 4: "Poor", 5: "Very Poor" };

function describeAQI(aqi) {
  if (!AQI_LABELS[aqi]) return null;
  return { aqi, label: AQI_LABELS[aqi] };
}

// Pollutant concentrations arrive in µg/m³ with long float tails — round to
// one decimal place for display.
function formatPollutant(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.round(value * 10) / 10;
}

export { describeAQI, formatPollutant, AQI_LABELS };
