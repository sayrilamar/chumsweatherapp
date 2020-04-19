import React from "react";
import styled from "@emotion/styled";

// https://openweathermap.org/weather-conditions
const Icon = ({condition}) => {
  let icon;
  switch (condition) {
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
      icon = `11d@2x`;
      break;
    case "Thunderstorm":
      icon = `11d@2x`;
      break;
    default:
      icon = ``;
      break;
  }

  const Icon = styled.img `
    width: 70%;
  `;

  return (<Icon src={`http://openweathermap.org/img/wn/${icon}.png`} alt="Weather Icon"/>);
};

export default Icon;
