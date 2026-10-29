// qi-trace: work-item="TODO(qi-trace): unresolved" acceptance-criteria="AC-1,AC-4,AC-6"
// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium

import { getSavedCities, saveCity, removeSavedCity, isCitySaved, cityKey } from "./savedCities";

const AUSTELL = { name: "Austell", country: "US", lat: 33.8126, lon: -84.6344 };
const MIAMI = { name: "Miami", country: "US", lat: 25.7617, lon: -80.1918 };

beforeEach(() => {
  window.localStorage.clear();
});

test("returns an empty list when nothing has been saved yet", () => {
  expect(getSavedCities()).toEqual([]);
});

test("saves a city and persists it for a later read (simulating a separate page load)", () => {
  const { cities, persisted } = saveCity(AUSTELL);
  expect(persisted).toBe(true);
  expect(cities).toEqual([AUSTELL]);
  expect(getSavedCities()).toEqual([AUSTELL]);
});

test("saving the same city twice does not create a duplicate entry", () => {
  saveCity(AUSTELL);
  const { cities } = saveCity(AUSTELL);
  expect(cities).toEqual([AUSTELL]);
});

test("saves multiple distinct cities", () => {
  saveCity(AUSTELL);
  const { cities } = saveCity(MIAMI);
  expect(cities).toEqual([AUSTELL, MIAMI]);
});

test("removeSavedCity removes a previously saved city by coordinates", () => {
  saveCity(AUSTELL);
  saveCity(MIAMI);
  const { cities, persisted } = removeSavedCity(AUSTELL.lat, AUSTELL.lon);
  expect(persisted).toBe(true);
  expect(cities).toEqual([MIAMI]);
  expect(getSavedCities()).toEqual([MIAMI]);
});

test("removeSavedCity is a no-op (still reports persisted) when the city isn't saved", () => {
  saveCity(AUSTELL);
  const { cities, persisted } = removeSavedCity(MIAMI.lat, MIAMI.lon);
  expect(persisted).toBe(true);
  expect(cities).toEqual([AUSTELL]);
});

test("isCitySaved reports true only for a saved city's coordinates", () => {
  saveCity(AUSTELL);
  expect(isCitySaved([AUSTELL], AUSTELL.lat, AUSTELL.lon)).toBe(true);
  expect(isCitySaved([AUSTELL], MIAMI.lat, MIAMI.lon)).toBe(false);
});

test("isCitySaved returns false (not a throw) for missing/invalid coordinates", () => {
  expect(isCitySaved([AUSTELL], undefined, undefined)).toBe(false);
  expect(isCitySaved([AUSTELL], null, null)).toBe(false);
});

test("cityKey rounds coordinates so near-identical requests match the same saved city", () => {
  expect(cityKey(33.81256, -84.63441)).toBe(cityKey(33.8124, -84.6343));
  expect(isCitySaved([AUSTELL], 33.81256, -84.63441)).toBe(true);
});

test("does not save a city with missing coordinates, and reports it was not persisted", () => {
  const { cities, persisted } = saveCity({ name: "Nowhere", country: "US" });
  expect(persisted).toBe(false);
  expect(cities).toEqual([]);
});

test("treats a corrupted (non-array) localStorage value as an empty list, not a throw", () => {
  window.localStorage.setItem("chum-weather:saved-cities", JSON.stringify({ not: "an array" }));
  expect(() => getSavedCities()).not.toThrow();
  expect(getSavedCities()).toEqual([]);
});

test("saveCity does not throw and reports persisted:false when localStorage.setItem fails (quota/unavailable)", () => {
  const setItemSpy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("QuotaExceededError");
  });

  const { cities, persisted } = saveCity(AUSTELL);
  expect(persisted).toBe(false);
  // The in-memory list stays empty — never pretend a city was saved when it
  // wasn't actually persisted.
  expect(cities).toEqual([]);

  setItemSpy.mockRestore();
  expect(getSavedCities()).toEqual([]);
});

test("removeSavedCity does not throw and reports persisted:false when localStorage.setItem fails", () => {
  saveCity(AUSTELL);
  const setItemSpy = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("QuotaExceededError");
  });

  const { cities, persisted } = removeSavedCity(AUSTELL.lat, AUSTELL.lon);
  expect(persisted).toBe(false);
  // Still reports Austell as saved, since the removal never actually took.
  expect(cities).toEqual([AUSTELL]);

  setItemSpy.mockRestore();
});

test("does not throw and behaves as if there's nothing saved when localStorage access itself throws", () => {
  const original = window.localStorage;
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new Error("SecurityError: storage disabled");
    },
  });

  expect(() => getSavedCities()).not.toThrow();
  expect(getSavedCities()).toEqual([]);
  expect(() => saveCity(AUSTELL)).not.toThrow();
  expect(saveCity(AUSTELL).persisted).toBe(false);

  Object.defineProperty(window, "localStorage", { configurable: true, value: original });
});
