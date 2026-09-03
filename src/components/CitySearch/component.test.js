// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)
//
// fetch is mocked throughout — no real network call ever reaches
// OpenWeatherMap's Geocoding API (qi-test-design: "Do not generate tests
// that touch production endpoints").

import React, { useState } from "react";
import { render, fireEvent, wait } from "@testing-library/react";
import CitySearch from "./component";

// CitySearch is a controlled component (query/onQueryChange are owned by
// the parent, exactly like App.js drives it) — this harness reproduces
// that so typing actually flows back into the `query` prop.
function ControlledCitySearch({ onSelectCity, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  return (
    <CitySearch
      query={query}
      onQueryChange={setQuery}
      onSelectCity={onSelectCity}
      placeholder="Start typing a city…"
    />
  );
}

function extractQuery(url) {
  const match = String(url).match(/[?&]q=([^&]+)/);
  return match ? match[1] : "";
}

function fixture(overrides) {
  return {
    name: "Springfield",
    state: "Illinois",
    country: "US",
    lat: 39.78,
    lon: -89.65,
    ...overrides,
  };
}

afterEach(() => {
  delete global.fetch;
  jest.restoreAllMocks();
});

test("does not query the geocoding API until 2 characters are typed", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }));
  const { getByRole } = render(<ControlledCitySearch onSelectCity={jest.fn()} />);

  fireEvent.change(getByRole("combobox"), { target: { value: "s" } });
  await new Promise((resolve) => setTimeout(resolve, 400)); // past the debounce window

  expect(global.fetch).not.toHaveBeenCalled();
});

test("shows a dropdown of suggestions once 2+ characters are typed", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve([
          fixture({ state: "Illinois" }),
          fixture({ state: "Missouri", lat: 37.2, lon: -93.29 }),
        ]),
    })
  );
  const { getByRole, findAllByRole } = render(<ControlledCitySearch onSelectCity={jest.fn()} />);

  fireEvent.change(getByRole("combobox"), { target: { value: "sp" } });

  const options = await findAllByRole("option");
  expect(options).toHaveLength(2);
  expect(options[0]).toHaveTextContent("Springfield");
  expect(options[0]).toHaveTextContent("Illinois");
  expect(options[1]).toHaveTextContent("Missouri");
});

test("selecting a suggestion by click calls onSelectCity and closes the dropdown", async () => {
  const springfield = fixture();
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([springfield]) })
  );
  const onSelectCity = jest.fn();
  const { getByRole, findByRole, queryByRole } = render(
    <ControlledCitySearch onSelectCity={onSelectCity} />
  );

  fireEvent.change(getByRole("combobox"), { target: { value: "sp" } });
  const option = await findByRole("option");
  fireEvent.mouseDown(option);

  expect(onSelectCity).toHaveBeenCalledWith(springfield);
  expect(queryByRole("listbox")).not.toBeInTheDocument();

  // The dropdown must not silently reopen once the (already in-flight)
  // debounced fetch for the post-selection query text resolves.
  await new Promise((resolve) => setTimeout(resolve, 400));
  expect(queryByRole("listbox")).not.toBeInTheDocument();
});

test("keyboard: ArrowDown highlights options and Enter selects the highlighted one", async () => {
  const illinois = fixture({ state: "Illinois" });
  const missouri = fixture({ state: "Missouri", lat: 37.2, lon: -93.29 });
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([illinois, missouri]) })
  );
  const onSelectCity = jest.fn();
  const { getByRole, findAllByRole } = render(
    <ControlledCitySearch onSelectCity={onSelectCity} />
  );

  const input = getByRole("combobox");
  fireEvent.change(input, { target: { value: "sp" } });
  await findAllByRole("option");

  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });

  expect(onSelectCity).toHaveBeenCalledWith(missouri);
});

test("keyboard: ArrowUp wraps around to the last option", async () => {
  const illinois = fixture({ state: "Illinois" });
  const missouri = fixture({ state: "Missouri", lat: 37.2, lon: -93.29 });
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([illinois, missouri]) })
  );
  const onSelectCity = jest.fn();
  const { getByRole, findAllByRole } = render(
    <ControlledCitySearch onSelectCity={onSelectCity} />
  );

  const input = getByRole("combobox");
  fireEvent.change(input, { target: { value: "sp" } });
  await findAllByRole("option");

  // No option highlighted yet; ArrowUp should wrap to the last one.
  fireEvent.keyDown(input, { key: "ArrowUp" });
  fireEvent.keyDown(input, { key: "Enter" });

  expect(onSelectCity).toHaveBeenCalledWith(missouri);
});

test("keyboard events are ignored while the dropdown is closed", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }));
  const onSelectCity = jest.fn();
  const { getByRole } = render(<ControlledCitySearch onSelectCity={onSelectCity} />);

  const input = getByRole("combobox");
  // No suggestions have loaded, so the dropdown is closed — these should
  // be no-ops rather than throwing on an empty suggestions array.
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });

  expect(onSelectCity).not.toHaveBeenCalled();
});

