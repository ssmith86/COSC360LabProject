// run test: `cd react-app`, then `npm test`
// Test CategoryFilter functionality
// Make sure all buttons are visible

import { describe, test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CategoryFilter } from "../src/components/CategoryFilter";

describe("CategoryFilter Component", () => {
  afterEach(() => {
    cleanup();
  });

  test("renders the All button", () => {
    render(
      <CategoryFilter selectedCategories={[]} onCategoryChange={() => {}} />,
    );
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  test("renders all category buttons", () => {
    render(
      <CategoryFilter selectedCategories={[]} onCategoryChange={() => {}} />,
    );
    expect(screen.getByText("Sports")).toBeInTheDocument();
    expect(screen.getByText("Music")).toBeInTheDocument();
    expect(screen.getByText("Festivals")).toBeInTheDocument();
    expect(screen.getByText("Nightlife")).toBeInTheDocument();
    expect(screen.getByText("Workshops")).toBeInTheDocument();
    expect(screen.getByText("Conferences")).toBeInTheDocument();
    expect(screen.getByText("Food & Drink")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });
});
