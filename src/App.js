import React, { useState, useEffect } from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";
import CitySearch, { formatCityLabel } from "./components/CitySearch/component.js";
import getWeatherTheme from "./theme/weatherTheme";
import { groupForecastByDay, getTodayForecastSlots } from "./utils/forecast";
import { getCurrentPosition, describeGeolocationError } from "./utils/geolocation";
import { recordPressureAndGetTrend } from "./utils/pressureHistory";

const DEFAULT_LOCATION = "Austell";

function buildUrl(path, params) {
  const qs = new URLSearchParams({
    ...params,
    units: "imperial",
    APPID: process.env.REACT_APP_OPENWEATHER_API_KEY,
  }).toString();
  return `https://api.openweathermap.org/data/2.5/${path}?${qs}`;
}

async function fetchWeather(params) {
  const apiRes = await fetch(buildUrl("weather", params));
  return apiRes.json();
}

async function fetchForecast(params) {
  const apiRes = await fetch(buildUrl("forecast", params));
  return apiRes.json();
}

async function fetchAirPollution(params) {
  const apiRes = await fetch(buildUrl("air_pollution", params));
  return apiRes.json();
}

async function fetchUVIndex(params) {
  const apiRes = await fetch(buildUrl("uvi", params));
  return apiRes.json();
}

// Fetches current weather, the 5-day/3-hour forecast, air quality, and UV
// index together for one location. Air quality/UV need lat/lon specifically
// (not a city name), so they're always requested using the coordinates the
// *weather* response resolved to — this works whether the original request
// was by name or by coordinates, and means these two "nice to have" fetches
// never block on knowing the location's coordinates up front. Their failure
// is swallowed (mapWeatherResponse treats a null response as "unavailable")
// rather than failing the whole location load over a non-critical extra.
async function loadLocation(params) {
  const [weatherRes, forecastRes] = await Promise.all([fetchWeather(params), fetchForecast(params)]);
  const coordParams = { lat: weatherRes.coord.lat, lon: weatherRes.coord.lon };
  const [airRes, uvRes] = await Promise.all([
    fetchAirPollution(coordParams).catch(() => null),
    fetchUVIndex(coordParams).catch(() => null),
  ]);
  return {
    weather: mapWeatherResponse(weatherRes, airRes, uvRes, Date.now()),
    forecast: groupForecastByDay(forecastRes.list, weatherRes.timezone),
    todaySlots: getTodayForecastSlots(forecastRes.list, weatherRes.timezone, Date.now()),
  };
}

// Pressure trend: OpenWeatherMap has no free historical-pressure endpoint
// (One Call's timemachine needs the same paid subscription its live
// forecast does — 401 on this app's key), so the app tracks its own
// samples per location in localStorage (see utils/pressureHistory.js) and
// compares against whatever's closest to 3 hours old. A location shows no
// trend arrow until it's actually been visited that far back.
function mapWeatherResponse(res, airRes, uvRes, nowMs) {
  const airComponents = airRes?.list?.[0];
  const { trend: pressureTrend } = recordPressureAndGetTrend(
    res.coord.lat,
    res.coord.lon,
    res.main.pressure,
    nowMs
  );
  return {
    temp: Math.round(res.main.temp),
    city: res.name,
    condition: res.weather[0].main,
    country: res.sys.country,
    description: res.weather[0].description,
    feels_like: Math.round(res.main.feels_like),
    icon: res.weather[0].icon,
    timezone: res.timezone,
    windSpeed: res.wind.speed,
    windDeg: res.wind.deg,
    humidity: res.main.humidity,
    pressure: res.main.pressure,
    pressureTrend,
    visibility: res.visibility,
    sunrise: res.sys.sunrise,
    sunset: res.sys.sunset,
    uvIndex: typeof uvRes?.value === "number" ? uvRes.value : null,
    aqi: airComponents?.main?.aqi ?? null,
    pm2_5: airComponents?.components?.pm2_5 ?? null,
    pm10: airComponents?.components?.pm10 ?? null,
    o3: airComponents?.components?.o3 ?? null,
  };
}

const EMPTY_WEATHER = {
  temp: null,
  city: null,
  condition: null,
  country: null,
  description: null,
  feels_like: null,
  icon: null,
  timezone: null,
  windSpeed: null,
  windDeg: null,
  humidity: null,
  pressure: null,
  pressureTrend: null,
  visibility: null,
  sunrise: null,
  sunset: null,
  uvIndex: null,
  aqi: null,
  pm2_5: null,
  pm10: null,
  o3: null,
};

