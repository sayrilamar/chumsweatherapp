// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import getWeatherTheme, { GRADIENTS } from "./weatherTheme";

test("returns the day gradient for a known condition with a 'd' icon", () => {
  const theme = getWeatherTheme("Clear", "01d");
  expect(theme.isNight).toBe(false);
  const [from, to] = GRADIENTS.Clear.day;
  expect(theme.gradient).toBe(`linear-gradient(135deg, ${from} 0%, ${to} 100%)`);
});

test("returns the night gradient for a known condition with an 'n' icon", () => {
  const theme = getWeatherTheme("Clear", "01n");
  expect(theme.isNight).toBe(true);
  const [from, to] = GRADIENTS.Clear.night;
  expect(theme.gradient).toBe(`linear-gradient(135deg, ${from} 0%, ${to} 100%)`);
});

test("falls back to the default palette for an unrecognized condition", () => {
  const theme = getWeatherTheme("SomeNewCondition", "50d");
  const [from, to] = GRADIENTS.default.day;
  expect(theme.gradient).toBe(`linear-gradient(135deg, ${from} 0%, ${to} 100%)`);
});

test("falls back to the default day palette when condition/icon are not yet loaded", () => {
  const theme = getWeatherTheme(null, null);
  expect(theme.isNight).toBe(false);
  const [from, to] = GRADIENTS.default.day;
  expect(theme.gradient).toBe(`linear-gradient(135deg, ${from} 0%, ${to} 100%)`);
});

test.each(Object.keys(GRADIENTS))("every palette (%s) defines both a day and a night gradient", (key) => {
  expect(GRADIENTS[key].day).toHaveLength(2);
  expect(GRADIENTS[key].night).toHaveLength(2);
});
