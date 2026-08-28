// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import getWeatherGradient from "./gradient";

test("returns a warm (red/orange) gradient above 53.6°F", () => {
  const gradient = getWeatherGradient(80);
  expect(gradient).toContain("rgb(255,");
});

test("returns a cool (blue) gradient at or below 53.6°F", () => {
  const gradient = getWeatherGradient(40);
  expect(gradient).toContain("rgb(0,");
});

test("treats the 53.6°F boundary as cold (inclusive <=)", () => {
  const gradient = getWeatherGradient(53.6);
  expect(gradient).toContain("rgb(0,");
});

test("computes the exact interpolated color at a known cold temperature", () => {
  const highColor = (1 - (40 + 4) / 89) * 255;
  expect(getWeatherGradient(40)).toContain(`rgb(0, ${highColor}, 255)`);
});

test("computes the exact interpolated color at a known hot temperature", () => {
  const highColor = (1 - (80 - 53.6) / 50.4) * 255;
  expect(getWeatherGradient(80)).toContain(`rgb(255, ${highColor}, 0)`);
});

test("returns null when temp is not a comparable number (neither branch matches)", () => {
  expect(getWeatherGradient(NaN)).toBeNull();
  expect(getWeatherGradient(undefined)).toBeNull();
});
