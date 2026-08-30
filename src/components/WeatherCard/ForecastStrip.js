import React from "react";
import styled from "@emotion/styled";
import { formatForecastDayLabel } from "../../utils/forecast";

const Strip = styled.div`
  width: 100%;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(74, 74, 104, 0.15);
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

function ForecastStrip({ days }) {
  if (!Array.isArray(days) || days.length === 0) return null;

  return (
    <Strip>
      {days.map((day) => (
        <DayCard key={day.dateMs}>
          <DayLabel>{formatForecastDayLabel(day.dateMs)}</DayLabel>
          <DayIcon src={`http://openweathermap.org/img/wn/${day.icon}.png`} alt={day.condition} />
          <DayTemps>
            {day.maxTemp}° <Low>{day.minTemp}°</Low>
          </DayTemps>
        </DayCard>
      ))}
    </Strip>
  );
}

export default ForecastStrip;
