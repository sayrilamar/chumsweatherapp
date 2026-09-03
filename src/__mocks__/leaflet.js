// Manual mock for the `leaflet` package, used automatically by every test in
// this project (Jest resolves node_modules mocks from src/__mocks__ here,
// since react-scripts' jest config sets `roots` to src/). Real Leaflet
// manipulates the DOM in ways jsdom doesn't fully support (layout,
// getBoundingClientRect, tile image loading) and would also make genuine
// network requests for map tiles — both wrong for a unit test (qi-test-
// design: "Do not generate tests that touch production endpoints"). This
// mock just records how WeatherMap.js calls the API so tests can assert on
// wiring (which layer URL, which coordinates) without running real Leaflet.

function makeLayer() {
  const layer = {};
  layer.addTo = jest.fn(() => layer);
  layer.remove = jest.fn();
  layer.setOpacity = jest.fn();
  return layer;
}

function makeMap() {
  const map = {};
  map.setView = jest.fn(() => map);
  map.remove = jest.fn();
  map.removeLayer = jest.fn();
  map.addLayer = jest.fn();
  return map;
}

const map = jest.fn(() => makeMap());

const tileLayer = jest.fn((url, options) => {
  const layer = makeLayer();
  layer.__url = url;
  layer.__options = options;
  return layer;
});

const circleMarker = jest.fn((coords, options) => {
  const layer = makeLayer();
  layer.__coords = coords;
  layer.__options = options;
  return layer;
});

module.exports = { map, tileLayer, circleMarker };
