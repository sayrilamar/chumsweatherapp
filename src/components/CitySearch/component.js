import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import useCityAutocomplete from "./useCityAutocomplete";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 14px 18px;
  font-size: 1.1rem;
  font-family: "Fira Sans", sans-serif;
  font-weight: 500;
  color: #1a1a2e;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 14px;
  outline: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease, background 0.2s ease;

  &:focus {
    background: #ffffff;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
  }

  &::placeholder {
    color: #6b6b80;
  }
`;

const SuggestionList = styled.ul`
  list-style: none;
  margin: 8px 0 0;
  padding: 8px;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  max-height: 260px;
  overflow-y: auto;
  z-index: 20;
`;

const SuggestionItem = styled.li`
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-family: "Fira Sans", sans-serif;
  color: #1a1a2e;
  background: ${(props) => (props.highlighted ? "rgba(79, 172, 254, 0.18)" : "transparent")};

  &:hover {
    background: rgba(79, 172, 254, 0.18);
  }
`;

const SuggestionMeta = styled.span`
  color: #6b6b80;
  font-size: 0.85rem;
  margin-left: 6px;
`;

const HintText = styled.p`
  margin: 6px 2px 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.85);
  font-family: "Fira Sans", sans-serif;
`;

function formatCityLabel(city) {
  const parts = [city.name];
  if (city.state) parts.push(city.state);
  if (city.country) parts.push(city.country);
  return parts.join(", ");
}

// Controlled search input with a debounced city-autocomplete dropdown
// (OpenWeatherMap Geocoding API). Selecting a suggestion calls onSelectCity
// with the full geocode result (name/state/country/lat/lon) so the caller
// can fetch weather by precise coordinates rather than an ambiguous name
// string. Typing a value and pressing the separate Search button (rendered
// by the parent) still falls back to the existing name-based search.
function CitySearch({ query, onQueryChange, onSelectCity, placeholder }) {
  const { suggestions, loading } = useCityAutocomplete(query);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  // Selecting a suggestion updates `query` (to show the full city name in
  // the box), which re-triggers the autocomplete effect above and would
  // otherwise reopen the dropdown once that debounced fetch resolves. This
  // guard swallows exactly that one next suggestions update.
  const suppressReopenRef = useRef(false);

  useEffect(() => {
    if (suppressReopenRef.current) {
      suppressReopenRef.current = false;
      return;
    }
    setIsOpen(suggestions.length > 0);
    setHighlightedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectCity = (city) => {
    suppressReopenRef.current = true;
    setIsOpen(false);
    onSelectCity(city);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectCity(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <Wrapper ref={wrapperRef}>
      <Input
        className="input"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => setIsOpen(suggestions.length > 0)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <SuggestionList role="listbox">
          {suggestions.map((city, index) => (
            <SuggestionItem
              key={`${city.lat}-${city.lon}`}
              role="option"
              aria-selected={index === highlightedIndex}
              highlighted={index === highlightedIndex}
              // onMouseDown (not onClick) fires before the input's onBlur-ish
              // click-outside handler would otherwise close the dropdown first.
              onMouseDown={(e) => {
                e.preventDefault();
                selectCity(city);
              }}
            >
              {city.name}
              <SuggestionMeta>
                {[city.state, city.country].filter(Boolean).join(", ")}
              </SuggestionMeta>
            </SuggestionItem>
          ))}
        </SuggestionList>
      )}
      {query.trim().length === 1 && (
        <HintText>Keep typing — suggestions appear after 2 characters</HintText>
      )}
      {loading && query.trim().length >= 2 && <HintText>Searching cities…</HintText>}
    </Wrapper>
  );
}

export default CitySearch;
export { formatCityLabel };
