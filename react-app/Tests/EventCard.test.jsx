// run test `cd react-app` and run `npm test`
// test Event Card frontend functionality

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import EventCard from "../src/components/EventCard";

// simulate useNavigate since EventCard uses react-router-dom
// create a trackable fake function simulateNavigate
// so under testing where no router is provided, we replace
// real router with the fake function so testing renders without
// errors
const simulateNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  // when useNavigate is called, return the fake simulateNavigate
  useNavigate: () => simulateNavigate,
}));

const defaultProps = {
  eventId: "123456",
  image: "test.jpg",
  title: "Summer Music Festival",
  startDateTime: "Jun 20, 2025 18:00",
  endDateTime: "Jun 20, 2025 22:00",
  location: "Kelowna, BC",
  category: "Music",
  status: "",
  isSaved: false,
  isOwner: false,
  isAdmin: false,
  isLoggedIn: false,
  onSave: vi.fn(), // vi.fn() gets a fake function
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe("EventCard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("redirects to /register when a logged-out user clicks save", () => {
    render(<EventCard {...defaultProps} isLoggedIn={false} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]); // save heart button/icon is the 2nd button
    expect(simulateNavigate).toHaveBeenCalledWith("/register");
  });

  test("calls onSave when a logged-in user clicks save", () => {
    const simulateOnSave = vi.fn();
    render(
      <EventCard {...defaultProps} isLoggedIn={true} onSave={simulateOnSave} />,
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(simulateOnSave).toHaveBeenCalled();
  });
});
