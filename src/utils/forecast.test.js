// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import {
  groupForecastByDay,
  formatForecastDayLabel,
  getTodayForecastSlots,
  formatForecastHourLabel,
} from "./forecast";

function entry(dt, { tempMin, tempMax, icon = "01d", condition = "Clear", pop, rain, snow } = {}) {
  return {
    dt,
    main: { temp_min: tempMin, temp_max: tempMax },
    weather: [{ main: condition, icon }],
    ...(pop !== undefined && { pop }),
    ...(rain !== undefined && { rain }),
    ...(snow !== undefined && { snow }),
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

test("carries the day's highest chance-of-rain (pop) and total rain+snow volume", () => {
  const list = [
    entry(DAY1_00, { tempMin: 40, tempMax: 45, pop: 0.1, rain: { "3h": 0.2 } }),
    entry(DAY1_12, { tempMin: 55, tempMax: 60, pop: 0.8, rain: { "3h": 1.4 }, snow: { "3h": 0.3 } }),
    entry(DAY1_21, { tempMin: 48, tempMax: 50, pop: 0.3 }),
  ];

  const [day] = groupForecastByDay(list, 0);
  expect(day.pop).toBe(80);
  expect(day.precipMm).toBe(1.9);
});

test("defaults pop to 0% and precipMm to 0 when a forecast entry omits them entirely", () => {
  const list = [entry(DAY1_00, { tempMin: 40, tempMax: 45 })];
  const [day] = groupForecastByDay(list, 0);
  expect(day.pop).toBe(0);
  expect(day.precipMm).toBe(0);
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

describe("getTodayForecastSlots", () => {
  const NOW = Date.UTC(2026, 0, 15, 10, 0, 0); // 10:00 UTC = 06:00 local (offset -4h)

  test("returns only the remaining slots for today, in the city's local day", () => {
    const list = [
      entry(DAY1_00, { tempMin: 60, tempMax: 65 }), // 00:00 UTC = 20:00 *previous* local day — past, excluded
      entry(DAY1_12, { tempMin: 70, tempMax: 75 }), // 12:00 UTC = 08:00 local today — included
      entry(DAY1_21, { tempMin: 72, tempMax: 78 }), // 21:00 UTC = 17:00 local today — included
      entry(DAY2_12, { tempMin: 65, tempMax: 70 }), // next local day — excluded
    ];

    const slots = getTodayForecastSlots(list, -4 * 3600, NOW);
    expect(slots.map((s) => s.hour)).toEqual([8, 17]);
  });

  test("excludes slots that are already in the past relative to now", () => {
    const list = [entry(NOW / 1000 - 3600, { tempMin: 60, tempMax: 65 })]; // 1h before "now"
    expect(getTodayForecastSlots(list, 0, NOW)).toEqual([]);
  });

  test("rounds the temperature and carries icon/condition through", () => {
    // entry()'s helper only sets temp_min/temp_max; getTodayForecastSlots
    // reads main.temp, so build that fixture explicitly here.
    const list = [{ dt: DAY1_12, main: { temp: 75.6 }, weather: [{ main: "Clear", icon: "01d" }] }];
    const [slot] = getTodayForecastSlots(list, -4 * 3600, NOW);
    expect(slot.temp).toBe(76);
    expect(slot.icon).toBe("01d");
    expect(slot.condition).toBe("Clear");
  });

  test("rounds pop to a whole percent, defaulting to 0 when the entry omits it", () => {
    const list = [
      { dt: DAY1_12, main: { temp: 75 }, weather: [{ main: "Rain", icon: "10d" }], pop: 0.375 },
      { dt: DAY1_21, main: { temp: 70 }, weather: [{ main: "Clear", icon: "01d" }] },
    ];
    const [withPop, withoutPop] = getTodayForecastSlots(list, -4 * 3600, NOW);
    expect(withPop.pop).toBe(38);
    expect(withoutPop.pop).toBe(0);
  });

  test("returns an empty array when timezone or now is missing/invalid, rather than throwing", () => {
    expect(getTodayForecastSlots([], undefined, NOW)).toEqual([]);
    expect(getTodayForecastSlots([], -14400, undefined)).toEqual([]);
  });

  test("throws when list is not an array", () => {
    expect(() => getTodayForecastSlots(undefined, -14400, NOW)).toThrow();
  });
});

test("formatForecastHourLabel renders a 12-hour clock label", () => {
  expect(formatForecastHourLabel(0)).toBe("12 AM");
  expect(formatForecastHourLabel(8)).toBe("8 AM");
  expect(formatForecastHourLabel(12)).toBe("12 PM");
  expect(formatForecastHourLabel(17)).toBe("5 PM");
});
