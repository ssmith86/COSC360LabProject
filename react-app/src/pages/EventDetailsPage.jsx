import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EventDetailsPage.css";

export const EventDetailsPage = () => {
  // get eventId from URL param
  const { eventId } = useParams();
  const navigate = useNavigate();

  // useStates for fetched event data, loading, and error
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // read user role and id from localStorage to determin buttons
  // visibility
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const currentUserId = localStorage.getItem("userId");
  const isBanned = localStorage.getItem("isBanned") === "true";

  // fetch event data from backend when the page is loaded
  useEffect(() => {
    fetch(`http://localhost:3001/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEventData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load event details.");
        setLoading(false);
      });
  }, [eventId]);

  // handle delete from EventDetailsPage, prompt confirmation, then call
  // delete endpoint
  const handleDelete = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone.",
    );
    if (!confirmed) return;

    fetch(`http://localhost:3001/api/events/${eventId}`, { method: "DELETE" })
      .then((res) => res.json())
      .then(() => navigate("/"))
      .catch(() => alert("Failed to delete event. Please try again."));
  };

  // handle edit button, to navigate to EditEventPage and pass returnTo prop to
  // return to this page after finishing edit
  const handleEdit = () => {
    navigate(`/edit-event/${eventId}`, {
      state: { returnTo: `/event/${eventId}` },
    });
  };

  // display loading status when fetching data
  if (loading) {
    return (
      <>
        <NavigationBar />
        <p className="event-details-status">Loading event details...</p>
      </>
    );
  }

  // display error message if an error occurs
  if (error) {
    return (
      <>
        <NavigationBar />
        <p className="event-details-status">{error}</p>
      </>
    );
  }

  // get event and owner info from fetched data
  const event = eventData?.event;
  const owner = eventData?.owner;
  const isOwner = !isBanned && currentUserId === owner?.id?.toString();

  // format date string to display to user
  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // connect backend URL for upload image file, otherwise use default
  const imageUrl = event?.image?.startsWith("/uploads/")
    ? `http://localhost:3001${event.image}`
    : event?.image || "/sportImage.webp";

  return (
    <>
      <NavigationBar />
      <div className="event-details-layout">
        <SideBar />
        <main className="event-details-main">
          <button
            className="event-details-back-btn"
            onClick={() => navigate("/my-events")}
          >
            ← Back
          </button>
          {isBanned && (
            <div className="banned-banner">
              Your account has been banned. You can browse events but cannot perform any actions.
            </div>
          )}
          <div className="event-details-card">
            <img
              src={imageUrl}
              alt={`An image of the event: ${event?.name}`}
              className="event-details-image"
            />
            {eventData?.status === "cancelled" && (
              <div className="event-cancelled-banner">
                Sorry, this event was cancelled.
              </div>
            )}
            <div className="event-details-body">
              <h1 className="event-details-title">{event?.name}</h1>

              <div className="event-details-info">
                <p>
                  <span className="event-details-label">Start:</span>{" "}
                  {formatDate(event?.start_date)}
                </p>
                <p>
                  <span className="event-details-label">End:</span>{" "}
                  {formatDate(event?.end_date)}
                </p>
                <p>
                  <span className="event-details-label">Location:</span>{" "}
                  {event?.location
                    ? `${event.location.address} ${event.location.street}, ${event.location.city}, ${event.location.province}, ${event.location.country}`
                    : "TBD"}
                </p>
                <p>
                  <span className="event-details-label">Hosted by:</span>{" "}
                  {owner?.name || "Unknown"}
                </p>
              </div>
              <p className="event-details-description">
                {eventData?.description}
              </p>

              {(isOwner || isAdmin) && (
                <div className="event-details-actions">
                  <button
                    className="event-details-edit-btn"
                    onClick={handleEdit}
                  >
                    Edit Event
                  </button>
                  <button
                    className="event-details-delete-btn"
                    onClick={handleDelete}
                  >
                    Delete Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
