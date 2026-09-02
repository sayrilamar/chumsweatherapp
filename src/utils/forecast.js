// Groups OpenWeatherMap's 5-day/3-hour forecast (`/data/2.5/forecast`, 40
// three-hour entries) into one summary per calendar day at the city's own
// local date — using the same UTC-getter-on-shifted-timestamp technique as
// utils/localTime.js, so this never depends on the browser's timezone.

import { to12Hour } from "./localTime";

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

// The free-tier forecast endpoint only has 3-hour granularity (there's no
// true hourly data without a paid subscription — confirmed directly against
// this app's key: /data/2.5/forecast/hourly returns 401). This surfaces the
// 3-hour slots that fall within the *rest* of today at the city's own local
// date, from the same forecast list already fetched for the 5-day strip —
// no extra API call. `nowMs` is a parameter (not Date.now() internally) so
// this stays pure and testable without faking timers.
function getTodayForecastSlots(list, timezoneOffsetSeconds, nowMs) {
  if (!Array.isArray(list)) {
    throw new Error("getTodayForecastSlots: list must be an array");
  }
  if (typeof timezoneOffsetSeconds !== "number" || typeof nowMs !== "number") {
    return [];
  }

  const shiftedNow = new Date(nowMs + timezoneOffsetSeconds * 1000);
  const todayKey = `${shiftedNow.getUTCFullYear()}-${shiftedNow.getUTCMonth()}-${shiftedNow.getUTCDate()}`;

  return list
    .filter((entry) => entry.dt * 1000 >= nowMs)
    .map((entry) => {
      const shifted = new Date(entry.dt * 1000 + timezoneOffsetSeconds * 1000);
      const dayKey = `${shifted.getUTCFullYear()}-${shifted.getUTCMonth()}-${shifted.getUTCDate()}`;
      return { entry, dayKey, hour: shifted.getUTCHours() };
    })
    .filter((slot) => slot.dayKey === todayKey)
    .map(({ entry, hour }) => ({
      dt: entry.dt,
      hour,
      temp: Math.round(entry.main.temp),
      icon: entry.weather[0].icon,
      condition: entry.weather[0].main,
    }));
}

function formatForecastHourLabel(hour24) {
  const { hours12, period } = to12Hour(hour24);
  return `${hours12} ${period}`;
}

export { groupForecastByDay, formatForecastDayLabel, getTodayForecastSlots, formatForecastHourLabel };
