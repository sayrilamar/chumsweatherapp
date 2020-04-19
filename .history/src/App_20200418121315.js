import React from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

function App() {
  const data = async() => {
    const apiRes = await fetch("http://api.openweathermap.org/data/2.5/weather?q=Atlanta&units=imperial&APPID=ab" +
        "0ef440364092f54ff821ca2b803163");
    const resJSON = await data
      .apiRes
      .json();
    return resJSON;
  };

  return (
    <div className="App">
      <WeatherCard temp={-20} condition="Clouds" city="Atlanta" state="Ga"/>
      <WeatherCard temp={-10} condition="Rain" city="Los Angeles" state="Ca"/>
      <WeatherCard temp={40} condition="Clear" city="New York" state="NY"/>
    </div>
  );
}

export default App;
