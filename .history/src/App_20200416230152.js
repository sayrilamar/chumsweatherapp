import React from "react";
import "./App.css";
import WeatherCard from "./components/WeatherCard/component.js";

function App() {
  return (
    <div className="App">
      <WeatherCard temp="30"/>
      <WeatherCard temp="10"/>
      <WeatherCard temp="-20"/>
    </div>
  );
}

export default App;
