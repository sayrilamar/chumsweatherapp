// qi-trace: work-item="TODO(qi-trace): unresolved" acceptance-criteria="AC-2,AC-3,AC-5"
// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import SavedCities from "./component";

const AUSTELL = { name: "Austell", country: "US", lat: 33.8126, lon: -84.6344 };
const MIAMI = { name: "Miami", country: "US", lat: 25.7617, lon: -80.1918 };

test("shows an empty-state invite when there are no saved cities", () => {
  const { getByText } = render(
    <SavedCities cities={[]} weatherByCity={{}} onSelect={() => {}} onRemove={() => {}} />
  );
  expect(getByText(/save a city/i)).toBeInTheDocument();
});

test("lists each saved city's name and country", () => {
  const { getByText } = render(
    <SavedCities cities={[AUSTELL, MIAMI]} weatherByCity={{}} onSelect={() => {}} onRemove={() => {}} />
  );
  expect(getByText("Austell, US")).toBeInTheDocument();
  expect(getByText("Miami, US")).toBeInTheDocument();
});

test("shows the at-a-glance temperature and condition once it's known", () => {
  const { getByText } = render(
    <SavedCities
      cities={[AUSTELL]}
      weatherByCity={{ "33.81,-84.63": { temp: 75, condition: "Clear" } }}
      onSelect={() => {}}
      onRemove={() => {}}
    />
  );
  expect(getByText("75° Clear")).toBeInTheDocument();
});

test("shows a loading placeholder for a city whose at-a-glance weather hasn't resolved yet", () => {
  const { getByText } = render(
    <SavedCities cities={[AUSTELL]} weatherByCity={{}} onSelect={() => {}} onRemove={() => {}} />
  );
  expect(getByText("…")).toBeInTheDocument();
});

test("tapping a saved city calls onSelect with that city (its stored coordinates, not a re-lookup)", () => {
  const onSelect = jest.fn();
  const { getByText } = render(
    <SavedCities cities={[AUSTELL]} weatherByCity={{}} onSelect={onSelect} onRemove={() => {}} />
  );
  fireEvent.click(getByText("Austell, US"));
  expect(onSelect).toHaveBeenCalledWith(AUSTELL);
});

test("tapping remove calls onRemove with that city and does not also trigger onSelect", () => {
  const onSelect = jest.fn();
  const onRemove = jest.fn();
  const { getByLabelText } = render(
    <SavedCities cities={[AUSTELL]} weatherByCity={{}} onSelect={onSelect} onRemove={onRemove} />
  );
  fireEvent.click(getByLabelText("Remove Austell from the saved-cities list"));
  expect(onRemove).toHaveBeenCalledWith(AUSTELL);
  expect(onSelect).not.toHaveBeenCalled();
});
