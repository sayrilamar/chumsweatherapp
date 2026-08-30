// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import { groupForecastByDay, formatForecastDayLabel } from "./forecast";

function entry(dt, { tempMin, tempMax, icon = "01d", condition = "Clear" } = {}) {
  return {
    dt,
    main: { temp_min: tempMin, temp_max: tempMax },
    weather: [{ main: condition, icon }],
  };
}

// UTC timestamps for 2026-01-15, 3-hour steps starting at 00:00 UTC.
const DAY1_00 = Date.UTC(2026, 0, 15, 0, 0, 0) / 1000;
const DAY1_12 = Date.UTC(2026, 0, 15, 12, 0, 0) / 1000;
const DAY1_21 = Date.UTC(2026, 0, 15, 21, 0, 0) / 1000;
const DAY2_00 = Date.UTC(2026, 0, 16, 0, 0, 0) / 1000;
const DAY2_12 = Date.UTC(2026, 0, 16, 12, 0, 0) / 1000;

test("groups entries by the city's local calendar day, not UTC day", () => {
  // offset 0 (UTC) keeps local day == UTC day for this test.
  const list = [
    entry(DAY1_00, { tempMin: 40, tempMax: 45 }),
    entry(DAY1_12, { tempMin: 55, tempMax: 60, icon: "02d", condition: "Clouds" }),
    entry(DAY1_21, { tempMin: 48, tempMax: 50 }),
    entry(DAY2_00, { tempMin: 42, tempMax: 46 }),
    entry(DAY2_12, { tempMin: 58, tempMax: 62 }),
  ];

  const days = groupForecastByDay(list, 0);
  expect(days).toHaveLength(2);
});

test("computes the min/max temp across all of a day's slots", () => {
  const list = [
    entry(DAY1_00, { tempMin: 40, tempMax: 45 }),
    entry(DAY1_12, { tempMin: 55, tempMax: 60 }),
    entry(DAY1_21, { tempMin: 48, tempMax: 50 }),
  ];

  const [day] = groupForecastByDay(list, 0);
  expect(day.minTemp).toBe(40);
  expect(day.maxTemp).toBe(60);
});

test("uses the slot closest to local noon as the representative icon/condition", () => {
  const list = [
    entry(DAY1_00, { tempMin: 40, tempMax: 45, icon: "04n", condition: "Clouds" }),
    entry(DAY1_12, { tempMin: 55, tempMax: 60, icon: "01d", condition: "Clear" }),
    entry(DAY1_21, { tempMin: 48, tempMax: 50, icon: "04n", condition: "Clouds" }),
  ];

  const [day] = groupForecastByDay(list, 0);
  expect(day.icon).toBe("01d");
  expect(day.condition).toBe("Clear");
});

test("groups by LOCAL day when a timezone offset shifts entries across the UTC day boundary", () => {
  // 21:00 UTC + 5 hours (offset +18000s) = 02:00 the next local day — this
  // entry must join DAY2's local group, not stay with DAY1's UTC-day entries.
  const list = [
    entry(DAY1_00, { tempMin: 40, tempMax: 45 }), // local: day 1, 05:00
    entry(DAY1_21, { tempMin: 48, tempMax: 50 }), // local: day 2, 02:00 (rolled over)
    entry(DAY2_12, { tempMin: 58, tempMax: 62 }), // local: day 2, 17:00
  ];

  const days = groupForecastByDay(list, 5 * 3600).sort((a, b) => a.maxTemp - b.maxTemp);
  expect(days).toHaveLength(2);
  const [day1, day2] = days;
  expect(day1.maxTemp).toBe(45);
  expect(day2.minTemp).toBe(48);
  expect(day2.maxTemp).toBe(62);
});

test("throws when list is not an array (a 404-shaped forecast response, e.g.)", () => {
  expect(() => groupForecastByDay(undefined, 0)).toThrow();
  expect(() => groupForecastByDay(null, 0)).toThrow();
});

test("formatForecastDayLabel renders the weekday at the shifted local date", () => {
  // 2026-01-15 is a Thursday.
  const thursdayNoonUTC = Date.UTC(2026, 0, 15, 12, 0, 0);
  expect(formatForecastDayLabel(thursdayNoonUTC)).toBe("Thu");
});
