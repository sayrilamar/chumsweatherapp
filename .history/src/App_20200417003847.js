import React from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

function App() {
  return (
    <div className="App">
      <WeatherCard temp={-20} condition="Clouds"/>
      <WeatherCard temp={-10}/>
      <WeatherCard temp={40}/>
    </div>
  );
}

export default App;
