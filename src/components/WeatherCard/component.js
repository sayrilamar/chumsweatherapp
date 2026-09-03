import React from "react";
import styled from "@emotion/styled";
import Location from "./Location";
import Icon from "./Icon";
import Condition from "./Condition";
import LocalTime from "./LocalTime";
import WeatherDetails from "./WeatherDetails";
import AirQuality from "./AirQuality";
import TodayForecastStrip from "./TodayForecastStrip";
import ForecastStrip from "./ForecastStrip";
import WeatherMap from "./WeatherMap";

// Mobile-first: one column, everything stacked in reading order. From
// ~720px up (matching .AppContent's own breakpoint in App.css) this becomes
// a two-column layout — current conditions beside a distinct details panel
// — with the forecast strips spanning the full width below, so wider
// screens use the extra horizontal room instead of just stretching a
// narrow mobile column and growing taller and taller.
const Card = styled.div`
  margin: 28px auto 0;
  width: 100%;
  max-width: 420px;
  padding: 28px 24px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas:
    "heading"
    "hero"
    "details"
    "forecast"
    "map"
    "signature";
  gap: 20px;
  text-align: center;
  color: #1a1a2e;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);

  @media (min-width: 720px) {
    max-width: 720px;
    padding: 32px;
    gap: 12px 32px;
    grid-template-columns: 1.05fr 1fr;
    grid-template-areas:
      "heading heading"
      "hero details"
      "forecast forecast"
      "map map"
      "signature signature";
  }
`;

const Heading = styled.h2`
  grid-area: heading;
  font-family: "Fira Sans", sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #4a4a68;
  margin: 0;
`;

const HeroPanel = styled.div`
  grid-area: hero;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

// Wraps WeatherDetails + AirQuality as one visual group. On mobile it's just
// a divider below the hero, same as before; on wider screens it becomes its
// own distinct side panel (background + rounded corners) rather than a
// continuation of the same flat stack, so the two panels read as
// deliberately organized sections instead of everything being one long list.
const DetailsPanel = styled.div`
  grid-area: details;
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid rgba(74, 74, 104, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 720px) {
    padding: 20px;
    border-top: none;
    background: rgba(74, 74, 104, 0.05);
    border-radius: 18px;
    justify-content: center;
  }
`;

const ForecastPanel = styled.div`
  grid-area: forecast;
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid rgba(74, 74, 104, 0.15);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MapPanel = styled.div`
  grid-area: map;
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid rgba(74, 74, 104, 0.15);
`;

const Signature = styled.p`
  grid-area: signature;
  font-family: "Fira Sans", sans-serif;
  font-size: 0.85rem;
  color: #8a8aa3;
  margin: 0;
`;

const WeatherCard = ({ weather, forecast, todaySlots }) => {
  const {
    temp,
    condition,
    city,
    country,
    lat,
    lon,
    description,
    feels_like,
    icon,
    timezone,
    windSpeed,
    windDeg,
    humidity,
    pressure,
    pressureTrend,
    visibility,
    sunrise,
    sunset,
    uvIndex,
    aqi,
    pm2_5,
    pm10,
    o3,
    rainVolume1h,
    snowVolume1h,
  } = weather;

  return (
    <Card>
      <Heading>Hey Chum! Here's your forecast for...</Heading>
      <HeroPanel>
        <Location city={city} state={country} />
        <LocalTime timezoneOffsetSeconds={timezone} />
        <Icon condition={condition} icon={icon} />
        <Condition
          temp={temp}
          condition={condition}
          description={description}
          feels_like={feels_like}
          rainVolume1h={rainVolume1h}
          snowVolume1h={snowVolume1h}
        />
      </HeroPanel>
      <DetailsPanel>
        <WeatherDetails
          windSpeed={windSpeed}
          windDeg={windDeg}
          humidity={humidity}
          pressure={pressure}
          pressureTrend={pressureTrend}
          visibility={visibility}
          sunrise={sunrise}
          sunset={sunset}
          timezone={timezone}
          uvIndex={uvIndex}
          rainVolume1h={rainVolume1h}
          snowVolume1h={snowVolume1h}
        />
        <AirQuality aqi={aqi} pm2_5={pm2_5} pm10={pm10} o3={o3} />
      </DetailsPanel>
      <ForecastPanel>
        <TodayForecastStrip slots={todaySlots} />
        <ForecastStrip days={forecast} />
      </ForecastPanel>
      {typeof lat === "number" && typeof lon === "number" && (
        <MapPanel>
          <WeatherMap lat={lat} lon={lon} city={city} />
        </MapPanel>
      )}
      <Signature>created by daddy!</Signature>
    </Card>
  );
};

export default WeatherCard;
