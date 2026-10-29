// qi-trace: work-item="TODO(qi-trace): unresolved" acceptance-criteria="AC-1"
// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
//
// Baseline coverage for WeatherCard — this file had no dedicated test before
// (flagged as a Protection-layer gap in story-estimate-seam-b-ui-layer.md)
// — plus the new save/star toggle this story adds.

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import WeatherCard from "./component";

const BASE_WEATHER = {
  temp: 75,
  condition: "Clear",
  city: "Austell",
  country: "US",
  lat: 33.8126,
  lon: -84.6344,
  description: "clear sky",
  feels_like: 73,
  icon: "01d",
  timezone: -14400,
  windSpeed: 5,
  windDeg: 180,
  humidity: 50,
  pressure: 1015,
  pressureTrend: null,
  visibility: 10000,
  sunrise: 1736942400,
  sunset: 1736982000,
  uvIndex: 5,
  aqi: 1,
  pm2_5: 2,
  pm10: 3,
  o3: 40,
  rainVolume1h: null,
  snowVolume1h: null,
};

test("renders the city name and temperature", () => {
  const { getByText } = render(<WeatherCard weather={BASE_WEATHER} forecast={[]} todaySlots={[]} />);
  expect(getByText("Austell")).toBeInTheDocument();
  expect(getByText("It is 75°")).toBeInTheDocument();
});

test("does not render a save toggle when onToggleSave isn't provided (existing callers unaffected)", () => {
  const { queryByLabelText } = render(<WeatherCard weather={BASE_WEATHER} forecast={[]} todaySlots={[]} />);
  expect(queryByLabelText(/save austell/i)).not.toBeInTheDocument();
});

test("does not render a save toggle when the weather has no coordinates yet", () => {
  const { queryByLabelText } = render(
    <WeatherCard
      weather={{ ...BASE_WEATHER, lat: null, lon: null }}
      forecast={[]}
      todaySlots={[]}
      isSaved={false}
      onToggleSave={() => {}}
    />
  );
  expect(queryByLabelText(/save austell/i)).not.toBeInTheDocument();
});

test("renders an unfilled star and calls onToggleSave when the city isn't saved", () => {
  const onToggleSave = jest.fn();
  const { getByLabelText } = render(
    <WeatherCard weather={BASE_WEATHER} forecast={[]} todaySlots={[]} isSaved={false} onToggleSave={onToggleSave} />
  );
  const button = getByLabelText("Save Austell");
  expect(button).toHaveTextContent("☆");
  fireEvent.click(button);
  expect(onToggleSave).toHaveBeenCalledTimes(1);
});

test("renders a filled star and an accessible 'remove' label when the city is saved", () => {
  const onToggleSave = jest.fn();
  const { getByLabelText } = render(
    <WeatherCard weather={BASE_WEATHER} forecast={[]} todaySlots={[]} isSaved={true} onToggleSave={onToggleSave} />
  );
  const button = getByLabelText("Remove Austell from saved cities");
  expect(button).toHaveTextContent("★");
  fireEvent.click(button);
  expect(onToggleSave).toHaveBeenCalledTimes(1);
});
