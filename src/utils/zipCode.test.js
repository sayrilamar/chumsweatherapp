// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import { looksLikeZipCode } from "./zipCode";

test("recognizes a bare numeric ZIP/postal code", () => {
  expect(looksLikeZipCode("30106")).toBe(true);
  expect(looksLikeZipCode("90210")).toBe(true);
  expect(looksLikeZipCode("110001")).toBe(true); // 6-digit (India-style)
});

test("recognizes a ZIP code with a country suffix", () => {
  expect(looksLikeZipCode("30106,US")).toBe(true);
  expect(looksLikeZipCode("30106, US")).toBe(true);
});

test("rejects a city name", () => {
  expect(looksLikeZipCode("Austell")).toBe(false);
  expect(looksLikeZipCode("New York")).toBe(false);
});

test("rejects numeric strings shorter or longer than a plausible postal code", () => {
  expect(looksLikeZipCode("12")).toBe(false);
  expect(looksLikeZipCode("12345678901")).toBe(false);
});

test("rejects non-string or empty input, rather than throwing", () => {
  expect(looksLikeZipCode("")).toBe(false);
  expect(looksLikeZipCode(undefined)).toBe(false);
  expect(looksLikeZipCode(null)).toBe(false);
});
