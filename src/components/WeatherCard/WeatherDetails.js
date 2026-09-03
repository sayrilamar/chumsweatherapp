import React from "react";
import styled from "@emotion/styled";
import getLocalTimeInfo from "../../utils/localTime";
import { metersToMiles, degreesToCompass, hpaToInHg, mmToInches } from "../../utils/weatherDetails";
import { describeUVIndex } from "../../utils/uvIndex";

const Grid = styled.div`
  /* No top border/margin here — this now lives inside WeatherCard's
     DetailsPanel wrapper, which already owns that boundary (a divider on
     mobile, a whole panel background on wider screens). */
  width: 100%;
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

const SubValue = styled.span`
  display: block;
  font-family: "Fira Sans", sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  color: #8a8aa3;
  margin-top: 1px;
`;

const TrendArrow = styled.span`
  margin-left: 3px;
  color: ${(props) => (props.direction === "rising" ? "#4caf82" : "#d1495b")};
`;

function WeatherDetails({
  windSpeed,
  windDeg,
  humidity,
  pressure,
  pressureTrend,
  visibility,
  sunrise,
  sunset,
  timezone,
  uvIndex,
  rainVolume1h,
  snowVolume1h,
}) {
  const hasAny =
    typeof windSpeed === "number" ||
    typeof humidity === "number" ||
    typeof pressure === "number" ||
    typeof visibility === "number" ||
    typeof sunrise === "number" ||
    typeof sunset === "number" ||
    typeof uvIndex === "number";
  if (!hasAny) return null;

  const compass = degreesToCompass(windDeg);
  const visibilityMiles = metersToMiles(visibility);
  const pressureInHg = hpaToInHg(pressure);
  const sunriseInfo = typeof sunrise === "number" ? getLocalTimeInfo(sunrise * 1000, timezone) : null;
  const sunsetInfo = typeof sunset === "number" ? getLocalTimeInfo(sunset * 1000, timezone) : null;
  const uvInfo = describeUVIndex(uvIndex);
  const rainInches = mmToInches(rainVolume1h);
  const snowInches = mmToInches(snowVolume1h);

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
      {typeof rainVolume1h === "number" && (
        <Tile>
          <Label>Rain (1h)</Label>
          <Value>{rainVolume1h} mm</Value>
          {rainInches !== null && <SubValue>{rainInches} in</SubValue>}
        </Tile>
      )}
      {typeof snowVolume1h === "number" && (
        <Tile>
          <Label>Snow (1h)</Label>
          <Value>{snowVolume1h} mm</Value>
          {snowInches !== null && <SubValue>{snowInches} in</SubValue>}
        </Tile>
      )}
      <Tile>
        <Label>Pressure</Label>
        <Value>
          {pressure} mb
          {(pressureTrend === "rising" || pressureTrend === "falling") && (
            <TrendArrow direction={pressureTrend}>{pressureTrend === "rising" ? "▲" : "▼"}</TrendArrow>
          )}
        </Value>
        {pressureInHg !== null && <SubValue>{pressureInHg} inHg</SubValue>}
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
      <Tile>
        <Label>UV Index</Label>
        <Value>{uvInfo ? `${uvInfo.value} · ${uvInfo.level}` : "—"}</Value>
      </Tile>
    </Grid>
  );
}

export default WeatherDetails;
