// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: medium
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import { getCurrentPosition, describeGeolocationError } from "./geolocation";

afterEach(() => {
  delete global.navigator.geolocation;
});

test("resolves with the position when the browser grants it", async () => {
  const fakePosition = { coords: { latitude: 33.8, longitude: -84.6 } };
  global.navigator.geolocation = {
    getCurrentPosition: (success) => success(fakePosition),
  };

  await expect(getCurrentPosition()).resolves.toBe(fakePosition);
});

test("rejects with the browser's error when permission is denied", async () => {
  const permissionDenied = { code: 1, message: "User denied Geolocation" };
  global.navigator.geolocation = {
    getCurrentPosition: (success, error) => error(permissionDenied),
  };

  await expect(getCurrentPosition()).rejects.toBe(permissionDenied);
});

test("rejects with a specific error when the browser has no geolocation API at all", async () => {
  delete global.navigator.geolocation;
  await expect(getCurrentPosition()).rejects.toThrow("GEOLOCATION_UNSUPPORTED");
});

test("passes default options merged with any overrides through to the browser API", async () => {
  const getCurrentPositionSpy = jest.fn((success) => success({ coords: {} }));
  global.navigator.geolocation = { getCurrentPosition: getCurrentPositionSpy };

  await getCurrentPosition({ timeout: 5000 });

  const passedOptions = getCurrentPositionSpy.mock.calls[0][2];
  expect(passedOptions).toMatchObject({ enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 });
});

describe("describeGeolocationError", () => {
  test("describes an unsupported browser", () => {
    expect(describeGeolocationError(new Error("GEOLOCATION_UNSUPPORTED"))).toMatch(/doesn't support/i);
  });

  test("describes permission denied (code 1)", () => {
    expect(describeGeolocationError({ code: 1 })).toMatch(/permission was denied/i);
  });

  test("describes position unavailable (code 2)", () => {
    expect(describeGeolocationError({ code: 2 })).toMatch(/couldn't be determined/i);
  });

  test("describes a timeout (code 3)", () => {
    expect(describeGeolocationError({ code: 3 })).toMatch(/took too long/i);
  });

  test("falls back to a generic message for an unrecognized error", () => {
    expect(describeGeolocationError({ code: 999 })).toMatch(/went wrong/i);
    expect(describeGeolocationError(undefined)).toMatch(/went wrong/i);
  });
});
