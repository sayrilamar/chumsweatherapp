import React, {useState} from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

function App() {
  const [city,
    setCity] = useState("Atlanta, us");
  const [temp,
    setTemp] = useState(80);
  const [condition,
    setCondition] = useState("Clouds");
  const [country,
    setCountry] = useState("US");

  const data = async() => {
    const apiRes = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=ab0ef440364092f54ff821ca2b803163`);
    const resJSON = await apiRes.json();
    return resJSON;
  };

  const handleSearch = e => {
    e.preventDefault();
    data().then(res => {
      setTemp(res.main.temp);
      setCity();
    });
  };

  return (
    <div className="App">
      <WeatherCard temp={temp} condition={condition} city={city} state={country}/>
      <WeatherCard temp={-10} condition="Rain" city="Los Angeles" state="Ca"/>
      <WeatherCard temp={40} condition="Clear" city="New York" state="NY"/>
      <form>
        <input value={city} onChange={e => setCity(e.target.value)}/>
        <button onClick={e => handleSearch(e)}>Search</button>
      </form>
    </div>
  );
}

export default App;
