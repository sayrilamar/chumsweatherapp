// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import getLocalTimeInfo from "./localTime";

// A fixed UTC instant to compute offsets against: 2026-01-15T12:00:00.000Z (noon UTC).
const NOON_UTC = Date.UTC(2026, 0, 15, 12, 0, 0);

test("returns null when the offset is missing or not a number", () => {
  expect(getLocalTimeInfo(NOON_UTC, undefined)).toBeNull();
  expect(getLocalTimeInfo(NOON_UTC, null)).toBeNull();
  expect(getLocalTimeInfo(NOON_UTC, NaN)).toBeNull();
});

test("computes the correct 12-hour time and UTC label for a negative (US) offset", () => {
  // -14400s = UTC-04:00 (US Eastern, summer) → 12:00 UTC - 4h = 08:00 → 8:00 AM
  const info = getLocalTimeInfo(NOON_UTC, -14400);
  expect(info.time).toBe("8:00 AM");
  expect(info.utcLabel).toBe("UTC-04:00");
});

test("computes the correct 12-hour time and UTC label for a positive offset", () => {
  // 19800s = UTC+05:30 (India) → 12:00 UTC + 5:30 = 17:30 → 5:30 PM
  const info = getLocalTimeInfo(NOON_UTC, 19800);
  expect(info.time).toBe("5:30 PM");
  expect(info.utcLabel).toBe("UTC+05:30");
});

test("handles zero offset (UTC itself)", () => {
  const info = getLocalTimeInfo(NOON_UTC, 0);
  expect(info.time).toBe("12:00 PM");
  expect(info.utcLabel).toBe("UTC+00:00");
});

test("renders 12:00 AM at local midnight, not 0:00", () => {
  const midnightUTC = Date.UTC(2026, 0, 15, 0, 0, 0);
  const info = getLocalTimeInfo(midnightUTC, 0);
  expect(info.time).toBe("12:00 AM");
});

test("rolls over correctly across a day boundary from the offset shift", () => {
  // 23:00 UTC + 3 hours = 02:00 the next day, still just a time-of-day label
  const lateUTC = Date.UTC(2026, 0, 15, 23, 0, 0);
  const info = getLocalTimeInfo(lateUTC, 3 * 3600);
  expect(info.time).toBe("2:00 AM");
});
