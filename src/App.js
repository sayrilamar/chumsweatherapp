import React, { useState, useEffect } from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";
import CitySearch, { formatCityLabel } from "./components/CitySearch/component.js";
import getWeatherTheme from "./theme/weatherTheme";

const DEFAULT_LOCATION = "Austell";

function buildWeatherUrl(params) {
  const qs = new URLSearchParams({
    ...params,
    units: "imperial",
    APPID: process.env.REACT_APP_OPENWEATHER_API_KEY,
  }).toString();
  return `https://api.openweathermap.org/data/2.5/weather?${qs}`;
}

async function fetchWeather(params) {
  const apiRes = await fetch(buildWeatherUrl(params));
  return apiRes.json();
}

function mapWeatherResponse(res) {
  return {
    temp: res.main.temp,
    city: res.name,
    condition: res.weather[0].main,
    country: res.sys.country,
    description: res.weather[0].description,
    feels_like: res.main.feels_like,
    icon: res.weather[0].icon,
    timezone: res.timezone,
  };
}

function App() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState({
    temp: null,
    city: null,
    condition: null,
    country: null,
    description: null,
    feels_like: null,
    icon: null,
    timezone: null,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeather({ q: query })
      .then((res) => setWeather(mapWeatherResponse(res)))
      .catch(() => {
        alert("Check Your Spelling... Enter a valid city!");
        window.location.reload(true);
      });
  };

  // Called when the user picks a suggestion from the autocomplete dropdown.
  // Uses the geocoded lat/lon rather than the typed text, so ambiguous or
  // state-less city names (the exact problem autocomplete exists to solve)
  // always resolve to the exact place the user selected.
  const handleSelectCity = (city) => {
    setQuery(formatCityLabel(city));
    fetchWeather({ lat: city.lat, lon: city.lon })
      .then((res) => setWeather(mapWeatherResponse(res)))
      .catch((e) => {
        console.error("Failed to load weather for selected city:", e);
      });
  };

  // runs once the dom is loaded for the first time only, because there is no
  // variable being watched in the dependency array
  useEffect(() => {
    fetchWeather({ q: DEFAULT_LOCATION })
      .then((res) => setWeather(mapWeatherResponse(res)))
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
            onQueryChange={setQuery}
            onSelectCity={handleSelectCity}
            placeholder="Start typing a city…"
          />
          <button className="button" onClick={(e) => handleSearch(e)}>
            Search
          </button>
        </form>
        <WeatherCard
          temp={Math.round(weather.temp)}
          condition={weather.condition}
          city={weather.city}
          state={weather.country}
          description={weather.description}
          icon={weather.icon}
          feels_like={Math.round(weather.feels_like)}
          timezone={weather.timezone}
        />
      </div>
    </div>
  );
}

export default App;
