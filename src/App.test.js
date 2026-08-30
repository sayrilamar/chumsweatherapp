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
  },
  miami: {
    name: "Miami",
    country: "US",
    main: "Clouds",
    description: "few clouds",
    icon: "02d",
    temp: 90,
    feels_like: 95,
    timezone: -14400, // UTC-04:00
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
  },
};

// Keyed by "lat,lon" exactly as App.js's buildWeatherUrl serializes them —
// this is what a real autocomplete selection fetches by, not a name string.
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
  },
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
  };
}

function forecastEntry(dt, tempMin, tempMax, icon, condition) {
  return { dt, main: { temp_min: tempMin, temp_max: tempMax }, weather: [{ main: condition, icon }] };
}

// One reusable, deterministic forecast fixture — its exact aggregation
// behavior is already fully covered by utils/forecast.test.js; here it just
// needs to prove the data reaches the UI at all.
const SAMPLE_FORECAST_LIST = [
  forecastEntry(Date.UTC(2026, 0, 15, 12, 0, 0) / 1000, 70, 80, "01d", "Clear"),
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

beforeEach(() => {
  global.fetch = jest.fn(mockFetchImplementation);
});

afterEach(() => {
  delete global.fetch;
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

test("displays weather details and a 5-day forecast strip after loading", async () => {
  const { findByText, getByText } = render(<App />);
  await findByText("Austell");

  // Weather details: Austell fixture defaults (humidity 50%, pressure 1015
  // hPa, wind 5 mph, visibility 10000m = 6.2mi) — proves App.js's new
  // fields (wind/humidity/pressure/visibility) reach WeatherDetails.
  expect(getByText("50%")).toBeInTheDocument();
  expect(getByText("1015 hPa")).toBeInTheDocument();
  expect(getByText("6.2 mi")).toBeInTheDocument();

  // Forecast strip: proves the separate /data/2.5/forecast fetch resolved
  // and was grouped/rendered — exact aggregation math is covered by
  // utils/forecast.test.js, not re-verified here.
  expect(await findByText("Thu")).toBeInTheDocument();
  expect(await findByText("Fri")).toBeInTheDocument();
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
