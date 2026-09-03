// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)
//
// fetch is mocked throughout so no real network call ever reaches
// OpenWeatherMap's weather or geocoding endpoints (qi-test-design: "Do not
// generate tests that touch production endpoints").

import React from "react";
import { render, fireEvent, wait } from "@testing-library/react";
import App from "./App";
import * as weatherThemeModule from "./theme/weatherTheme";
import { recordPressureAndGetTrend } from "./utils/pressureHistory";

const CITY_FIXTURES = {
  austell: {
    name: "Austell",
    country: "US",
    main: "Clear",
    description: "clear sky",
    icon: "01d",
    temp: 75,
    feels_like: 73,
    timezone: -14400, // UTC-04:00
    lat: 33.8126,
    lon: -84.6344,
  },
  miami: {
    name: "Miami",
    country: "US",
    main: "Rain",
    description: "light rain",
    icon: "10d",
    temp: 90,
    feels_like: 95,
    timezone: -14400, // UTC-04:00
    lat: 25.7617,
    lon: -80.1918,
    rain: { "1h": 0.5 },
  },
  chicago: {
    name: "Chicago",
    country: "US",
    main: "Snow",
    description: "light snow",
    icon: "13d",
    temp: 20,
    feels_like: 8,
    timezone: -18000, // UTC-05:00
    lat: 41.8781,
    lon: -87.6298,
    snow: { "1h": 1 },
  },
};

// Keyed by "lat,lon" exactly as App.js's buildWeatherUrl serializes them —
// this is what a real autocomplete selection (or the browser's geolocation)
// fetches by, not a name string. Each fixture's own `lat`/`lon` (echoed back
// as `coord` in toWeatherJSON) must match its key exactly, since App.js
// re-fetches air quality/UV using the *weather response's* coord, not the
// original request params.
const WEATHER_BY_LATLON = {
  "39.78,-89.65": {
    name: "Springfield",
    country: "US",
    main: "Clouds",
    description: "partly cloudy",
    icon: "02d",
    temp: 65,
    feels_like: 63,
    timezone: -18000, // UTC-05:00
    lat: 39.78,
    lon: -89.65,
  },
  "40.7128,-74.006": {
    name: "New York",
    country: "US",
    main: "Clear",
    description: "clear sky",
    icon: "01d",
    temp: 68,
    feels_like: 66,
    timezone: -14400, // UTC-04:00
    lat: 40.7128,
    lon: -74.006,
  },
};

// Air quality + UV, keyed the same "lat,lon" way, looked up by each
// fixture's own coord (see note above) — these are separate endpoints
// (/air_pollution, /uvi) always fetched by coordinates.
const AIR_QUALITY_BY_LATLON = {
  "33.8126,-84.6344": { aqi: 1, pm2_5: 2.13, pm10: 2.71, o3: 52.51, uvIndex: 8.86 }, // Austell
  "25.7617,-80.1918": { aqi: 2, pm2_5: 5.4, pm10: 8.1, o3: 35.2, uvIndex: 10.2 }, // Miami
  "41.8781,-87.6298": { aqi: 3, pm2_5: 12.3, pm10: 18.5, o3: 40.1, uvIndex: 3.1 }, // Chicago
  "39.78,-89.65": { aqi: 2, pm2_5: 6, pm10: 9, o3: 38, uvIndex: 4.5 }, // Springfield
  "40.7128,-74.006": { aqi: 4, pm2_5: 20.5, pm10: 30.2, o3: 45, uvIndex: 6 }, // New York
};

const GEOCODE_FIXTURES = {
  springfield: [
    { name: "Springfield", state: "Illinois", country: "US", lat: 39.78, lon: -89.65 },
    { name: "Springfield", state: "Missouri", country: "US", lat: 37.2, lon: -93.29 },
  ],
};

const OFFLINE_SENTINEL = "offlinetest";

function toWeatherJSON(fixture) {
  return {
    name: fixture.name,
    coord: { lat: fixture.lat, lon: fixture.lon },
    sys: {
      country: fixture.country,
      sunrise: fixture.sunrise ?? Date.UTC(2026, 0, 15, 11, 0, 0) / 1000,
      sunset: fixture.sunset ?? Date.UTC(2026, 0, 15, 23, 0, 0) / 1000,
    },
    weather: [{ main: fixture.main, description: fixture.description, icon: fixture.icon }],
    main: {
      temp: fixture.temp,
      feels_like: fixture.feels_like,
      humidity: fixture.humidity ?? 50,
      pressure: fixture.pressure ?? 1015,
    },
    wind: { speed: fixture.windSpeed ?? 5, deg: fixture.windDeg ?? 180 },
    visibility: fixture.visibility ?? 10000,
    timezone: fixture.timezone ?? -18000,
    ...(fixture.rain && { rain: fixture.rain }),
    ...(fixture.snow && { snow: fixture.snow }),
  };
}

