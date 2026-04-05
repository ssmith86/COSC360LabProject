// to test: `cd react-app` and then `npm test`
// Test: core functionality, logic-heavy code, and edge case in
// EventCreationForm

import { describe, test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import EventCreationForm from "../src/components/EventCreationForm";

// create a fake function called simulateNavigate to prevent router crash
const simulateNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => simulateNavigate,
}));

describe("EventCreationForm Component", () => {
  // clean up after each test to prevent corruption
  afterEach(() => {
    cleanup();
  });

  test("render the event creation form fields", () => {
    render(<EventCreationForm />);
    expect(
      screen.getByPlaceholderText("e.g. An Awesome Event"),
    ).toBeInTheDocument();
    expect(screen.getByText("Create Event")).toBeInTheDocument();
  });

  test("show error if event title is less than 3 characters", () => {
    // simulate a logged in registered user
    localStorage.setItem("userId", "testuser123");
    render(<EventCreationForm />);
    fireEvent.change(screen.getByPlaceholderText("e.g. An Awesome Event"), {
      target: { name: "name", value: "Hi" },
    });
    fireEvent.click(screen.getByText("Create Event"));
    expect(
      screen.getByText("Event title must be at least 3 characters."),
    ).toBeInTheDocument();
  });

  test("show error if user is not logged in", () => {
    localStorage.clear();
    render(<EventCreationForm />);
    fireEvent.click(screen.getByText("Create Event"));
    expect(
      screen.getByText("You must be logged in to create an event."),
    ).toBeInTheDocument();
  });
});
