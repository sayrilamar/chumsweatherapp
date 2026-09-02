// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render } from "@testing-library/react";
import TodayForecastStrip from "./TodayForecastStrip";

test("renders nothing when there are no slots (no forecast loaded, or none left today)", () => {
  const { container } = render(<TodayForecastStrip slots={[]} />);
  expect(container.firstChild).toBeNull();
});

test("renders nothing when slots isn't an array", () => {
  const { container } = render(<TodayForecastStrip slots={undefined} />);
  expect(container.firstChild).toBeNull();
});

test("renders each slot's hour label, icon, and temperature", () => {
  const slots = [
    { dt: 1, hour: 14, temp: 82, icon: "01d", condition: "Clear" },
    { dt: 2, hour: 17, temp: 79, icon: "02d", condition: "Clouds" },
  ];
  const { getByText, getByAltText } = render(<TodayForecastStrip slots={slots} />);

  expect(getByText("Later Today")).toBeInTheDocument();
  expect(getByText("2 PM")).toBeInTheDocument();
  expect(getByText("82°")).toBeInTheDocument();
  expect(getByAltText("Clear")).toHaveAttribute("src", "http://openweathermap.org/img/wn/01d.png");
  expect(getByText("5 PM")).toBeInTheDocument();
  expect(getByText("79°")).toBeInTheDocument();
});
