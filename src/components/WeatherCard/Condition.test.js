// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render } from "@testing-library/react";
import Condition from "./Condition";

test("renders the description and both temperature values", () => {
  const { getByText } = render(
    <Condition temp={75} condition="Clear" description="clear sky" feels_like={73} />
  );
  expect(getByText(/It is clear sky outside!/i)).toBeInTheDocument();
  expect(
    getByText(/It is 75 degrees outside, but it actually feels like 73!/i)
  ).toBeInTheDocument();
});
