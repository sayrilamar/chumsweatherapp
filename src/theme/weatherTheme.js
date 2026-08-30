// Maps a weather condition (OpenWeatherMap's `weather[0].main`) and
// day/night (derived from the icon code's trailing "d"/"n") to a
// full-page background gradient. Pure function — no rendering, no fetch —
// so the mapping itself is unit-testable independent of the UI.

const GRADIENTS = {
  Clear: { day: ["#4facfe", "#00c6ff"], night: ["#0f2027", "#2c5364"] },
  Clouds: { day: ["#a8c0d6", "#5d7291"], night: ["#232526", "#414345"] },
  Rain: { day: ["#647dee", "#7f53ac"], night: ["#0f2027", "#243b55"] },
  Drizzle: { day: ["#89f7fe", "#66a6ff"], night: ["#232526", "#3a5169"] },
  Thunderstorm: { day: ["#373b44", "#4286f4"], night: ["#0f0c29", "#302b63"] },
  Snow: { day: ["#e0eafc", "#7f9cbf"], night: ["#3a4a5c", "#83a4d4"] },
  Mist: { day: ["#606c88", "#3f4c6b"], night: ["#232526", "#414345"] },
  Smoke: { day: ["#606c88", "#3f4c6b"], night: ["#232526", "#414345"] },
  Haze: { day: ["#606c88", "#3f4c6b"], night: ["#232526", "#414345"] },
  Fog: { day: ["#606c88", "#3f4c6b"], night: ["#232526", "#414345"] },
  Dust: { day: ["#c79081", "#dfa579"], night: ["#3a2c26", "#5c4033"] },
  Tornado: { day: ["#414345", "#232526"], night: ["#0f0c29", "#302b63"] },
  default: { day: ["#2980b9", "#6dd5fa"], night: ["#0f2027", "#203a43"] },
};

function isNightIcon(icon) {
  return typeof icon === "string" && icon.endsWith("n");
}

function getWeatherTheme(condition, icon) {
  const palette = GRADIENTS[condition] || GRADIENTS.default;
  const isNight = isNightIcon(icon);
  const [from, to] = isNight ? palette.night : palette.day;

  return {
    isNight,
    gradient: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
  };
}

export default getWeatherTheme;
export { GRADIENTS };