function forecastEntry(dt, tempMin, tempMax, icon, condition, extra = {}) {
  return {
    dt,
    main: { temp_min: tempMin, temp_max: tempMax },
    weather: [{ main: condition, icon }],
    ...extra,
  };
}

// One reusable, deterministic forecast fixture — its exact aggregation
// behavior is already fully covered by utils/forecast.test.js; here it just
// needs to prove the data reaches the UI at all.
const SAMPLE_FORECAST_LIST = [
  // Same local calendar day as each other (Austell, UTC-04:00) — both count
  // toward "Later Today" when "now" is earlier than both, e.g. 10:00 UTC.
  forecastEntry(Date.UTC(2026, 0, 15, 12, 0, 0) / 1000, 70, 80, "01d", "Clear"),
  forecastEntry(Date.UTC(2026, 0, 15, 15, 0, 0) / 1000, 72, 82, "01d", "Clear"),
  forecastEntry(Date.UTC(2026, 0, 16, 12, 0, 0) / 1000, 65, 75, "02d", "Clouds"),
];

function mockFetchImplementation(url) {
  const urlStr = String(url);

  if (urlStr.includes("/geo/1.0/direct")) {
    const match = urlStr.match(/[?&]q=([^&]*)/);
    const q = match ? decodeURIComponent(match[1]).toLowerCase() : "";
    // Prefix match, like a real geocoding search: the user doesn't have to
    // finish typing the whole city name before results appear.
    const key = Object.keys(GEOCODE_FIXTURES).find((k) => k.startsWith(q));
    return Promise.resolve({ json: () => Promise.resolve(key ? GEOCODE_FIXTURES[key] : []) });
  }

  if (urlStr.includes(OFFLINE_SENTINEL)) {
    return Promise.reject(new Error("network request failed"));
  }

  if (urlStr.includes("/data/2.5/forecast")) {
    return Promise.resolve({ json: () => Promise.resolve({ list: SAMPLE_FORECAST_LIST }) });
  }

  // These two must be checked before the generic lat/lon weather branch
  // below — they're also requested with lat/lon params, just a different
  // path, always using the *weather response's* coord (see loadLocation).
  if (urlStr.includes("/air_pollution")) {
    const m = urlStr.match(/[?&]lat=([^&]+)&lon=([^&]+)/);
    const aq = m && AIR_QUALITY_BY_LATLON[`${m[1]},${m[2]}`];
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          list: aq
            ? [{ main: { aqi: aq.aqi }, components: { pm2_5: aq.pm2_5, pm10: aq.pm10, o3: aq.o3 } }]
            : [],
        }),
    });
  }

  if (urlStr.includes("/uvi")) {
    const m = urlStr.match(/[?&]lat=([^&]+)&lon=([^&]+)/);
    const aq = m && AIR_QUALITY_BY_LATLON[`${m[1]},${m[2]}`];
    return Promise.resolve({ json: () => Promise.resolve({ value: aq ? aq.uvIndex : 0 }) });
  }

  const latLonMatch = urlStr.match(/[?&]lat=([^&]+)&lon=([^&]+)/);
  if (latLonMatch) {
    const fixture = WEATHER_BY_LATLON[`${latLonMatch[1]},${latLonMatch[2]}`];
    return Promise.resolve({
      json: () =>
        Promise.resolve(fixture ? toWeatherJSON(fixture) : { cod: "404", message: "not found" }),
    });
  }

  const qMatch = urlStr.match(/[?&]q=([^&]*)/);
  const city = qMatch ? qMatch[1].toLowerCase() : "";
  const fixture = CITY_FIXTURES[city];
  return Promise.resolve({
    json: () =>
      Promise.resolve(
        fixture
          ? toWeatherJSON(fixture)
          : // Mirrors the real OpenWeatherMap 404 response shape (no `main`
            // key) — App.js throws reading `res.main.temp` on this shape,
            // which is what actually drives its .catch path.
            { cod: "404", message: "city not found" }
      ),
  });
}

