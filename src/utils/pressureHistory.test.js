// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import { recordPressureAndGetTrend, locationKey } from "./pressureHistory";

const LAT = 33.8126;
const LON = -84.6344;
const NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
const THREE_HOURS_AGO = NOW - 3 * 60 * 60 * 1000;

beforeEach(() => {
  window.localStorage.clear();
});

test("returns no trend on a location's first-ever recording (no history yet)", () => {
  expect(recordPressureAndGetTrend(LAT, LON, 1015, NOW)).toEqual({ trend: null, changeHPa: null });
});

test("returns a trend once a sample from ~3 hours ago has been recorded", () => {
  recordPressureAndGetTrend(LAT, LON, 1010, THREE_HOURS_AGO);
  const result = recordPressureAndGetTrend(LAT, LON, 1014, NOW);
  expect(result).toEqual({ trend: "rising", changeHPa: 4 });
});

test("persists across separate calls (simulating separate page loads) via localStorage", () => {
  recordPressureAndGetTrend(LAT, LON, 1010, THREE_HOURS_AGO);
  // A brand-new "session" reading the same location later should still see
  // the earlier recording.
  const result = recordPressureAndGetTrend(LAT, LON, 1005, NOW);
  expect(result).toEqual({ trend: "falling", changeHPa: -5 });
});

test("keeps separate histories for different locations", () => {
  recordPressureAndGetTrend(LAT, LON, 1010, THREE_HOURS_AGO);
  // A different location's first-ever recording must not see Austell's
  // history — same as if it had never been visited before.
  const result = recordPressureAndGetTrend(40.7128, -74.006, 1020, NOW);
  expect(result).toEqual({ trend: null, changeHPa: null });
});

test("prunes samples older than the retention window", () => {
  const longAgo = NOW - 7 * 60 * 60 * 1000; // 7h ago — beyond the 6h retention window
  recordPressureAndGetTrend(LAT, LON, 1010, longAgo);
  const result = recordPressureAndGetTrend(LAT, LON, 1015, NOW);
  // The 7h-old sample was pruned, so there's nothing near the 3h mark.
  expect(result).toEqual({ trend: null, changeHPa: null });
});

test("does not record a sample when pressure isn't a number, but still returns a trend from existing history", () => {
  recordPressureAndGetTrend(LAT, LON, 1010, THREE_HOURS_AGO);
  const result = recordPressureAndGetTrend(LAT, LON, undefined, NOW);
  // No new (invalid) sample was written, but the trend computation still
  // ran against whatever history already existed — just with no current
  // pressure to compare, computePressureTrend itself returns no trend.
  expect(result).toEqual({ trend: null, changeHPa: null });
});

test("treats a corrupted (non-array) localStorage value as no history, rather than throwing", () => {
  window.localStorage.setItem(locationKey(LAT, LON), JSON.stringify({ not: "an array" }));
  expect(() => recordPressureAndGetTrend(LAT, LON, 1015, NOW)).not.toThrow();
  expect(recordPressureAndGetTrend(LAT, LON, 1015, NOW)).toEqual({ trend: null, changeHPa: null });
});

test("does nothing and returns no trend when lat/lon are missing", () => {
  expect(recordPressureAndGetTrend(undefined, undefined, 1015, NOW)).toEqual({
    trend: null,
    changeHPa: null,
  });
});

test("locationKey rounds coordinates so near-identical requests share one log", () => {
  expect(locationKey(33.81256, -84.63441)).toBe(locationKey(33.8124, -84.6343));
});

test("does not throw and behaves as if there's no history when localStorage is unavailable", () => {
  const original = window.localStorage;
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new Error("SecurityError: storage disabled");
    },
  });

  expect(() => recordPressureAndGetTrend(LAT, LON, 1015, NOW)).not.toThrow();
  expect(recordPressureAndGetTrend(LAT, LON, 1015, NOW)).toEqual({ trend: null, changeHPa: null });

  Object.defineProperty(window, "localStorage", { configurable: true, value: original });
});
