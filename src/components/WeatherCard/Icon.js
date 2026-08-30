import React from "react";
import styled from "@emotion/styled";

const StyledIcon = styled.img`
  width: 140px;
  height: 140px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  margin: -12px 0;
`;

// https://openweathermap.org/weather-conditions
const Icon = ({ icon }) => {
  return (
    <StyledIcon
      src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
      alt="Weather Icon"
    />
  );
};

export default Icon;
