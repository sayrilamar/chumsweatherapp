// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)
//
// Leaflet is mocked (src/__mocks__/leaflet.js) — real Leaflet manipulates
// the DOM in ways jsdom doesn't support and would load real map tiles over
// the network, which qi-test-design forbids ("Do not generate tests that
// touch production endpoints"). These tests assert on how WeatherMap.js
// calls the (mocked) Leaflet API, not on real map rendering.

import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import L from "leaflet";
import WeatherMap from "./WeatherMap";

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(cleanup);

test("renders nothing, and never touches Leaflet, when lat/lon aren't known yet", () => {
  const { container } = render(<WeatherMap lat={null} lon={null} />);
  expect(container.firstChild).toBeNull();
  expect(L.map).not.toHaveBeenCalled();
});

test("initializes a map centered on the given coordinates with a base tile layer and a marker", () => {
  render(<WeatherMap lat={33.8126} lon={-84.6344} city="Austell" />);

  expect(L.map).toHaveBeenCalledTimes(1);
  const mapInstance = L.map.mock.results[0].value;
  expect(mapInstance.setView).toHaveBeenCalledWith([33.8126, -84.6344], 7);

  // The base OpenStreetMap layer.
  expect(L.tileLayer).toHaveBeenCalledWith(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    expect.objectContaining({ attribution: expect.stringContaining("OpenStreetMap") })
  );

  expect(L.circleMarker).toHaveBeenCalledWith([33.8126, -84.6344], expect.any(Object));
});

test("adds the Precipitation overlay by default", () => {
  render(<WeatherMap lat={33.8126} lon={-84.6344} />);

  const overlayCall = L.tileLayer.mock.calls.find(([url]) => url.includes("tile.openweathermap.org"));
  expect(overlayCall[0]).toContain("/map/precipitation_new/");
});

test("switches the overlay layer when a different button is clicked, removing the old one", () => {
  const { getByText } = render(<WeatherMap lat={33.8126} lon={-84.6344} />);

  const firstOverlay = L.tileLayer.mock.results.find(({ value }) =>
    value.__url.includes("tile.openweathermap.org")
  ).value;

  fireEvent.click(getByText("Clouds"));

  expect(firstOverlay.remove).toHaveBeenCalledTimes(1);
  const overlayUrls = L.tileLayer.mock.calls
    .map(([url]) => url)
    .filter((url) => url.includes("tile.openweathermap.org"));
  expect(overlayUrls[overlayUrls.length - 1]).toContain("/map/clouds_new/");
});

test("recenters the map and replaces the marker when the searched location changes", () => {
  const { rerender } = render(<WeatherMap lat={33.8126} lon={-84.6344} />);
  const mapInstance = L.map.mock.results[0].value;
  const firstMarker = L.circleMarker.mock.results[0].value;

  rerender(<WeatherMap lat={40.7128} lon={-74.006} />);

  expect(mapInstance.setView).toHaveBeenCalledWith([40.7128, -74.006], 7);
  expect(firstMarker.remove).toHaveBeenCalledTimes(1);
  expect(L.circleMarker).toHaveBeenCalledWith([40.7128, -74.006], expect.any(Object));
});

test("removes the map on unmount", () => {
  const { unmount } = render(<WeatherMap lat={33.8126} lon={-84.6344} />);
  const mapInstance = L.map.mock.results[0].value;

  unmount();

  expect(mapInstance.remove).toHaveBeenCalledTimes(1);
});
