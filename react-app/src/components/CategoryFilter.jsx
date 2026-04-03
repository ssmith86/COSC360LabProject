import { EVENT_CATEGORIES } from "../constants/eventCategories";
import "./css files/CategoryFilter.css";

// the below CategoryFilter component is used in MyEventsPage
export function CategoryFilter({ selectedCategories, onCategoryChange }) {
  return (
    <div className="category-filter-bar">
      <button
        className={selectedCategories.length === 0 ? "active" : ""}
        onClick={() => onCategoryChange([])}
      >
        All
      </button>
      {EVENT_CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={selectedCategories.includes(cat) ? "active" : ""}
          onClick={() => {
            onCategoryChange(
              selectedCategories.includes(cat)
                ? selectedCategories.filter((c) => c !== cat)
                : [...selectedCategories, cat],
            );
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