// jsdom has no navigator.geolocation by default, so every existing test
// below (which never calls this) exercises the "unsupported/denied → fall
// back to the default city" path for free. Tests that want the success
// path call this explicitly.
function mockGeolocationSuccess(latitude, longitude) {
  global.navigator.geolocation = {
    getCurrentPosition: (success) => success({ coords: { latitude, longitude } }),
  };
}

function mockGeolocationError(error) {
  global.navigator.geolocation = {
    getCurrentPosition: (success, errorCb) => errorCb(error),
  };
}

beforeEach(() => {
  global.fetch = jest.fn(mockFetchImplementation);
  // Pressure-trend history is real localStorage, keyed by lat/lon — most
  // tests reuse the same fixture coordinates (Austell, etc.), so without
  // clearing this, one test's recorded reading would leak into the next
  // test's trend calculation.
  window.localStorage.clear();
});

afterEach(() => {
  delete global.fetch;
  delete global.navigator.geolocation;
  jest.restoreAllMocks();
});

test("renders the search heading and form", async () => {
  const { getByText, getByRole, findByText } = render(<App />);
  expect(getByText("Search for City")).toBeInTheDocument();
  expect(getByRole("combobox")).toBeInTheDocument();
  expect(getByRole("button", { name: /search/i })).toBeInTheDocument();

  // Let the initial-mount fetch settle inside this test so its state
  // update isn't flagged as an out-of-act() update after the test ends.
  await findByText("Austell");
});

test("loads the default city (Austell) weather on initial mount", async () => {
  const { findByText } = render(<App />);
  expect(await findByText("Austell")).toBeInTheDocument();
  expect(await findByText("It is 75°")).toBeInTheDocument();
});

test("uses the browser's geolocation on initial mount when available, instead of the default city", async () => {
  mockGeolocationSuccess(40.7128, -74.006);
  const { findByText, queryByText } = render(<App />);

  expect(await findByText("New York")).toBeInTheDocument();
  expect(await findByText("It is 68°")).toBeInTheDocument();
  expect(queryByText("Austell")).not.toBeInTheDocument();
});

test("falls back to the default city on initial mount when geolocation is denied", async () => {
  mockGeolocationError({ code: 1, message: "User denied Geolocation" });
  const { findByText } = render(<App />);
  expect(await findByText("Austell")).toBeInTheDocument();
});

test("the 'Use My Location' button loads weather for the browser's current position", async () => {
  // Mock geolocation only *after* the initial mount settles — mocking it
  // beforehand would make the initial-mount geolocation attempt itself
  // resolve to New York, never showing Austell at all, which conflates
  // this test with the "on initial mount" one above.
  const { findByText, getByRole } = render(<App />);
  await findByText("Austell");

  mockGeolocationSuccess(40.7128, -74.006);
  fireEvent.click(getByRole("button", { name: /use my current location/i }));

  expect(await findByText("New York")).toBeInTheDocument();
  expect(await findByText("It is 68°")).toBeInTheDocument();
});

test("clicking 'Use My Location' again after a search reuses the exact coordinates, not stale text", async () => {
  const { findByText, getByRole } = render(<App />);
  await findByText("Austell");

  mockGeolocationSuccess(40.7128, -74.006);
  fireEvent.click(getByRole("button", { name: /use my current location/i }));
  await findByText("New York");

  // Clicking Search right after, with the box unedited, must reuse the
  // exact geolocated coordinates — the same stale-search protection as an
  // autocomplete selection — not re-query the name-based endpoint with the
  // display label "New York, US".
  fireEvent.click(getByRole("button", { name: /^search$/i }));
  expect(await findByText("New York")).toBeInTheDocument();
});

test("shows an alert (not a silent failure) when the location button's geolocation fails", async () => {
  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  mockGeolocationError({ code: 1, message: "User denied Geolocation" });
  const { findByText, getByRole } = render(<App />);
  await findByText("Austell");

  fireEvent.click(getByRole("button", { name: /use my current location/i }));

  await wait(() => {
    expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/permission was denied/i));
  });
});

