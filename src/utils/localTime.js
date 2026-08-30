// OpenWeatherMap's weather endpoint returns `timezone`: a raw UTC offset in
// seconds for the requested location (not a named zone like
// "America/New_York" — the API doesn't provide one). This computes the
// wall-clock time at that offset from a given "now" instant, and a plain
// "UTC±HH:MM" label — pure, no Date.now()/setInterval here, so it's
// testable without faking timers.

function getLocalTimeInfo(nowMs, timezoneOffsetSeconds) {
  if (typeof timezoneOffsetSeconds !== "number" || Number.isNaN(timezoneOffsetSeconds)) {
    return null;
  }

  // Shift the real UTC instant by the location's offset, then read it back
  // via the UTC getters — this yields that location's wall-clock reading
  // without the browser's own local timezone ever entering the calculation.
  const shifted = new Date(nowMs + timezoneOffsetSeconds * 1000);
  const hours24 = shifted.getUTCHours();
  const minutes = shifted.getUTCMinutes();

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const time = `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;

  const totalOffsetMinutes = Math.round(timezoneOffsetSeconds / 60);
  const sign = totalOffsetMinutes < 0 ? "-" : "+";
  const absMinutes = Math.abs(totalOffsetMinutes);
  const offsetHours = Math.floor(absMinutes / 60);
  const offsetMinutes = absMinutes % 60;
  const utcLabel = `UTC${sign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

  return { time, utcLabel };
}

export default getLocalTimeInfo;
