// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import { describeUVIndex } from "./uvIndex";

test("returns null for a missing or non-numeric value", () => {
  expect(describeUVIndex(undefined)).toBeNull();
  expect(describeUVIndex(null)).toBeNull();
  expect(describeUVIndex(NaN)).toBeNull();
});

test.each([
  [0, "Low"],
  [2, "Low"],
  [3, "Moderate"],
  [5, "Moderate"],
  [6, "High"],
  [7, "High"],
  [8, "Very High"],
  [10, "Very High"],
  [11, "Extreme"],
  [15, "Extreme"],
])("categorizes UV value %d as %s", (value, expectedLevel) => {
  expect(describeUVIndex(value).level).toBe(expectedLevel);
});

test("rounds a fractional value for display", () => {
  expect(describeUVIndex(8.86)).toEqual({ value: 9, level: "Very High" });
});
