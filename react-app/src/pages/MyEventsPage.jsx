import NavigationBar from "../components/NavigationBar";
import SearchBar from "../components/SearchBar";
import { SearchBar } from "../components/SearchBar";
import SideBar from "../components/SideBar";
import { useState, useEffect } from "react";
import EventCard from "../components/EventCard";

export default function MyEventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  return (
    <div className="page-wrapper">
      <NavigationBar.jsx />

      <div className="page-body">
        {/* Display SideBar here */}
        <aside className="sidebar-area">
          <SideBar />
        </aside>
      </div>

      <div className="main-content">
        <div className="search-bar-area">
          <SearchBar
            setSearchResults={setSearchResults}
            setHasSearched={setHasSearched}
          />

          {/* Display search result if the user has searched events */}

          {/* Display the section - Upcoming Events */}
          <section className="events-section">
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Events happening in the next 7 days
            </p>
            <div className="events-scroll-container">
              {/* Display and render upcoming event via a function renderEventsGrid */}
            </div>
          </section>

          {/* Display the section - My Events */}
          <section className="events-section">
            <h2 className="section-title">My Events</h2>
            <p className="section-subtitle">Events you have created</p>
            <div className="events-scroll-container">
              {/* Display and render my event via a function renderEventsGrid */}
            </div>
          </section>

          {/*Display the section - My Saved Events */}
          <section className="events-section">
            <h2 className="section-title">My Saved Events</h2>
            <p className="section-subtitle">Events you have saved</p>
            <div className="events-scroll-container">
              {/* Display and render my saved event via a function renderEventsGrid */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
