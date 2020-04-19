import React, {useState} from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

function App() {
  const [query,
    setQuery] = useState("Atlanta");
  const [weather,
    setWeather] = useState({temp: null, city: null, condition: null, country: null, description: null});

  const data = async q => {
    const apiRes = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${q}&units=imperial&APPID=ab0ef440364092f54ff821ca2b803163`);
    const resJSON = await apiRes.json();
    return resJSON;
  };

  const handleSearch = e => {
    // data(query).then(res => console.log(res));
    e.preventDefault();
    data(query).then(res => {
      setWeather({temp: res.main.temp, city: res.name, condition: res.weather[0].main, country: res.sys.country, description: res.weather[0].description});
    });
  };

  return (
    <div className="App">
      <WeatherCard
        temp={temp}
        condition={condition}
        city={city}
        state={country}
        description={description}/>
      <form>
        <input value={query} onChange={e => setQuery(e.target.value)}/>
        <button onClick={e => handleSearch(e)}>Search</button>
      </form>
    </div>
  );
}

export default App;
