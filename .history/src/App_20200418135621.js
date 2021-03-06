import React, {useState} from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

function App() {
  const {city, setCity} = useState();

  const data = async() => {
    const apiRes = await fetch(`http://api.openweathermap.og/data/2.5/weather?q=atlanta&units=imperial&APPID=ab0ef440364092f54ff821ca2b803163`);
    const resJSON = await apiRes.json();
    return resJSON;
  };
  data().then(res => console.log(res));

  return (
    <div className="App">
      <WeatherCard temp={-20} condition="Clouds" city="Atlanta" state="Ga"/>
      <WeatherCard temp={-10} condition="Rain" city="Los Angeles" state="Ca"/>
      <WeatherCard temp={40} condition="Clear" city="New York" state="NY"/>
    </div>
  );
}

export default App;
