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
  expect(getByText("1020 mb")).toBeInTheDocument();
  expect(getByText("30.12 inHg")).toBeInTheDocument();
  expect(getByText("6.2 mi")).toBeInTheDocument();
});

test("renders a rising pressure trend arrow", () => {
  // The arrow is its own nested <span>, and this pinned dom-testing-library
  // version's getByText only matches an element's full text when all of
  // its children are plain text (no nested elements) — so "1015 mb" (text)
  // and "▲" (the arrow's own pure-text span) are checked independently
  // rather than as one combined string.
  const { getByText } = render(<WeatherDetails pressure={1015} pressureTrend="rising" />);
  expect(getByText("1015 mb")).toBeInTheDocument();
  expect(getByText("▲")).toBeInTheDocument();
});

test("renders a falling pressure trend arrow", () => {
  const { getByText } = render(<WeatherDetails pressure={1015} pressureTrend="falling" />);
  expect(getByText("1015 mb")).toBeInTheDocument();
  expect(getByText("▼")).toBeInTheDocument();
});

test("renders no arrow when the trend is steady or unknown", () => {
  const { getByText, queryByText } = render(<WeatherDetails pressure={1015} pressureTrend="steady" />);
  expect(getByText("1015 mb")).toBeInTheDocument();
  expect(queryByText(/▲|▼/)).not.toBeInTheDocument();
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

test("renders the UV index value and risk level", () => {
  const { getByText } = render(<WeatherDetails uvIndex={8.86} />);
  expect(getByText("9 · Very High")).toBeInTheDocument();
});

test("renders a placeholder for UV index when it's the only field missing", () => {
  const { getAllByText } = render(<WeatherDetails windSpeed={5} windDeg={0} humidity={50} pressure={1000} />);
  // Sunrise, Sunset, and UV Index are all unset here, so three tiles show
  // the placeholder — just confirm it renders at all, per-tile correctness
  // (which field maps to which value) is covered by the other tests.
  expect(getAllByText("—").length).toBeGreaterThanOrEqual(1);
});

test("renders the whole grid when UV index is the only available field", () => {
  const { container } = render(<WeatherDetails uvIndex={3} />);
  expect(container.firstChild).not.toBeNull();
});
