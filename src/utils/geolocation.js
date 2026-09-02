// Thin, testable wrapper around the browser's callback-based
// navigator.geolocation.getCurrentPosition, plus a pure error-message
// mapper. No new dependency — this is a standard Web API.

const DEFAULT_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 60000,
};

function getCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GEOLOCATION_UNSUPPORTED"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { ...DEFAULT_OPTIONS, ...options });
  });
}

// error is either our own Error("GEOLOCATION_UNSUPPORTED") above, or a real
// GeolocationPositionError (code: 1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE,
// 3 TIMEOUT) from the browser API.
function describeGeolocationError(error) {
  if (error && error.message === "GEOLOCATION_UNSUPPORTED") {
    return "Your browser doesn't support location lookup.";
  }
  switch (error && error.code) {
    case 1:
      return "Location permission was denied. Enable it in your browser's site settings to use this.";
    case 2:
      return "Your location couldn't be determined right now. Please try again.";
    case 3:
      return "Getting your location took too long. Please try again.";
    default:
      return "Something went wrong getting your location.";
  }
}

export { getCurrentPosition, describeGeolocationError };
