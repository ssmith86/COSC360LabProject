import EventCard from "./EventCard";
import "./css files/EventGrid.css";
// update new prop savedEventIds which holds an array of ID string for
// events that the current user has saved. This is for parent to fetch
export function EventGrid({
  events,
  currentUser,
  savedEventIds = [],
  isSavedMode = false,
}) {
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

  // Update user related information and status
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const currentUserId = localStorage.getItem("userId");

  // handle situation where there is no event to display
  if (!events || !Array.isArray(events) || events.length === 0) {
    return <p className="no-events-msg">No events to display</p>;
  }

  // We should have a default image to display in case upload image is not available
  return (
    <div className="event-grid">
      {events.map((doc, index) => (
        <EventCard
          key={doc._id || index}
          image={doc.event?.image || "/sportImage.webp"}
          title={doc.event?.name || "Untitled Event"}
          startDateTime={formatDate(doc.event?.start_date)}
          endDateTime={formatDate(doc.event?.end_date)}
          location={formatLocation(doc.event?.location)}
          isSaved={isSavedMode || savedEventIds.includes(doc._id?.toString())}
          isOwner={currentUserId === doc.owner?.id}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          onSave={() => console.log("save", doc._id)}
          onEdit={() => console.log("edit", doc._id)}
          onDelete={() => console.log("delete", doc._id)}
        />
      ))}
    </div>
  );
}
