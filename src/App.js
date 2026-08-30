import React, { useState, useEffect } from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";
import CitySearch, { formatCityLabel } from "./components/CitySearch/component.js";
import getWeatherTheme from "./theme/weatherTheme";
import { groupForecastByDay } from "./utils/forecast";

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

// Fetches current weather and the 5-day/3-hour forecast together — they're
// always requested for the same location, so callers get both in one place
// rather than juggling two separate promise chains at each call site.
async function loadLocation(params) {
  const [weatherRes, forecastRes] = await Promise.all([fetchWeather(params), fetchForecast(params)]);
  return {
    weather: mapWeatherResponse(weatherRes),
    forecast: groupForecastByDay(forecastRes.list, weatherRes.timezone),
  };
}

function mapWeatherResponse(res) {
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
    visibility: res.visibility,
    sunrise: res.sys.sunrise,
    sunset: res.sys.sunset,
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
  visibility: null,
  sunrise: null,
  sunset: null,
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

  const handleSearch = (e) => {
    e.preventDefault();
    // Reuse the exact selection's coordinates if the box still shows it
    // unedited; otherwise fall back to a plain name-based search.
    const params = selectedCity ? { lat: selectedCity.lat, lon: selectedCity.lon } : { q: query };
    loadLocation(params)
      .then(({ weather: w, forecast: f }) => {
        setWeather(w);
        setForecast(f);
      })
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
      .then(({ weather: w, forecast: f }) => {
        setWeather(w);
        setForecast(f);
      })
      .catch((e) => {
        console.error("Failed to load weather for selected city:", e);
      });
  };

  // runs once the dom is loaded for the first time only, because there is no
  // variable being watched in the dependency array
  useEffect(() => {
    loadLocation({ q: DEFAULT_LOCATION })
      .then(({ weather: w, forecast: f }) => {
        setWeather(w);
        setForecast(f);
      })
      .catch((e) => {
        console.error("Failed to load default city weather:", e);
      });
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
        </form>
        <WeatherCard weather={weather} forecast={forecast} />
      </div>
    </div>
  );
}

export default App;