function App() {
  const [query, setQuery] = useState("");
  // Tracks the precise city (with lat/lon) chosen from the autocomplete
  // dropdown, so a subsequent Search click/Enter — without the user having
  // edited the box since — can re-resolve by those exact coordinates
  // instead of re-parsing the displayed label as a name query. Without
  // this, selecting "Shelbyville, Tennessee, US" and then clicking Search
  // re-queries the name-based endpoint with that full label, which isn't
  // the terse "City,ST,US" format it expects — silently landing on a
  // *different* Shelbyville (multiple exist in the US). Any manual edit to
  // the box clears this, falling back to a plain name search as before.
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(EMPTY_WEATHER);
  const [forecast, setForecast] = useState([]);
  const [todaySlots, setTodaySlots] = useState([]);
  const [locating, setLocating] = useState(false);

  const applyLoadResult = ({ weather: w, forecast: f, todaySlots: t }) => {
    setWeather(w);
    setForecast(f);
    setTodaySlots(t);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reuse the exact selection's coordinates if the box still shows it
    // unedited; otherwise fall back to a plain name-based search.
    const params = selectedCity ? { lat: selectedCity.lat, lon: selectedCity.lon } : { q: query };
    loadLocation(params)
      .then(applyLoadResult)
      .catch(() => {
        alert("Check Your Spelling... Enter a valid city!");
        window.location.reload(true);
      });
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setSelectedCity(null);
  };

  // Called when the user picks a suggestion from the autocomplete dropdown.
  // Uses the geocoded lat/lon rather than the typed text, so ambiguous or
  // state-less city names (the exact problem autocomplete exists to solve)
  // always resolve to the exact place the user selected.
  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setQuery(formatCityLabel(city));
    loadLocation({ lat: city.lat, lon: city.lon })
      .then(applyLoadResult)
      .catch((e) => {
        console.error("Failed to load weather for selected city:", e);
      });
  };

  // Resolves the browser's geolocation coordinates into a weather load,
  // then treats the result exactly like an autocomplete selection (tracks
  // it as `selectedCity` with its lat/lon, so a bare Search/Enter afterward
  // re-resolves the same precise spot rather than re-parsing display text).
  const locateAndLoad = () => {
    setLocating(true);
    return getCurrentPosition()
      .then(({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        return loadLocation({ lat, lon }).then(({ weather: w, forecast: f, todaySlots: t }) => {
          setSelectedCity({ name: w.city, country: w.country, lat, lon });
          setQuery(formatCityLabel({ name: w.city, country: w.country }));
          setWeather(w);
          setForecast(f);
          setTodaySlots(t);
        });
      })
      .finally(() => setLocating(false));
  };

  // Triggered by the "Use My Location" button — a direct user action, so an
  // alert on failure (denied permission, unsupported browser, etc.) is
  // appropriate feedback, same as the existing search-error alert.
  const handleUseCurrentLocation = () => {
    locateAndLoad().catch((err) => {
      alert(describeGeolocationError(err));
    });
  };

  // runs once on mount: try the browser's geolocation first so the app
  // opens on the user's actual location; silently fall back to the default
  // city on any failure (permission denied, unsupported, timeout, or even a
  // subsequent fetch failure) — no alert here, since this isn't a user
  // action and a popup on page load would be intrusive.
  useEffect(() => {
    locateAndLoad().catch(() =>
      loadLocation({ q: DEFAULT_LOCATION })
        .then(applyLoadResult)
        .catch((e) => {
          console.error("Failed to load default city weather:", e);
        })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { gradient } = getWeatherTheme(weather.condition, weather.icon);

  return (
    <div className="App" style={{ backgroundImage: gradient }}>
      <div className="AppContent">
        <h1 className="Heading">Search for City</h1>
        <form className="SearchForm" onSubmit={handleSearch}>
          <CitySearch
            query={query}
            onQueryChange={handleQueryChange}
            onSelectCity={handleSelectCity}
            placeholder="Start typing a city…"
          />
          <button className="button" onClick={(e) => handleSearch(e)}>
            Search
          </button>
          <button
            type="button"
            className="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            aria-label="Use my current location"
          >
            <span aria-hidden="true">📍</span> {locating ? "Locating…" : "Use My Location"}
          </button>
        </form>
        <WeatherCard weather={weather} forecast={forecast} todaySlots={todaySlots} />
      </div>
    </div>
  );
}

export default App;
