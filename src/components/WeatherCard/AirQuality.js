import React from "react";
import styled from "@emotion/styled";
import { describeAQI, formatPollutant } from "../../utils/airQuality";

// OpenWeatherMap's 1-5 AQI scale, each mapped to a color that reads as
// "getting worse" left to right — matches the convention most air-quality
// displays use (green = good, red = very poor).
const AQI_COLORS = {
  1: "#4caf82",
  2: "#a8c256",
  3: "#e8b93f",
  4: "#e2793d",
  5: "#d1495b",
};

const Container = styled.div`
  width: 100%;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(74, 74, 104, 0.15);
  text-align: center;
`;

const Heading = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #8a8aa3;
  margin: 0 0 8px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  font-family: "Fira Sans", sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  color: #ffffff;
  background: ${(props) => props.color};
`;

const Pollutants = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.75rem;
  color: #8a8aa3;
  margin: 8px 0 0;
`;

function AirQuality({ aqi, pm2_5, pm10, o3 }) {
  const info = describeAQI(aqi);
  if (!info) return null;

  const parts = [];
  const pm25Value = formatPollutant(pm2_5);
  const pm10Value = formatPollutant(pm10);
  const o3Value = formatPollutant(o3);
  if (pm25Value !== null) parts.push(`PM2.5 ${pm25Value}`);
  if (pm10Value !== null) parts.push(`PM10 ${pm10Value}`);
  if (o3Value !== null) parts.push(`O₃ ${o3Value}`);

  return (
    <Container>
      <Heading>Air Quality</Heading>
      <Badge color={AQI_COLORS[info.aqi]}>{info.label}</Badge>
      {parts.length > 0 && <Pollutants>{parts.join(" · ")} μg/m³</Pollutants>}
    </Container>
  );
}

export default AirQuality;
