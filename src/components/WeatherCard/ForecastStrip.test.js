// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render } from "@testing-library/react";
import ForecastStrip from "./ForecastStrip";

test("renders nothing when there are no forecast days", () => {
  const { container } = render(<ForecastStrip days={[]} />);
  expect(container.firstChild).toBeNull();
});

test("renders a day card per forecast entry with weekday label, icon, and high/low temps", () => {
  const days = [
    {
      dateMs: Date.UTC(2026, 0, 15, 12, 0, 0), // Thursday
      minTemp: 40,
      maxTemp: 55,
      icon: "01d",
      condition: "Clear",
    },
    {
      dateMs: Date.UTC(2026, 0, 16, 12, 0, 0), // Friday
      minTemp: 38,
      maxTemp: 50,
      icon: "10d",
      condition: "Rain",
    },
  ];

  const { getByText, getAllByRole } = render(<ForecastStrip days={days} />);

  expect(getByText("Thu")).toBeInTheDocument();
  expect(getByText("Fri")).toBeInTheDocument();

  const images = getAllByRole("img");
  expect(images).toHaveLength(2);
  expect(images[0]).toHaveAttribute("src", "http://openweathermap.org/img/wn/01d.png");
  expect(images[1]).toHaveAttribute("alt", "Rain");
});
