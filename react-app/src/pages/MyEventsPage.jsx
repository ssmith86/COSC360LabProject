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

  // TODO in the future: our sample data are mainly on default user Sam Smith, id 123456
  // we'll have to replace this with actual logged in user information in the future
  const currentUser = { name: "Sam Smith", id: 123456 };

  // implement date and location helper functions for display
  const formatDate = (dateStr) => {
    // if no date information, display TBD gracefully (though all events should have dates)
    if (!dateStr) return "TBD";
    const date = new Date(dateStr);
    return date.toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (location) => {
    // if no location, display TBD gracefully (though all events should have location)
    if (!location) return "Location TBD";
    return `${location.address} ${location.street}, ${location.city}, ${location.province}`;
  };

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
