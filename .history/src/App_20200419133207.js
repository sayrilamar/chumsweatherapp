import React, {useState, useEffect} from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

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
    feels_like: null,
    icon: null
  });

  const getWeather = async q => {
    const apiRes = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${q}&units=imperial&APPID=ab0ef440364092f54ff821ca2b803163`);
    const resJSON = await apiRes.json();
    return setWeather({
      temp: resJSON.main.temp,
      city: resJSON.name,
      condition: resJSON.weather[0].main,
      country: resJSON.sys.country,
      description: resJSON.weather[0].description,
      feels_like: resJSON.main.feels_like,
      icon: resJSON.weather[0].icon
    });
  };

  const handleSearch = e => {
    getWeather(query).then(res => console.log(res));
    e.preventDefault();
    getWeather(query);
  };

  // runs once the dom is loaded for the first time only, because there is no
  // variable being watched in the dependency array
  useEffect(() => {
    getWeather(query);
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
          icon={weather.icon}
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
