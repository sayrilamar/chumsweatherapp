import React from "react";
import styled from "@emotion/styled";
import Location from "./Location";
import Icon from "./Icon";
import Condition from "./Condition";
import LocalTime from "./LocalTime";

const Card = styled.div`
  margin: 28px auto 0;
  width: 100%;
  max-width: 420px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  color: #1a1a2e;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
`;

const Heading = styled.h2`
  font-family: "Fira Sans", sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #4a4a68;
  margin: 0;
`;

const Signature = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.85rem;
  color: #8a8aa3;
  margin: 4px 0 0;
`;

const WeatherCard = ({
  temp,
  condition,
  city,
  state,
  description,
  feels_like,
  icon,
  timezone,
}) => {
  return (
    <Card>
      <Heading>Hey Chum! Here's your forecast for...</Heading>
      <Location city={city} state={state} />
      <LocalTime timezoneOffsetSeconds={timezone} />
      <Icon condition={condition} icon={icon} />
      <Condition temp={temp} condition={condition} description={description} feels_like={feels_like} />
      <Signature>created by daddy!</Signature>
    </Card>
  );
};

export default WeatherCard;
