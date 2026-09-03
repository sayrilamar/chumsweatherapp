// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import { computePressureTrend, findReferenceReading } from "./pressureTrend";

const NOW = Date.UTC(2026, 0, 15, 12, 0, 0);
const THREE_HOURS_AGO = NOW - 3 * 60 * 60 * 1000;

test("returns no trend when there's no history yet", () => {
  expect(computePressureTrend([], 1015, NOW)).toEqual({ trend: null, changeHPa: null });
});

test("returns no trend when the closest sample is too far from 3 hours ago", () => {
  // 5 hours ago — outside the 45-minute tolerance window around the 3h mark.
  const history = [{ timestamp: NOW - 5 * 60 * 60 * 1000, pressure: 1015 }];
  expect(computePressureTrend(history, 1010, NOW)).toEqual({ trend: null, changeHPa: null });
});

test("detects a rising trend", () => {
  const history = [{ timestamp: THREE_HOURS_AGO, pressure: 1010 }];
  expect(computePressureTrend(history, 1013, NOW)).toEqual({ trend: "rising", changeHPa: 3 });
});

test("detects a falling trend", () => {
  const history = [{ timestamp: THREE_HOURS_AGO, pressure: 1015 }];
  expect(computePressureTrend(history, 1011, NOW)).toEqual({ trend: "falling", changeHPa: -4 });
});

test("small changes within the threshold count as steady, not rising/falling", () => {
  const history = [{ timestamp: THREE_HOURS_AGO, pressure: 1015 }];
  expect(computePressureTrend(history, 1015.5, NOW)).toEqual({ trend: "steady", changeHPa: 0.5 });
});

test("a change exactly at the threshold counts as rising/falling, not steady", () => {
  const history = [{ timestamp: THREE_HOURS_AGO, pressure: 1014 }];
  expect(computePressureTrend(history, 1015, NOW).trend).toBe("rising");
});

test("picks the closest sample to 3 hours ago when several exist", () => {
  const history = [
    { timestamp: NOW - 1 * 60 * 60 * 1000, pressure: 999 }, // 1h ago — not this one
    { timestamp: THREE_HOURS_AGO, pressure: 1010 }, // exactly 3h ago — this one
    { timestamp: NOW - 5 * 60 * 60 * 1000, pressure: 999 }, // 5h ago — not this one
  ];
  const { pressure } = findReferenceReading(history, NOW);
  expect(pressure).toBe(1010);
});

test("returns no trend for a non-numeric current pressure", () => {
  const history = [{ timestamp: THREE_HOURS_AGO, pressure: 1010 }];
  expect(computePressureTrend(history, undefined, NOW)).toEqual({ trend: null, changeHPa: null });
  expect(computePressureTrend(history, NaN, NOW)).toEqual({ trend: null, changeHPa: null });
});

test("accepts a sample within the 45-minute tolerance around exactly 3 hours ago", () => {
  const history = [{ timestamp: THREE_HOURS_AGO - 40 * 60 * 1000, pressure: 1012 }]; // 3h40m ago
  expect(computePressureTrend(history, 1015, NOW).trend).toBe("rising");
});
