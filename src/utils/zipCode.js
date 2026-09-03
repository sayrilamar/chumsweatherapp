// Detects a postal/ZIP-code-shaped query (e.g. "30106" or "30106,US") so the
// city autocomplete and search flows can route it to OpenWeatherMap's
// Geocoding-by-ZIP endpoint instead of the by-name endpoint, which silently
// matches an unrelated place for a bare numeric string rather than erroring
// (confirmed directly against the API: "30106" resolved to a town in Costa
// Rica, not the Georgia ZIP code it looks like).
const ZIP_PATTERN = /^\d{3,10}(?:\s*,\s*[a-zA-Z]{2})?$/;

function looksLikeZipCode(query) {
  return typeof query === "string" && ZIP_PATTERN.test(query.trim());
}

export { looksLikeZipCode };