test("displays weather details and a 5-day forecast strip after loading", async () => {
  const { findByText, getByText } = render(<App />);
  await findByText("Austell");

  // Weather details: Austell fixture defaults (humidity 50%, pressure 1015
  // mb, wind 5 mph, visibility 10000m = 6.2mi) — proves App.js's new
  // fields (wind/humidity/pressure/visibility) reach WeatherDetails.
  expect(getByText("50%")).toBeInTheDocument();
  expect(getByText("1015 mb")).toBeInTheDocument();
  expect(getByText("6.2 mi")).toBeInTheDocument();

  // Forecast strip: proves the separate /data/2.5/forecast fetch resolved
  // and was grouped/rendered — exact aggregation math is covered by
  // utils/forecast.test.js, not re-verified here.
  expect(await findByText("Thu")).toBeInTheDocument();
  expect(await findByText("Fri")).toBeInTheDocument();
});

test("shows no pressure trend arrow on a location's first-ever load (no history yet)", async () => {
  const { findByText, getByText, queryByText } = render(<App />);
  await findByText("Austell");
  expect(getByText("1015 mb")).toBeInTheDocument();
  expect(queryByText(/1015 mb[▲▼]/)).not.toBeInTheDocument();
});

test("shows a rising pressure trend once a ~3-hour-old sample exists for that location", async () => {
  const now = Date.UTC(2026, 0, 15, 12, 0, 0);
  const threeHoursAgo = now - 3 * 60 * 60 * 1000;
  // Seed history as if Austell (33.8126, -84.6344) was loaded 3 hours ago
  // at a lower pressure than its fixture's current 1015.
  recordPressureAndGetTrend(33.8126, -84.6344, 1010, threeHoursAgo);

  jest.spyOn(Date, "now").mockReturnValue(now);
  const { findByText, getByText } = render(<App />);
  await findByText("Austell");

  // The arrow is its own nested <span>, so (per this pinned dom-testing-
  // library version's getByText behavior — see WeatherDetails.test.js)
  // it's checked independently of the "1015 mb" text alongside it.
  expect(await findByText("1015 mb")).toBeInTheDocument();
  expect(getByText("▲")).toBeInTheDocument();
});

test("displays air quality and UV index, fetched by the weather response's own coordinates", async () => {
  const { findByText, getByText } = render(<App />);
  await findByText("Austell");

  // Austell fixture (aqi: 1, uvIndex: 8.86) — proves both extra fetches
  // resolved and were correctly matched to Austell's coord (33.8126,
  // -84.6344), not just any lat/lon.
  expect(getByText("Good")).toBeInTheDocument();
  expect(getByText("PM2.5 2.1 · PM10 2.7 · O₃ 52.5 μg/m³")).toBeInTheDocument();
  expect(await findByText("9 · Very High")).toBeInTheDocument();
});

test("shows no Rain or Snow tile for the default (dry) city, but shows Rain when a rainy city is searched", async () => {
  const { getByRole, getByText, findByText, queryByText } = render(<App />);
  await findByText("Austell");
  expect(queryByText(/Rain \(1h\)/)).not.toBeInTheDocument();
  expect(queryByText(/Snow \(1h\)/)).not.toBeInTheDocument();

  fireEvent.change(getByRole("combobox"), { target: { value: "Miami" } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  expect(await findByText("Miami")).toBeInTheDocument();
  expect(getByText("Rain (1h)")).toBeInTheDocument();
  expect(getByText("0.5 mm")).toBeInTheDocument();
  // Also surfaced right in the hero card, not just the details tile.
  expect(getByText("Rain: 0.5 mm/hr (0.02 in/hr)")).toBeInTheDocument();
});

test("shows a Snow tile for a snowy city", async () => {
  const { getByRole, findByText, getByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "Chicago" } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  expect(await findByText("Chicago")).toBeInTheDocument();
  expect(getByText("Snow (1h)")).toBeInTheDocument();
  expect(getByText("1 mm")).toBeInTheDocument();
  // Also surfaced right in the hero card, not just the details tile.
  expect(getByText("Snow: 1 mm/hr (0.04 in/hr)")).toBeInTheDocument();
});

test("weather still loads normally when air quality/UV fetches fail (non-critical extras)", async () => {
  global.fetch = jest.fn((url) => {
    const urlStr = String(url);
    if (urlStr.includes("/air_pollution") || urlStr.includes("/uvi")) {
      return Promise.reject(new Error("network request failed"));
    }
    return mockFetchImplementation(url);
  });

  const { findByText, queryByText } = render(<App />);
  expect(await findByText("Austell")).toBeInTheDocument();
  expect(await findByText("It is 75°")).toBeInTheDocument();
  // Core weather isn't held hostage by these two non-critical extras failing.
  expect(queryByText("Good")).not.toBeInTheDocument();
});

test("air quality and UV index update for a newly searched city, not stale data", async () => {
  const { getByRole, findByText, getByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "Chicago" } });
  fireEvent.click(getByRole("button", { name: /^search$/i }));
  await findByText("Chicago");

  // Chicago fixture (aqi: 3, uvIndex: 3.1) — distinct from Austell's.
  expect(getByText("Moderate")).toBeInTheDocument();
  expect(await findByText("3 · Moderate")).toBeInTheDocument();
});