test("a geocode fetch failure clears suggestions without crashing", async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error("network request failed")));
  const { getByRole, queryByRole } = render(
    <ControlledCitySearch onSelectCity={jest.fn()} />
  );

  fireEvent.change(getByRole("combobox"), { target: { value: "sp" } });
  await new Promise((resolve) => setTimeout(resolve, 400));

  expect(queryByRole("listbox")).not.toBeInTheDocument();
});

test("Escape closes the dropdown without selecting anything", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([fixture()]) })
  );
  const onSelectCity = jest.fn();
  const { getByRole, findAllByRole, queryByRole } = render(
    <ControlledCitySearch onSelectCity={onSelectCity} />
  );

  const input = getByRole("combobox");
  fireEvent.change(input, { target: { value: "sp" } });
  await findAllByRole("option");

  fireEvent.keyDown(input, { key: "Escape" });

  expect(queryByRole("listbox")).not.toBeInTheDocument();
  expect(onSelectCity).not.toHaveBeenCalled();
});

test("clicking outside the search box closes the dropdown", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve([fixture()]) })
  );
  const { getByRole, findAllByRole, queryByRole, container } = render(
    <div>
      <ControlledCitySearch onSelectCity={jest.fn()} />
      <button type="button">outside</button>
    </div>
  );

  fireEvent.change(getByRole("combobox"), { target: { value: "sp" } });
  await findAllByRole("option");

  fireEvent.mouseDown(container.querySelector("button"));

  expect(queryByRole("listbox")).not.toBeInTheDocument();
});

test("routes a ZIP-shaped query to the geocoding-by-ZIP endpoint and shows it as a single suggestion", async () => {
  global.fetch = jest.fn((url) => {
    expect(String(url)).toContain("/geo/1.0/zip");
    expect(String(url)).toContain("zip=30106");
    return Promise.resolve({
      json: () =>
        Promise.resolve({ zip: "30106", name: "Cobb County", country: "US", lat: 33.8369, lon: -84.6307 }),
    });
  });
  const { getByRole, findAllByRole } = render(<ControlledCitySearch onSelectCity={jest.fn()} />);

  fireEvent.change(getByRole("combobox"), { target: { value: "30106" } });

  const options = await findAllByRole("option");
  expect(options).toHaveLength(1);
  expect(options[0]).toHaveTextContent("Cobb County");
  expect(options[0]).toHaveTextContent("30106");
  expect(options[0]).toHaveTextContent("US");
});

test("selecting a ZIP suggestion calls onSelectCity with its resolved lat/lon", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({ zip: "90210", name: "Beverly Hills", country: "US", lat: 34.0901, lon: -118.4065 }),
    })
  );
  const onSelectCity = jest.fn();
  const { getByRole, findByRole } = render(<ControlledCitySearch onSelectCity={onSelectCity} />);

  fireEvent.change(getByRole("combobox"), { target: { value: "90210" } });
  const option = await findByRole("option");
  fireEvent.mouseDown(option);

  expect(onSelectCity).toHaveBeenCalledWith({
    name: "Beverly Hills",
    country: "US",
    zip: "90210",
    lat: 34.0901,
    lon: -118.4065,
  });
});

test("shows no suggestion for a ZIP code the geocoder doesn't recognize", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ cod: "404", message: "not found" }) })
  );
  const { getByRole, queryByRole } = render(<ControlledCitySearch onSelectCity={jest.fn()} />);

  fireEvent.change(getByRole("combobox"), { target: { value: "00000" } });
  await new Promise((resolve) => setTimeout(resolve, 400));

  expect(queryByRole("listbox")).not.toBeInTheDocument();
});

test("a stale, slower response never overwrites a newer, faster one", async () => {
  const deferred = {};
  global.fetch = jest.fn((url) => {
    const q = extractQuery(url);
    deferred[q] = {};
    const promise = new Promise((resolve) => {
      deferred[q].resolve = resolve;
    });
    return promise.then((body) => ({ json: () => Promise.resolve(body) }));
  });

  const { getByRole, findAllByRole, queryByText } = render(
    <ControlledCitySearch onSelectCity={jest.fn()} />
  );
  const input = getByRole("combobox");

  fireEvent.change(input, { target: { value: "sp" } });
  await wait(() => expect(deferred.sp).toBeDefined());

  fireEvent.change(input, { target: { value: "spr" } });
  await wait(() => expect(deferred.spr).toBeDefined());

  // Resolve out of order: the newer query ("spr") answers first...
  deferred.spr.resolve([fixture({ name: "Springfield" })]);
  await findAllByRole("option");

  // ...then the stale, slower "sp" response arrives late and must be ignored.
  deferred.sp.resolve([fixture({ name: "Spain", state: undefined, country: "ES" })]);
  await new Promise((resolve) => setTimeout(resolve, 100));

  expect(queryByText(/Springfield/)).toBeInTheDocument();
  expect(queryByText(/Spain/)).not.toBeInTheDocument();
});
