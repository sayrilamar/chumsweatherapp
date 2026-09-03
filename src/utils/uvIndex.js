// Maps a raw UV index value (from OpenWeatherMap's /data/2.5/uvi, a plain
// number with no categorization of its own) to the standard WHO/EPA risk
// level used by every UV-aware weather app.

function describeUVIndex(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;

  const rounded = Math.round(value);
  let level;
  if (rounded <= 2) level = "Low";
  else if (rounded <= 5) level = "Moderate";
  else if (rounded <= 7) level = "High";
  else if (rounded <= 10) level = "Very High";
  else level = "Extreme";

  return { value: rounded, level };
}

export { describeUVIndex };
