import { NavigationBar } from "../components/NavigationBar";
import { SearchBar } from "../components/SearchBar";
import { SideBar } from "../components/SideBar";
import { useState, useEffect } from "react";
import { EventGrid } from "../components/EventGrid";
import { useNavigate } from "react-router-dom";
import "./MyEventsPage.css";
import { CategoryFilter } from "../components/CategoryFilter";

export const MyEventsPage = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // implement expansion and collapsion
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [myEventsExpanded, setMyEventsExpanded] = useState(false);
  const [savedExpanded, setSavedExpanded] = useState(false);

  // TODO in the future: our sample data are mainly on default user Sam Smith, id 123456
  // we'll have to replace this with actual logged in user information in the future
  // update with logic to fetch current user to replace hard code
  // const currentUser = { name: "Sam Smith", id: 123456 };
  const currentUserId = localStorage.getItem("userId");
  // keep using name "Sam Smith"
  // TODO: need to implement query by user Id to replace this hard code
  // const currentUser = { name: "Sam Smith", id: currentUserId };

  // create savedEventIds to pass to EventGrid
  const savedEventIds = savedEvents.map((event) => event._id?.toString());

  // useEffect(() => {
  //   fetch("http://localhost:3001/api/events/upcoming")
  //     .then((res) => res.json())
  //     .then((data) => setUpcomingEvents(Array.isArray(data) ? data : []))
  //     .catch((err) => console.error("Error fetching upcoming events:", err));
  // }, []);

  // useEffect(() => {
  //   fetch(
  //     `http://localhost:3001/api/events/myevents?ownerId=${currentUserId}`,
  //   )
  //     .then((res) => res.json())
  //     .then((data) => setMyEvents(Array.isArray(data) ? data : []))
  //     .catch((err) => console.error("Error fetching my events:", err));
  // }, []);

  // useEffect(() => {
  //   fetch(`http://localhost:3001/api/savedevents?userId=${currentUserId}`)
  //     .then((res) => res.json())
  //     .then((data) => setSavedEvents(Array.isArray(data) ? data : []))
  //     .catch((err) => console.error("Error fetching saved events:", err));
  // }, []);

  // Add polling to achieve asynchonous update in real time
  // so changes made by any user (e.g. admin deleting an event) reflect without a page refresh
  // combine fetches into one function, poll every 3 seconds
  const fetchAll = () => {
    fetch("http://localhost:3001/api/events/upcoming")
      .then((res) => res.json())
      .then((data) => setUpcomingEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching upcoming events:", err));

    fetch(`http://localhost:3001/api/events/myevents?ownerId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => setMyEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching my events:", err));

    fetch(`http://localhost:3001/api/savedevents?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => setSavedEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching saved events:", err));
  };

  useEffect(() => {
    fetchAll(); // fetch immediately on mount
    const interval = setInterval(fetchAll, 3000); // then re-fetch every 3 seconds
    return () => clearInterval(interval); // clean up when component unmounts
  }, []);

  // Add handleSave function based on eventId
  const handleSave = (eventId) => {
    // invalid currentUserId will just return
    if (!currentUserId) return;

    // Add alreadySaved to fix save-btn bug
    const alreadySaved = savedEventIds.includes(eventId);
    // If the event is in savedEventIds, then it's already saved
    // we send delete; otherwise, we send post
    // this enables us to un-save an event
    const method = alreadySaved ? "DELETE" : "POST";

    fetch("http://localhost:3001/api/savedevents", {
      // update here to use the above defined method var
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, eventId: eventId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.message);
        // re-fetch saved events to update the UI
        fetch(`http://localhost:3001/api/savedevents?userId=${currentUserId}`)
          .then((res) => res.json())
          .then((data) => setSavedEvents(Array.isArray(data) ? data : []));
      })
      .catch((err) => console.error("Error occurred when saving event:", err));
  };

  // Add handleDelete function
  const handleDelete = (eventId) => {
    if (!currentUserId) return;

    fetch(`http://localhost:3001/api/events/${eventId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.message);
        // re-fetch all event lists so UI is updated
        fetch("http://localhost:3001/api/events/upcoming")
          .then((res) => res.json())
          .then((data) => setUpcomingEvents(Array.isArray(data) ? data : []));

        fetch(
          `http://localhost:3001/api/events/myevents?ownerId=${currentUserId}`,
        )
          .then((res) => res.json())
          .then((data) => setMyEvents(Array.isArray(data) ? data : []));
      })
      .catch((err) =>
        console.error("Error occurred when deleting event:", err),
      );
  };

  // add handleEdit function
  const handleEdit = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  // add filter helper function for category filter
  const filterByCategory = (events) => {
    if (selectedCategories.length === 0) return events;
    return events.filter((e) => selectedCategories.includes(e.event?.category));
  };

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

          {/* Category filter bar */}
          <CategoryFilter
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />

          {/* Display search result if the user has searched events */}
          {hasSearched && (
            <section className="events-section">
              <h2 className="section-title">Search Results</h2>
              <div className="events-scroll-container">
                <EventGrid
                  events={searchResults}
                  savedEventIds={savedEventIds}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>
            </section>
          )}

          {/* Display the section - Upcoming Events */}
          <section className="events-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">Upcoming Events</h2>
                <p className="section-subtitle">
                  Events happening in the next 30 days
                </p>
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
                {/* Display and render upcoming event via a function renderEventsGrid */}
                <EventGrid
                  events={filterByCategory(upcomingEvents)}
                  savedEventIds={savedEventIds}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>
            )}
          </section>

          {/* Display the section - My Events */}
          <section className="events-section">
            <div className="section-header-row">
              <div className="section-title-group">
                <h2 className="section-title">My Events</h2>
                <p className="section-subtitle">Events you have created</p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <button
                  className="collapse-btn"
                  onClick={() => setMyEventsExpanded(!myEventsExpanded)}
                >
                  {myEventsExpanded ? "▲" : "▼"}
                </button>
                <button
                  className="create-event-btn"
                  onClick={() => navigate("/new-event")}
                >
                  + Create Event
                </button>
              </div>
            </div>

            {myEventsExpanded && (
              <div className="events-scroll-container">
                {/* Display and render my event via a function renderEventsGrid */}
                <EventGrid
                  events={filterByCategory(myEvents)}
                  savedEventIds={savedEventIds}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>
            )}
          </section>

          {/*Display the section - My Saved Events */}
          <section className="events-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">My Saved Events</h2>
                <p className="section-subtitle">Events you have saved</p>
              </div>
              <button
                className="collapse-btn"
                onClick={() => setSavedExpanded(!savedExpanded)}
              >
                {savedExpanded ? "▲" : "▼"}
              </button>
            </div>

            {savedExpanded && (
              <div className="events-scroll-container">
                {/* Display and render my saved event via a function renderEventsGrid */}
                <EventGrid
                  events={filterByCategory(savedEvents)}
                  isSavedMode={true}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
