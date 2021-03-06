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
      icon = `50d@2x`;
      break;
    case "Fog":
      icon = `50d@2x`;
      break;
    case "Tornado":
      icon = `50d@2x`;
      break;
    case "Dust":
      icon = `50d@2x`;
      break;
    case "Mist":
      icon = `50d@2x`;
      break;
    case "Snow":
      icon = `13d@2x`;
      break;
    case "Rain":
      icon = `10d@2x`;
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
