// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import { metersToMiles, degreesToCompass } from "./weatherDetails";

test("metersToMiles converts and rounds to one decimal", () => {
  expect(metersToMiles(10000)).toBe(6.2);
  expect(metersToMiles(1609.34)).toBe(1);
  expect(metersToMiles(0)).toBe(0);
});

test("metersToMiles returns null for non-numeric input", () => {
  expect(metersToMiles(null)).toBeNull();
  expect(metersToMiles(undefined)).toBeNull();
  expect(metersToMiles(NaN)).toBeNull();
});

test("degreesToCompass maps the four cardinal directions", () => {
  expect(degreesToCompass(0)).toBe("N");
  expect(degreesToCompass(90)).toBe("E");
  expect(degreesToCompass(180)).toBe("S");
  expect(degreesToCompass(270)).toBe("W");
});

test("degreesToCompass wraps around at 360", () => {
  expect(degreesToCompass(360)).toBe("N");
  expect(degreesToCompass(359)).toBe("N");
});

test("degreesToCompass returns null for non-numeric input", () => {
  expect(degreesToCompass(null)).toBeNull();
  expect(degreesToCompass(undefined)).toBeNull();
});