test("displays a 'Later Today' strip from the remaining same-day 3-hour slots", async () => {
  // 10:00 UTC = 6:00 AM local (Austell, UTC-04:00) — before both of the
  // Jan 15 sample entries (8:00 AM and 11:00 AM local), so both qualify as
  // still-upcoming "later today" slots; the Jan 16 entry must not appear.
  jest.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 0, 15, 10, 0, 0));
  const { findByText, getByText, queryByText } = render(<App />);
  await findByText("Austell");

  expect(await findByText("Later Today")).toBeInTheDocument();
  expect(getByText("8 AM")).toBeInTheDocument();
  expect(getByText("11 AM")).toBeInTheDocument();
  // The Jan 16 entry (a different calendar day) belongs in the 5-day strip,
  // not "Later Today".
  expect(queryByText("12 PM")).not.toBeInTheDocument();
});

test("displays the city's local time and UTC offset from the weather response", async () => {
  jest.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 0, 15, 12, 0, 0)); // noon UTC
  const { findByText } = render(<App />);
  await findByText("Austell");

  // Austell fixture: timezone = -14400s = UTC-04:00 → noon UTC - 4h = 8:00 AM
  expect(await findByText(/8:00 AM/)).toBeInTheDocument();
  expect(await findByText(/UTC-04:00 local time/)).toBeInTheDocument();

  Date.now.mockRestore();
});

test("searches for a new city by name and displays its weather", async () => {
  const { getByRole, findByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "Miami" } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  expect(await findByText("Miami")).toBeInTheDocument();
  expect(await findByText("It is 90°")).toBeInTheDocument();
});

test("selecting an autocomplete suggestion fetches by lat/lon and displays that city's weather", async () => {
  const { getByRole, findByText, findByRole } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "spring" } });
  const option = await findByRole("option", { name: /Springfield.*Illinois/i });
  fireEvent.mouseDown(option);

  // Resolves via lat/lon (39.78,-89.65), not a name-based query — proves
  // the selection path is wired to the geocoded coordinates, not just the
  // typed text (which would be ambiguous between the Illinois and Missouri
  // Springfields returned by the geocode fixture above).
  expect(await findByText("Springfield")).toBeInTheDocument();
  expect(await findByText("It is 65°")).toBeInTheDocument();
});

test("clicking Search after selecting a suggestion (box unedited) re-confirms the same city, not a different lookup", async () => {
  // Regression test: formatCityLabel("Springfield", "Illinois", "US") is not
  // a valid OpenWeatherMap name query ("City,ST,US" is expected, not the
  // full state name) — clicking Search afterward must reuse the selected
  // city's lat/lon instead of re-parsing that label as a name search.
  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  const { getByRole, findByText, findByRole } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "spring" } });
  const option = await findByRole("option", { name: /Springfield.*Illinois/i });
  fireEvent.mouseDown(option);
  await findByText("It is 65°");

  fireEvent.click(getByRole("button", { name: /search/i }));

  // Give the click's fetch a moment to settle, then confirm it's still the
  // same, correct city — not an error path or a different lookup.
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(await findByText("Springfield")).toBeInTheDocument();
  expect(await findByText("It is 65°")).toBeInTheDocument();
  expect(alertSpy).not.toHaveBeenCalled();
});

test("editing the search box after a selection makes the next search a fresh name-based lookup", async () => {
  const { getByRole, findByText, findByRole } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "spring" } });
  const option = await findByRole("option", { name: /Springfield.*Illinois/i });
  fireEvent.mouseDown(option);
  await findByText("It is 65°");

  // The user now types over the selection rather than accepting it.
  fireEvent.change(getByRole("combobox"), { target: { value: "Miami" } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  expect(await findByText("Miami")).toBeInTheDocument();
  expect(await findByText("It is 90°")).toBeInTheDocument();
});

