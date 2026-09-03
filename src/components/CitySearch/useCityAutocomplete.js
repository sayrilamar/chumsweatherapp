import { useEffect, useRef, useState } from "react";
import { looksLikeZipCode } from "../../utils/zipCode";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;
const RESULT_LIMIT = 8;

// Reads process.env at call time (not module load time) so tests can swap
// it via jest's environment without needing a full module reload.
function geocodeUrl(query) {
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  return `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
    query
  )}&limit=${RESULT_LIMIT}&appid=${key}`;
}

// A different endpoint (by-ZIP, not by-name) than geocodeUrl above — always
// returns at most one exact match rather than a list of candidates.
function zipGeocodeUrl(query) {
  const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
  return `https://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(query)}&appid=${key}`;
}

// Debounced, race-condition-safe city autocomplete against OpenWeatherMap's
// Geocoding API (same API key as the weather endpoint — no new service).
// Suggestions only fetch once `query` reaches MIN_QUERY_LENGTH characters.
function useCityAutocomplete(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const latestQueryRef = useRef("");

  useEffect(() => {
    const trimmed = query.trim();
    latestQueryRef.current = trimmed;

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    const isZip = looksLikeZipCode(trimmed);

    const timer = setTimeout(() => {
      fetch(isZip ? zipGeocodeUrl(trimmed) : geocodeUrl(trimmed))
        .then((res) => res.json())
        .then((results) => {
          // Ignore stale responses: only apply results if this is still
          // the most recent query the user has typed.
          if (latestQueryRef.current !== trimmed) return;
          if (isZip) {
            // /geo/1.0/zip returns one object (or an error shape with no
            // lat/lon, e.g. {cod:"404",...}), never an array — normalize it
            // into the same single-suggestion shape the dropdown expects.
            const valid = results && typeof results.lat === "number" && typeof results.lon === "number";
            setSuggestions(
              valid
                ? [{ name: results.name, country: results.country, zip: results.zip, lat: results.lat, lon: results.lon }]
                : []
            );
          } else {
            setSuggestions(Array.isArray(results) ? results : []);
          }
          setLoading(false);
        })
        .catch((e) => {
          if (latestQueryRef.current !== trimmed) return;
          setSuggestions([]);
          setLoading(false);
          setError(e);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, loading, error };
}

export default useCityAutocomplete;
export { MIN_QUERY_LENGTH, DEBOUNCE_MS };
