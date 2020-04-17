import React from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

function App() {
  return (
    <div className="App">
      <WeatherCard temp={-20} condition="Clouds" city="Atlanta" state="Ga"/>
      <WeatherCard temp={-10} condition="Rain" city="Los Angeles" state="Ca"/>
      <WeatherCard temp={40} condition="Clear" city="New York" state="NY"/>
    </div>
  );
}

export default App;
