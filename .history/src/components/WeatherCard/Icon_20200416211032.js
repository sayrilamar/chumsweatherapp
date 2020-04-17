import React from "react";
import styled from "@emotion/styled";

// https://openweathermap.org/weather-conditions
const Icon = props => {
    const Icon = styled.img `
    .icon {
      width: 40%;
    }
  `;

    return (<Icon
        className="icon"
        src="http://openweathermap.org/img/wn/03d@2x.png"
        alt="Weather Icon"/>);
};

export default Icon;
