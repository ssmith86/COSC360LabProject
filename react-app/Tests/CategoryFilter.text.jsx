// run test: `cd react-app`, then `npm test`
// Test CategoryFilter functionality
// Make sure all buttons are visible

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CategoryFilter } from "../src/components/CategoryFilter";

describe("CategoryFilter Component", () => {
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
