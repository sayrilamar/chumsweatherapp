// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import { describeAQI, formatPollutant } from "./airQuality";

test.each([
  [1, "Good"],
  [2, "Fair"],
  [3, "Moderate"],
  [4, "Poor"],
  [5, "Very Poor"],
])("describes AQI level %d as %s", (aqi, expectedLabel) => {
  expect(describeAQI(aqi)).toEqual({ aqi, label: expectedLabel });
});

test("returns null for an out-of-range or missing AQI value", () => {
  expect(describeAQI(0)).toBeNull();
  expect(describeAQI(6)).toBeNull();
  expect(describeAQI(undefined)).toBeNull();
  expect(describeAQI(null)).toBeNull();
});

test("formatPollutant rounds to one decimal place", () => {
  expect(formatPollutant(2.13)).toBe(2.1);
  expect(formatPollutant(130.507)).toBe(130.5);
  expect(formatPollutant(0)).toBe(0);
});

test("formatPollutant returns null for a missing or non-numeric value", () => {
  expect(formatPollutant(undefined)).toBeNull();
  expect(formatPollutant(null)).toBeNull();
  expect(formatPollutant(NaN)).toBeNull();
});
