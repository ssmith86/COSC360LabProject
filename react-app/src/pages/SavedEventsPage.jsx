import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import { useState, useEffect, useContext } from "react";
import { EventGrid } from "../components/EventGrid";
import { useNavigate } from "react-router-dom";
import "./MyEventsPage.css";
import { CategoryFilter } from "../components/CategoryFilter";
import { UserAvatarContext } from "../context/UserAvatarContext";

// This is a downsized version of "MyEventsPage"
// We keep some of the functionalities so user can
// save and unsave events, edit and delete events owned by the user
// and also include the category filter bar, and a create event button
export const SavedEventsPage = () => {
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [savedExpanded, setSavedExpanded] = useState(true);

  const currentUserId = localStorage.getItem("userId");
  const { isBanned } = useContext(UserAvatarContext);
  const savedEventIds = savedEvents.map((event) => event._id?.toString());

  const fetchSaved = () => {
    fetch(`http://localhost:3001/api/savedevents?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => setSavedEvents(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching saved events:", err));
  };

  useEffect(() => {
    fetchSaved();
    const interval = setInterval(fetchSaved, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = (eventId) => {
    if (!currentUserId) return;
    const alreadySaved = savedEventIds.includes(eventId);
    const method = alreadySaved ? "DELETE" : "POST";

    fetch("http://localhost:3001/api/savedevents", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, eventId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.message);
        fetchSaved();
      })
      .catch((err) => console.error("Error occurred when saving event:", err));
  };

  const handleDelete = (eventId) => {
    if (!currentUserId) return;

    fetch(`http://localhost:3001/api/events/${eventId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data.message);
        fetchSaved();
      })
      .catch((err) =>
        console.error("Error occurred when deleting event:", err),
      );
  };

  const handleEdit = (eventId) => {
    navigate(`/edit-event/${eventId}`);
  };

  const filterByCategory = (events) => {
    if (selectedCategories.length === 0) return events;
    return events.filter((e) => selectedCategories.includes(e.event?.category));
  };

  return (
    <div className="page-wrapper">
      <NavigationBar />

      <div className="page-body">
        <aside className="sidebar-area">
          <SideBar />
        </aside>

        <div className="main-content">
          <CategoryFilter
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />

          <section className="events-section">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">My Favorite Events</h2>
                <p className="section-subtitle">Events you have saved</p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <button
                  className="collapse-btn"
                  onClick={() => setSavedExpanded(!savedExpanded)}
                >
                  {savedExpanded ? "▲" : "▼"}
                </button>
                <button
                  className="create-event-btn"
                  onClick={() => !isBanned && navigate("/new-event")}
                  disabled={isBanned}
                >
                  + Create Event
                </button>
              </div>
            </div>

            {savedExpanded && (
              <div className="events-scroll-container">
                <EventGrid
                  events={filterByCategory(savedEvents)}
                  savedEventIds={savedEventIds}
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
