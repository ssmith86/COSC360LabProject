import { useState, useEffect } from "react";
import { NavigationBar } from "../components/NavigationBar";
import { SearchBar } from "../components/SearchBar";
import { EventGrid } from "../components/EventGrid";
import { CategoryFilter } from "../components/CategoryFilter";
import "./MyEventsPage.css";

export const HomePage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);

  useEffect(() => {
    const fetchEvents = () => {
      fetch("/api/events/upcoming")
        .then((res) => res.json())
        .then((data) => setUpcomingEvents(Array.isArray(data) ? data : []))
        .catch(() => {});
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const filterByCategory = (events) => {
    if (selectedCategories.length === 0) return events;
    return events.filter((e) => selectedCategories.includes(e.category));
  };

  return (
    <div className="page-wrapper">
      <NavigationBar />
      <div className="page-body">
        <div className="main-content">
          <div className="search-bar-area">
            <SearchBar
              setSearchResults={setSearchResults}
              setHasSearched={setHasSearched}
            />
          </div>

          <CategoryFilter
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />

          {hasSearched && (
            <section className="events-section">
              <h2 className="section-title">Search Results</h2>
              <div className="events-scroll-container">
                <EventGrid events={searchResults} />
              </div>
            </section>
          )}

          <section className="events-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">Upcoming Events</h2>
                <p className="section-subtitle">Browse all upcoming events</p>
              </div>
              <button
                className="collapse-btn"
                onClick={() => setUpcomingExpanded(!upcomingExpanded)}
              >
                {upcomingExpanded ? "▲" : "▼"}
              </button>
            </div>
            {upcomingExpanded && (
              <div className="events-scroll-container">
                <EventGrid events={filterByCategory(upcomingEvents)} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
