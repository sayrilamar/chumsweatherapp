// qi-trace: work-item="TODO(qi-trace): unresolved" acceptance-criteria="AC-2,AC-3,AC-5" risk-tier="low" test-coverage="src/components/SavedCities/component.test.js"
// No real work-item ID exists for this story (GitHub Issues are disabled on
// the tracker repo) — flagged per qi-traceability.instructions.md rather
// than fabricated.
//
// Presentational only — like CitySearch and WeatherCard, this component
// doesn't fetch anything itself. App.js owns the saved-cities list, the
// per-city "at a glance" weather lookups, and the click-to-switch /
// remove handlers; this just renders what it's given.

import React from "react";
import styled from "@emotion/styled";
import { formatCityLabel } from "../CitySearch/component.js";
import { cityKey } from "../../utils/savedCities";

const Wrapper = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 16px auto 0;

  @media (min-width: 720px) {
    max-width: 720px;
  }
`;

const EmptyState = styled.p`
  margin: 0;
  padding: 10px 4px;
  font-family: "Fira Sans", sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  padding: 6px 6px 6px 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
`;

const ItemButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: "Fira Sans", sans-serif;
  color: #1a1a2e;
  padding: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
`;

const ItemName = styled.span`
  font-weight: 600;
  font-size: 0.95rem;
`;

const ItemGlance = styled.span`
  font-size: 0.8rem;
  color: #6b6b80;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #8a8aa3;
  font-size: 0.95rem;
  padding: 6px 8px;
  border-radius: 8px;

  &:hover {
    color: #d64545;
    background: rgba(214, 69, 69, 0.1);
  }
`;

// weatherByCity: map of cityKey(lat, lon) -> { temp, condition } | undefined.
// A missing entry (still loading, or that city's fetch failed) shows "…"
// rather than blocking the rest of the list.
function SavedCities({ cities, weatherByCity, onSelect, onRemove }) {
  if (cities.length === 0) {
    return (
      <Wrapper>
        <EmptyState>Save a city — tap the ☆ next to any city's weather — to see it here.</EmptyState>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <List aria-label="Saved cities">
        {cities.map((city) => {
          const key = cityKey(city.lat, city.lon);
          const glance = weatherByCity[key];
          return (
            <Item key={key}>
              <ItemButton type="button" onClick={() => onSelect(city)}>
                <ItemName>{formatCityLabel(city)}</ItemName>
                <ItemGlance>{glance ? `${glance.temp}° ${glance.condition}` : "…"}</ItemGlance>
              </ItemButton>
              <RemoveButton
                type="button"
                aria-label={`Remove ${city.name} from the saved-cities list`}
                onClick={() => onRemove(city)}
              >
                ✕
              </RemoveButton>
            </Item>
          );
        })}
      </List>
    </Wrapper>
  );
}

export default SavedCities;
