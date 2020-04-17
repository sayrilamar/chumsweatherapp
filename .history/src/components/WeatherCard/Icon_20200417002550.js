import React from "react";
import styled from "@emotion/styled";

// https://openweathermap.org/weather-conditions
const Icon = props => {
  var icon;
  switch (props.condition) {
    case "Clouds":
      icon = `02d@2x`;
      break;
    case "Clear":
      icon = `01d@2x`;
      break;
    case "Haze":
      icon = `Haze-2x.png`;
      break;
    case "Hail":
      icon = `Hail-2x.png`;
      break;
    case "Fog":
      icon = `Fog-2x.png`;
      break;
    case "Tornado":
      icon = `Tornado-2x.png`;
      break;
    case "Dust":
      icon = `Dust-2x.png`;
      break;
    case "Mist":
      icon = `Fog-2x.png`;
      break;
    case "Snow":
      icon = `Snow-2x.png`;
      break;
    case "Rain":
      icon = `Rain-2x.png`;
      break;
    case "Drizzle":
      icon = `Drizzle-2x.png`;
      break;
    case "Thunderstorm":
      icon = `Severe Thunderstorm-2x.png`;
      break;
    default:
      icon = `Fog-2x.png`;
      break;
  }

  const Icon = styled.img `
    width: 40%;
  `;

  return (<Icon src={`http://openweathermap.org/img/wn/${icon}.png`} alt="Weather Icon"/>);
};

export default Icon;
