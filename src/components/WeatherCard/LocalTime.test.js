// qi-layer: protection-strength
// qi-generated-by: assert-iq
// qi-review-required: true
// qi-risk-tier: low
// (qi-trace work-item omitted: tracker.type = "none" in .assert-iq/config.yaml)

import React from "react";
import { render, act } from "@testing-library/react";
import LocalTime from "./LocalTime";

const NOON_UTC = Date.UTC(2026, 0, 15, 12, 0, 0);

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test("renders nothing when no timezone offset is available yet", () => {
  const { container } = render(<LocalTime timezoneOffsetSeconds={null} />);
  expect(container.firstChild).toBeNull();
});

test("renders the local time and UTC offset label", () => {
  jest.spyOn(Date, "now").mockReturnValue(NOON_UTC);
  const { getByText } = render(<LocalTime timezoneOffsetSeconds={-14400} />);

  expect(getByText(/8:00 AM/)).toBeInTheDocument();
  expect(getByText(/UTC-04:00 local time/)).toBeInTheDocument();
});

test("ticks forward once a second while mounted", () => {
  jest.spyOn(Date, "now").mockReturnValue(NOON_UTC);
  const { getByText } = render(<LocalTime timezoneOffsetSeconds={0} />);
  expect(getByText(/12:00 PM/)).toBeInTheDocument();

  Date.now.mockReturnValue(NOON_UTC + 61 * 1000); // one minute one second later
  act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(getByText(/12:01 PM/)).toBeInTheDocument();
});
