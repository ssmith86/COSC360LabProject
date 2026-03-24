import EventCard from "./EventCard";

function EventGrid({ events, currentUser, isSavedMode = false }) {
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

  // handle situation where there is no event to display
  if (!events || events.length === 0) {
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
          isSaved={isSavedMode}
          isOwner={!isSavedMode && doc.owner?.name === currentUser?.name}
          isAdmin={false}
        />
      ))}
    </div>
  );
}

export default EventGrid;
