import React from "react";
import styled from "@emotion/styled";

// https://openweathermap.org/weather-conditions
const Icon = ({icon}) => {
  const Icon = styled.img `
    width: 50%;
  `;

  return (<Icon src={`http://openweathermap.org/img/wn/${icon}.png`} alt="Weather Icon"/>);
};

export default Icon;
