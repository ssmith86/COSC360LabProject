import { NavigationBar } from "../components/NavigationBar";
import { SearchBar } from "../components/SearchBar";
import { SideBar } from "../components/SideBar";
import { useState, useEffect } from "react";
import { EventGrid } from "../components/EventGrid";
import { useNavigate } from "react-router-dom";
import "./MyEventsPage.css";

export const MyEventsPage = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

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

  // useEffect to fetch three different types of events from cosc360db events collection
  useEffect(() => {
    fetch("http://localhost:3001/api/events/upcoming")
      .then((res) => res.json())
      .then((data) => setUpcomingEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching upcoming events:", err));
  }, []);

  useEffect(() => {
    fetch(
      // `http://localhost:3001/api/events/myevents?ownerName=${currentUser.name}`,
      `http://localhost:3001/api/events/myevents?ownerId=${currentUserId}`,
    )
      .then((res) => res.json())
      .then((data) => setMyEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching my events:", err));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3001/api/savedevents?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => setSavedEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching saved events:", err));
  }, []);

  // Add handleSave function based on eventId
  const handleSave = (eventId) => {
    // invalid currentUserId will just return
    if (!currentUserId) return;

    fetch("http://localhost:3001/api/savedevents", {
      method: "POST",
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
            <h2 className="section-title">Upcoming Events</h2>
            <p className="section-subtitle">
              Events happening in the next 30 days
            </p>
            <div className="events-scroll-container">
              {/* Display and render upcoming event via a function renderEventsGrid */}
              <EventGrid
                events={upcomingEvents}
                savedEventIds={savedEventIds}
                onSave={handleSave}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          </section>

          {/* Display the section - My Events */}
          <section className="events-section">
            <h2 className="section-title">My Events</h2>
            <p className="section-subtitle">Events you have created</p>
            <div className="events-scroll-container">
              {/* Display and render my event via a function renderEventsGrid */}
              <EventGrid
                events={myEvents}
                savedEventIds={savedEventIds}
                onSave={handleSave}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          </section>

          {/*Display the section - My Saved Events */}
          <section className="events-section">
            <h2 className="section-title">My Saved Events</h2>
            <p className="section-subtitle">Events you have saved</p>
            <div className="events-scroll-container">
              {/* Display and render my saved event via a function renderEventsGrid */}
              <EventGrid
                events={savedEvents}
                isSavedMode={true}
                onSave={handleSave}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
