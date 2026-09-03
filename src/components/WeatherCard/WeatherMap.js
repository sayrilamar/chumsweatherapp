import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// OpenWeatherMap's free-tier map tile layers (confirmed live: each returns a
// real PNG tile) — overlaid on a plain OpenStreetMap base map via Leaflet, a
// library with no React-version dependency of its own (it just manipulates
// the DOM directly), unlike react-leaflet which would pin a specific React
// major version.
const LAYERS = [
  { key: "precipitation_new", label: "Precipitation" },
  { key: "clouds_new", label: "Clouds" },
  { key: "wind_new", label: "Wind" },
  { key: "temp_new", label: "Temp" },
  { key: "pressure_new", label: "Pressure" },
];

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | ' +
  'Weather &copy; <a href="https://openweathermap.org/copyright">OpenWeatherMap</a>';

const ZOOM = 7;

const Wrapper = styled.div`
  width: 100%;
`;

const Heading = styled.p`
  width: 100%;
  font-family: "Fira Sans", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #8a8aa3;
  margin: 0 0 6px;
  text-align: left;
`;

const LayerButtons = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const LayerButton = styled.button`
  font-family: "Fira Sans", sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 6px 12px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: ${(props) => (props.active ? "#4a4a68" : "rgba(74, 74, 104, 0.1)")};
  color: ${(props) => (props.active ? "#ffffff" : "#4a4a68")};
`;

const MapContainer = styled.div`
  width: 100%;
  height: 220px;
  border-radius: 14px;
  overflow: hidden;
`;

// Renders a small interactive map centered on the searched city, with a
// toggle between OpenWeatherMap's precipitation/clouds/wind/temp/pressure
// tile overlays — a live regional view rather than just point-in-time
// numbers. Nothing renders until a location has actually loaded (lat/lon
// known), same as WeatherDetails/AirQuality below it.
function WeatherMap({ lat, lon, city }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const overlayRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState(LAYERS[0].key);
  // Tracks whether the map instance exists yet, purely to give the overlay
  // effect below a dependency that actually changes at the moment the map
  // first becomes available — `activeLayer` alone wouldn't, since it's
  // already at its default value by the time lat/lon (and so the map) first
  // appear, and effects only re-run when a dependency's value changes.
  const [mapReady, setMapReady] = useState(false);

  // A callback ref (not a plain ref + mount-only effect) because
  // MapContainer only enters the DOM once lat/lon are known (see the early
  // `return null` below) — on first mount that's usually not yet true
  // (App.js's initial state has no location loaded), so a `useEffect(...,
  // [])` here would fire once while the container is still absent and never
  // fire again once it actually appears. A callback ref instead runs
  // exactly when the node itself is attached or detached, however many
  // renders that takes.
  const setContainerRef = useCallback((node) => {
    if (node) {
      if (!mapRef.current) {
        const map = L.map(node, { attributionControl: true }).setView([0, 0], ZOOM);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: ATTRIBUTION,
          maxZoom: 18,
        }).addTo(map);
        mapRef.current = map;
        setMapReady(true);
      }
    } else if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      setMapReady(false);
    }
  }, []);

  // Recenters and moves the "you are here" marker whenever the searched
  // location changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || typeof lat !== "number" || typeof lon !== "number") return;

    map.setView([lat, lon], ZOOM);
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.circleMarker([lat, lon], {
      radius: 7,
      weight: 2,
      color: "#1a1a2e",
      fillColor: "#4facfe",
      fillOpacity: 1,
    }).addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon]);

  // Swaps the weather tile overlay whenever the user picks a different
  // layer (or on mount, to add the default one).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (overlayRef.current) overlayRef.current.remove();

    const key = process.env.REACT_APP_OPENWEATHER_API_KEY;
    overlayRef.current = L.tileLayer(
      `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${key}`,
      { opacity: 0.6 }
    ).addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLayer, mapReady]);

  if (typeof lat !== "number" || typeof lon !== "number") return null;

  return (
    <Wrapper>
      <Heading>Weather Map{city ? ` — ${city}` : ""}</Heading>
      <LayerButtons>
        {LAYERS.map((layer) => (
          <LayerButton
            key={layer.key}
            type="button"
            active={layer.key === activeLayer}
            onClick={() => setActiveLayer(layer.key)}
          >
            {layer.label}
          </LayerButton>
        ))}
      </LayerButtons>
      <MapContainer ref={setContainerRef} data-testid="weather-map-container" />
    </Wrapper>
  );
}

export default WeatherMap;
export { LAYERS };
