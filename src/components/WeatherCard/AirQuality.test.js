// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render } from "@testing-library/react";
import AirQuality from "./AirQuality";

test("renders nothing when aqi is missing or out of range", () => {
  const { container } = render(<AirQuality />);
  expect(container.firstChild).toBeNull();
});

test("renders the AQI label and pollutant breakdown", () => {
  const { getByText } = render(<AirQuality aqi={1} pm2_5={2.13} pm10={2.71} o3={52.51} />);
  expect(getByText("Good")).toBeInTheDocument();
  expect(getByText("PM2.5 2.1 · PM10 2.7 · O₃ 52.5 μg/m³")).toBeInTheDocument();
});

test("renders the badge alone when no pollutant components are available", () => {
  const { getByText, queryByText } = render(<AirQuality aqi={3} />);
  expect(getByText("Moderate")).toBeInTheDocument();
  expect(queryByText(/μg\/m³/)).not.toBeInTheDocument();
});
