import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import getLocalTimeInfo from "../../utils/localTime";

const Container = styled.p`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: #4a4a68;
  margin: 6px 0 0;
  text-align: center;
`;

const TzLabel = styled.span`
  color: #8a8aa3;
  font-weight: 400;
`;

// Ticks once a second so the displayed time stays live while the card is
// on screen. `timezoneOffsetSeconds` comes straight from OpenWeatherMap's
// `timezone` field on the weather response (already fetched — no extra
// API call for this feature).
function LocalTime({ timezoneOffsetSeconds }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const info = getLocalTimeInfo(now, timezoneOffsetSeconds);
  if (!info) return null;

  return (
    <Container>
      {info.time} <TzLabel>({info.utcLabel} local time)</TzLabel>
    </Container>
  );
}

export default LocalTime;
