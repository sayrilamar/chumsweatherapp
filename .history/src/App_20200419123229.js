import React, {useState, useEffect} from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";
import {config} from "./config.js";

function App() {
  const [query,
    setQuery] = useState("Austell");
  const [weather,
    setWeather] = useState({
    temp: null,
    city: null,
    condition: null,
    country: null,
    description: null,
    feels_like: null
  });

  const data = async q => {
    console.log(config.API_KEY);
    const apiRes = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${q}&units=imperial&APPID=${config.API_KEY}`);
    const resJSON = await apiRes.json();
    return resJSON;
  };

  const handleSearch = e => {
    data(query).then(res => console.log(res));
    e.preventDefault();
    data(query).then(res => {
      setWeather({
        temp: res.main.temp,
        city: res.name,
        condition: res.weather[0].main,
        country: res.sys.country,
        description: res.weather[0].description,
        feels_like: res.main.feels_like
      });
    });
  };

  // runs once the dom is loaded for the first time only, because there is no
  // variable being watched in the dependency array
  useEffect(() => {
    data(query).then(res => {
      setWeather({
        temp: res.main.temp,
        city: res.name,
        condition: res.weather[0].main,
        country: res.sys.country,
        description: res.weather[0].description,
        feels_like: res.main.feels_like
      });
    });
  }, []);

  return (
    <div className="App">
      <div>
        <WeatherCard
          temp={Math.round(weather.temp)}
          condition={weather.condition}
          city={weather.city}
          state={weather.country}
          description={weather.description}
          feels_like={Math.round(weather.feels_like)}/>
      </div>
      <h1>Search for City</h1>
      <form>
        <div>
          <input
            className="input"
            value={query}
            onChange={e => setQuery(e.target.value)}/>
        </div>
        <div>
          <button className="button" onClick={e => handleSearch(e)}>
            Search
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
