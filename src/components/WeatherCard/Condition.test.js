// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render } from "@testing-library/react";
import Condition from "./Condition";

test("renders the temperature, description, and feels-like values", () => {
  const { getByText } = render(
    <Condition temp={75} condition="Clear" description="clear sky" feels_like={73} />
  );
  expect(getByText("It is 75°")).toBeInTheDocument();
  expect(getByText("clear sky")).toBeInTheDocument();
  expect(getByText("Feels like 73°")).toBeInTheDocument();
});

test("renders no rain/snow line when neither is present (the dry-weather default)", () => {
  const { queryByText } = render(
    <Condition temp={75} condition="Clear" description="clear sky" feels_like={73} />
  );
  expect(queryByText(/Rain:/)).not.toBeInTheDocument();
  expect(queryByText(/Snow:/)).not.toBeInTheDocument();
});

test("renders the current rain rate (mm/hr and in/hr) when it's actively raining", () => {
  const { getByText } = render(
    <Condition
      temp={82}
      condition="Rain"
      description="light rain"
      feels_like={89}
      rainVolume1h={0.5}
    />
  );
  expect(getByText("Rain: 0.5 mm/hr (0.02 in/hr)")).toBeInTheDocument();
});

test("renders the current snow rate (mm/hr and in/hr) when it's actively snowing", () => {
  const { getByText } = render(
    <Condition
      temp={20}
      condition="Snow"
      description="light snow"
      feels_like={8}
      snowVolume1h={2}
    />
  );
  expect(getByText("Snow: 2 mm/hr (0.08 in/hr)")).toBeInTheDocument();
});