test("pressing Enter in the search box (no suggestion highlighted) submits the form and searches by name", async () => {
  const { getByRole, findByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "Miami" } });
  // Submitting the form directly — this is what a bare Enter keypress in a
  // text input inside a <form> triggers natively when nothing else (like
  // CitySearch's own highlighted-suggestion Enter handler) intercepts it.
  fireEvent.submit(getByRole("combobox").closest("form"));

  expect(await findByText("Miami")).toBeInTheDocument();
  expect(await findByText("It is 90°")).toBeInTheDocument();
});

test("a failure fetching weather for a selected city is handled gracefully, not a crash", async () => {
  const { getByRole, findByText, findByRole, getByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "spring" } });
  const option = await findByRole("option", { name: /Springfield.*Missouri/i });
  fireEvent.mouseDown(option);

  // This fixture's lat/lon has no matching WEATHER_BY_LATLON entry, so the
  // weather fetch resolves to a 404-shaped body and mapWeatherResponse
  // throws — handleSelectCity's .catch must swallow that, not crash the app.
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(getByText("Search for City")).toBeInTheDocument();
});

test("searching a second time replaces the previous result, not stale data", async () => {
  const { getByRole, findByText, queryByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "Miami" } });
  fireEvent.click(getByRole("button", { name: /search/i }));
  await findByText("Miami");

  fireEvent.change(getByRole("combobox"), { target: { value: "Chicago" } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  expect(await findByText("Chicago")).toBeInTheDocument();
  expect(await findByText("It is 20°")).toBeInTheDocument();
  expect(queryByText("Miami")).not.toBeInTheDocument();
});

test("clicking Search with an empty query shows the error path, same as an unknown city", async () => {
  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  delete window.location;
  window.location = { reload: jest.fn() };

  const { getByRole, findByText } = render(<App />);
  await findByText("Austell");

  fireEvent.click(getByRole("button", { name: /search/i }));

  await wait(() => {
    expect(alertSpy).toHaveBeenCalledWith("Check Your Spelling... Enter a valid city!");
  });
  expect(window.location.reload).toHaveBeenCalledWith(true);
});

test("shows an error alert and reloads the page on an unrecognized city", async () => {
  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  delete window.location;
  window.location = { reload: jest.fn() };

  const { getByRole, findByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "Nowhereville" } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  await wait(() => {
    expect(alertSpy).toHaveBeenCalledWith("Check Your Spelling... Enter a valid city!");
  });
  expect(window.location.reload).toHaveBeenCalledWith(true);
});

test("a genuine network failure while searching still shows the error path (not a crash)", async () => {
  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  delete window.location;
  window.location = { reload: jest.fn() };

  const { getByRole, findByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: OFFLINE_SENTINEL } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  await wait(() => {
    expect(alertSpy).toHaveBeenCalledWith("Check Your Spelling... Enter a valid city!");
  });
  expect(window.location.reload).toHaveBeenCalledWith(true);
});

test("a genuine network failure on initial load does not crash the app", async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error("network request failed")));

  const { getByText, getByRole } = render(<App />);
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(getByText("Search for City")).toBeInTheDocument();
  expect(getByRole("combobox")).toBeInTheDocument();
});

// jsdom's bundled CSS engine (this react-scripts version's jest-environment-
// jsdom) doesn't parse linear-gradient() as a valid background value at
// all — it silently drops the whole inline style attribute rather than
// just failing to reflect one property, so there's no DOM-based way to
// assert the gradient landed. Instead, verify the wiring itself (App reads
// weather.condition/icon and passes them to getWeatherTheme) via a spy;
// the gradient-per-condition mapping is independently covered by
// theme/weatherTheme.test.js.
test("integration: the page background theme is derived from the loaded city's condition", async () => {
  const themeSpy = jest.spyOn(weatherThemeModule, "default");
  const { findByText } = render(<App />);
  await findByText("Austell"); // fixture condition is "Clear", icon "01d"

  expect(themeSpy).toHaveBeenCalledWith("Clear", "01d");
  themeSpy.mockRestore();
});

test("integration: the page background theme updates when a new city's condition differs", async () => {
  const themeSpy = jest.spyOn(weatherThemeModule, "default");
  const { getByRole, findByText } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getByRole("combobox"), { target: { value: "Chicago" } });
  fireEvent.click(getByRole("button", { name: /search/i }));
  await findByText("Chicago"); // fixture condition is "Snow", icon "13d"

  expect(themeSpy).toHaveBeenCalledWith("Snow", "13d");
  themeSpy.mockRestore();
});
