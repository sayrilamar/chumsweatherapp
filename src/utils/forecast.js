// Groups OpenWeatherMap's 5-day/3-hour forecast (`/data/2.5/forecast`, 40
// three-hour entries) into one summary per calendar day at the city's own
// local date — using the same UTC-getter-on-shifted-timestamp technique as
// utils/localTime.js, so this never depends on the browser's timezone.

function groupForecastByDay(list, timezoneOffsetSeconds) {
  if (!Array.isArray(list)) {
    throw new Error("groupForecastByDay: list must be an array");
  }

  const byDay = new Map();

  list.forEach((entry) => {
    const shiftedMs = entry.dt * 1000 + timezoneOffsetSeconds * 1000;
    const shifted = new Date(shiftedMs);
    const dayKey = `${shifted.getUTCFullYear()}-${shifted.getUTCMonth()}-${shifted.getUTCDate()}`;
    const hour = shifted.getUTCHours();

    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, { minTemp: entry.main.temp_min, maxTemp: entry.main.temp_max, entries: [] });
    }
    const day = byDay.get(dayKey);
    day.minTemp = Math.min(day.minTemp, entry.main.temp_min);
    day.maxTemp = Math.max(day.maxTemp, entry.main.temp_max);
    day.entries.push({
      hour,
      dt: entry.dt,
      icon: entry.weather[0].icon,
      condition: entry.weather[0].main,
    });
  });

  return Array.from(byDay.values()).map((day) => {
    // The slot closest to local noon best represents "the day's weather"
    // for the icon/condition shown (a 3am entry would misrepresent a
    // sunny day, for instance).
    const representative = day.entries.reduce((best, entry) =>
      Math.abs(entry.hour - 12) < Math.abs(best.hour - 12) ? entry : best
    );
    return {
      dateMs: representative.dt * 1000 + timezoneOffsetSeconds * 1000,
      minTemp: Math.round(day.minTemp),
      maxTemp: Math.round(day.maxTemp),
      icon: representative.icon,
      condition: representative.condition,
    };
  });
}

function formatForecastDayLabel(dateMs) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(
    new Date(dateMs)
  );
}

export { groupForecastByDay, formatForecastDayLabel };
