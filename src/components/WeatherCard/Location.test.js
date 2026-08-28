// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render } from "@testing-library/react";
import Location from "./Location";

test("renders the city and country", () => {
  const { getByText } = render(<Location city="Austell" state="US" />);
  expect(getByText("Austell")).toBeInTheDocument();
  expect(getByText("US")).toBeInTheDocument();
});
