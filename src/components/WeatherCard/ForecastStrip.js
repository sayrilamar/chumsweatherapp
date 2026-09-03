import React from "react";
import styled from "@emotion/styled";
import { formatForecastDayLabel } from "../../utils/forecast";
import { mmToInches } from "../../utils/weatherDetails";

// Matches TodayForecastStrip's heading exactly — the two strips now live
// together in WeatherCard's ForecastPanel, so this label (previously
// missing entirely) is what visually separates "Later Today" from the
// 5-day outlook, rather than a border line.
const Heading = styled.p`
  width: 100%;
  font-family: "Fira Sans", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #8a8aa3;
  margin: 16px 0 6px;
  text-align: left;
`;

const Strip = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  overflow-x: auto;
`;

const DayCard = styled.div`
  flex: 0 0 auto;
  width: 64px;
  text-align: center;
`;

const DayLabel = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a4a68;
  margin: 0;
`;

const DayIcon = styled.img`
  width: 40px;
  height: 40px;
  margin: 2px 0;
`;

const DayTemps = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.8rem;
  color: #1a1a2e;
  margin: 0;
`;

const Low = styled.span`
  color: #8a8aa3;
`;

// Same "only show when there's a real chance" rule as TodayForecastStrip's
// Pop badge — a dry 5-day stretch shows no badges at all rather than five
// "💧 0%"s.
const Pop = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: #2f7bc7;
  margin: 2px 0 0;
`;

const PrecipAmount = styled.span`
  display: block;
  font-family: "Fira Sans", sans-serif;
  font-size: 0.65rem;
  font-weight: 500;
  color: #8a8aa3;
`;

function ForecastStrip({ days }) {
  if (!Array.isArray(days) || days.length === 0) return null;

  return (
    <>
      <Heading>5-Day Forecast</Heading>
      <Strip>
        {days.map((day) => (
          <DayCard key={day.dateMs}>
            <DayLabel>{formatForecastDayLabel(day.dateMs)}</DayLabel>
            <DayIcon src={`http://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} />
            <DayTemps>
              {day.maxTemp}° <Low>{day.minTemp}°</Low>
            </DayTemps>
            {day.pop > 0 && (
              <Pop aria-label={`${day.pop}% chance of rain`}>
                <span aria-hidden="true">💧</span> {day.pop}%
                {day.precipMm > 0 && <PrecipAmount>{mmToInches(day.precipMm)} in</PrecipAmount>}
              </Pop>
            )}
          </DayCard>
        ))}
      </Strip>
    </>
  );
}

export default ForecastStrip;
