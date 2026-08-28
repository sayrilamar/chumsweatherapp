// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)
//
// Replaces the unmodified Create React App boilerplate test, which asserted
// on a "learn react" link that stopped existing once App.js was rewritten
// into the weather app (see coverage-report.md — that stale assertion was
// the repo's only test, and it failed). fetch is mocked throughout so no
// real network call ever reaches the OpenWeatherMap API.

import React from "react";
import { render, fireEvent, wait } from "@testing-library/react";
import App from "./App";

const CITY_FIXTURES = {
  austell: {
    name: "Austell",
    country: "US",
    main: "Clear",
    description: "clear sky",
    icon: "01d",
    temp: 75,
    feels_like: 73,
  },
  miami: {
    name: "Miami",
    country: "US",
    main: "Clouds",
    description: "few clouds",
    icon: "02d",
    temp: 90,
    feels_like: 95,
  },
};

function mockFetchImplementation(url) {
  const match = String(url).match(/[?&]q=([^&]+)/);
  const city = match ? match[1].toLowerCase() : "";
  const fixture = CITY_FIXTURES[city];

  return Promise.resolve({
    json: () =>
      Promise.resolve(
        fixture
          ? {
              name: fixture.name,
              sys: { country: fixture.country },
              weather: [
                { main: fixture.main, description: fixture.description, icon: fixture.icon },
              ],
              main: { temp: fixture.temp, feels_like: fixture.feels_like },
            }
          : // Mirrors the real OpenWeatherMap 404 response shape (no `main`
            // key) — App.js's handleSearch throws reading `res.main.temp`
            // on this shape, which is what actually drives its .catch path.
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

// The plain <input> in App.js has no `type` attribute, and this repo's
// pinned @testing-library/dom (6.16.0) doesn't resolve an implicit
// "textbox" role for that case — so the input is queried via `container`
// rather than getByRole. The button (which does carry text content) is
// found fine via role.
function getCityInput(container) {
  return container.querySelector("input.input");
}

test("renders the search heading and form", async () => {
  const { getByText, getByRole, container, findByText } = render(<App />);
  expect(getByText("Search for City")).toBeInTheDocument();
  expect(getCityInput(container)).toBeInTheDocument();
  expect(getByRole("button", { name: /search/i })).toBeInTheDocument();

  // Let the initial-mount fetch settle inside this test so its state
  // update isn't flagged as an out-of-act() update after the test ends.
  await findByText("Austell");
});

test("loads the default city (Austell) weather on initial mount", async () => {
  const { findByText } = render(<App />);
  expect(await findByText("Austell")).toBeInTheDocument();
  expect(await findByText(/75 degrees outside/i)).toBeInTheDocument();
});

test("searches for a new city and displays its weather", async () => {
  const { getByRole, findByText, container } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getCityInput(container), { target: { value: "Miami" } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  expect(await findByText("Miami")).toBeInTheDocument();
  expect(await findByText(/90 degrees outside/i)).toBeInTheDocument();
});

test("shows an error alert and reloads the page on an unrecognized city", async () => {
  const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
  delete window.location;
  window.location = { reload: jest.fn() };

  const { getByRole, findByText, container } = render(<App />);
  await findByText("Austell");

  fireEvent.change(getCityInput(container), { target: { value: "Nowhereville" } });
  fireEvent.click(getByRole("button", { name: /search/i }));

  await wait(() => {
    expect(alertSpy).toHaveBeenCalledWith("Check Your Spelling... Enter a valid city!");
  });
  expect(window.location.reload).toHaveBeenCalledWith(true);
});
