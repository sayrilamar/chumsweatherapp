import React from "react";
import styled from "@emotion/styled";
import getLocalTimeInfo from "../../utils/localTime";
import { metersToMiles, degreesToCompass } from "../../utils/weatherDetails";

const Grid = styled.div`
  width: 100%;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(74, 74, 104, 0.15);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 8px;
`;

const Tile = styled.div`
  text-align: center;
`;

const Label = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a8aa3;
  margin: 0;
`;

const Value = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 2px 0 0;
`;

function WeatherDetails({
  windSpeed,
  windDeg,
  humidity,
  pressure,
  visibility,
  sunrise,
  sunset,
  timezone,
}) {
  const hasAny =
    typeof windSpeed === "number" ||
    typeof humidity === "number" ||
    typeof pressure === "number" ||
    typeof visibility === "number" ||
    typeof sunrise === "number" ||
    typeof sunset === "number";
  if (!hasAny) return null;

  const compass = degreesToCompass(windDeg);
  const visibilityMiles = metersToMiles(visibility);
  const sunriseInfo = typeof sunrise === "number" ? getLocalTimeInfo(sunrise * 1000, timezone) : null;
  const sunsetInfo = typeof sunset === "number" ? getLocalTimeInfo(sunset * 1000, timezone) : null;

  return (
    <Grid>
      <Tile>
        <Label>Wind</Label>
        <Value>
          {Math.round(windSpeed)} mph{compass ? ` ${compass}` : ""}
        </Value>
      </Tile>
      <Tile>
        <Label>Humidity</Label>
        <Value>{humidity}%</Value>
      </Tile>
      <Tile>
        <Label>Pressure</Label>
        <Value>{pressure} hPa</Value>
      </Tile>
      <Tile>
        <Label>Visibility</Label>
        <Value>{visibilityMiles} mi</Value>
      </Tile>
      <Tile>
        <Label>Sunrise</Label>
        <Value>{sunriseInfo ? sunriseInfo.time : "—"}</Value>
      </Tile>
      <Tile>
        <Label>Sunset</Label>
        <Value>{sunsetInfo ? sunsetInfo.time : "—"}</Value>
      </Tile>
    </Grid>
  );
}

export default WeatherDetails;
