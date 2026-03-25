import NavigationBar from "../components/NavigationBar";
import { SearchBar } from "../components/SearchBar";
import SideBar from "../components/SideBar";
import { useState, useEffect } from "react";
import EventGrid from "../components/EventGrid";
import "./MyEventsPage.css";

export const MyEventsPage = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // TODO in the future: our sample data are mainly on default user Sam Smith, id 123456
  // we'll have to replace this with actual logged in user information in the future
  const currentUser = { name: "Sam Smith", id: 123456 };

  // useEffect to fetch three different types of events from cosc360db events collection
  useEffect(() => {
    fetch("http://localhost:3001/api/events/upcoming")
      .then((res) => res.json())
      .then((data) => setUpcomingEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching upcoming events:", err));
  }, []);

  useEffect(() => {
    fetch(
      `http://localhost:3001/api/events/myevents?ownerName=${currentUser.name}`,
    )
      .then((res) => res.json())
      .then((data) => setMyEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching my events:", err));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3001/api/savedevents?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => setSavedEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching saved events:", err));
  }, []);

  return (
    <div className="page-wrapper">
      <NavigationBar />

      <div className="page-body">
        {/* Display SideBar here */}
        <aside className="sidebar-area">
          <SideBar />
        </aside>

        <div className="main-content">
          <div className="search-bar-area">
            <SearchBar
              setSearchResults={setSearchResults}
              setHasSearched={setHasSearched}
            />
          </div>

          {/* Display search result if the user has searched events */}
          {hasSearched && (
            <section className="events-section">
              <h2 className="section-title">Search Results</h2>
              <div className="events-scroll-container">
                <EventGrid events={searchResults} currentUser={currentUser} />
              </div>
            </section>
          )}

          {/* Display the section - Upcoming Events */}
          <section className="events-section">
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Events happening in the next 7 days
            </p>
            <div className="events-scroll-container">
              {/* Display and render upcoming event via a function renderEventsGrid */}
              <EventGrid events={upcomingEvents} currentUser={currentUser} />
            </div>
          </section>

          {/* Display the section - My Events */}
          <section className="events-section">
            <h2 className="section-title">My Events</h2>
            <p className="section-subtitle">Events you have created</p>
            <div className="events-scroll-container">
              {/* Display and render my event via a function renderEventsGrid */}
              <EventGrid events={myEvents} currentUser={currentUser} />
            </div>
          </section>

          {/*Display the section - My Saved Events */}
          <section className="events-section">
            <h2 className="section-title">My Saved Events</h2>
            <p className="section-subtitle">Events you have saved</p>
            <div className="events-scroll-container">
              {/* Display and render my saved event via a function renderEventsGrid */}
              <EventGrid events={savedEvents} currentUser={currentUser} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
