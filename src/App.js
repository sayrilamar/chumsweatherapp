import React, {useState, useEffect} from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

function App() {
  const location = "Austell";
  const [query,
    setQuery] = useState("");
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

  const data = async q => {
    const apiRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${q}&units=imperial&APPID=ab0ef440364092f54ff821ca2b803163`);
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
        feels_like: res.main.feels_like,
        icon: res.weather[0].icon
      });
    }).catch(e => {
      alert("Check Your Spelling... Enter a valid city!");
      window
        .location
        .reload(true);
    });
  };

  // runs once the dom is loaded for the first time only, because there is no
  // variable being watched in the dependency array
  useEffect(() => {
    data(location).then(res => {
      setWeather({
        temp: res.main.temp,
        city: res.name,
        condition: res.weather[0].main,
        country: res.sys.country,
        description: res.weather[0].description,
        feels_like: res.main.feels_like,
        icon: res.weather[0].icon
      });
    });
  }, [location]);

  return (
    <div className="App">
      <div>
        <h1>Search for City</h1>
        <form>
          <input
            className="input"
            value={query}
            onChange={e => setQuery(e.target.value)}/>
          <div></div>
          <button className="button" onClick={e => handleSearch(e)}>
            Search
          </button>
        </form>{" "}
        <hr></hr>
        <hr></hr>
        <WeatherCard
          temp={Math.round(weather.temp)}
          condition={weather.condition}
          city={weather.city}
          state={weather.country}
          description={weather.description}
          icon={weather.icon}
          feels_like={Math.round(weather.feels_like)}/>
      </div>
    </div>
  );
}

export default App;
