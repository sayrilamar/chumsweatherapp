// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render } from "@testing-library/react";
import Icon from "./Icon";

test("renders a high-resolution image pointing at the OpenWeatherMap icon URL", () => {
  const { getByAltText } = render(<Icon icon="01d" />);
  const img = getByAltText("Weather Icon");
  expect(img).toHaveAttribute("src", "http://openweathermap.org/img/wn/01d@2x.png");
});
