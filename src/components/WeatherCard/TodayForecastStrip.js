import React from "react";
import styled from "@emotion/styled";
import { formatForecastHourLabel } from "../../utils/forecast";

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

const SlotCard = styled.div`
  flex: 0 0 auto;
  width: 56px;
  text-align: center;
`;

const SlotLabel = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a4a68;
  margin: 0;
`;

const SlotIcon = styled.img`
  width: 34px;
  height: 34px;
  margin: 2px 0;
`;

const SlotTemp = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.8rem;
  color: #1a1a2e;
  margin: 0;
`;

// Not true hourly (the free-tier API doesn't offer that — see forecast.js),
// but the closest available: the remaining 3-hour slots for the rest of
// today, from data already fetched for the 5-day strip.
function TodayForecastStrip({ slots }) {
  if (!Array.isArray(slots) || slots.length === 0) return null;

  return (
    <>
      <Heading>Later Today</Heading>
      <Strip>
        {slots.map((slot) => (
          <SlotCard key={slot.dt}>
            <SlotLabel>{formatForecastHourLabel(slot.hour)}</SlotLabel>
            <SlotIcon
              src={`http://openweathermap.org/img/wn/${slot.icon}.png`}
              alt={slot.condition}
            />
            <SlotTemp>{slot.temp}°</SlotTemp>
          </SlotCard>
        ))}
      </Strip>
    </>
  );
}

export default TodayForecastStrip;
