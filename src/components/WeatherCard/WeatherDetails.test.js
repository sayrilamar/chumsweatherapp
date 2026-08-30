// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render } from "@testing-library/react";
import WeatherDetails from "./WeatherDetails";

test("renders nothing when no detail fields are available yet", () => {
  const { container } = render(<WeatherDetails />);
  expect(container.firstChild).toBeNull();
});

test("renders wind (with compass direction), humidity, pressure, and visibility", () => {
  const { getByText } = render(
    <WeatherDetails
      windSpeed={5.75}
      windDeg={70}
      humidity={80}
      pressure={1020}
      visibility={10000}
      sunrise={null}
      sunset={null}
      timezone={null}
    />
  );

  expect(getByText("6 mph ENE")).toBeInTheDocument();
  expect(getByText("80%")).toBeInTheDocument();
  expect(getByText("1020 hPa")).toBeInTheDocument();
  expect(getByText("6.2 mi")).toBeInTheDocument();
});

test("renders sunrise and sunset in the city's local time", () => {
  // sunrise 06:30 UTC, sunset 20:00 UTC, timezone offset -04:00 (US Eastern)
  const sunrise = Date.UTC(2026, 0, 15, 6, 30, 0) / 1000;
  const sunset = Date.UTC(2026, 0, 15, 20, 0, 0) / 1000;

  const { getByText } = render(
    <WeatherDetails
      windSpeed={0}
      windDeg={0}
      humidity={50}
      pressure={1000}
      visibility={10000}
      sunrise={sunrise}
      sunset={sunset}
      timezone={-14400}
    />
  );

  expect(getByText("2:30 AM")).toBeInTheDocument();
  expect(getByText("4:00 PM")).toBeInTheDocument();
});
