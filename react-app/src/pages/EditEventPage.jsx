import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { NavigationBar } from "../components/NavigationBar";
import { EditEventForm } from "../components/EditEventForm";

export const EditEventPage = () => {
  // parameters for various useState, useParams
  const eventId = useParams().eventId;
  // use useLocation to read returnTo from its state
  const returnTo = useLocation().state?.returnTo || "/my-events";
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // use useEffect to fetch the event data from backend db when
  // EditEventPage is loaded
  useEffect(() => {
    fetch(`http://localhost:3001/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEventData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load event data from database.");
        setLoading(false);
      });
  }, [eventId]);

  // show the user Loading... when loading data
  if (loading) {
    return (
      <>
        <NavigationBar />
        <p>Loading event data...</p>
      </>
    );
  }

  // if there is error, just return error message
  if (error) {
    return (
      <>
        <NavigationBar />
        <p>{error}</p>
      </>
    );
  }

  // else return the page:
  return (
    <>
      <NavigationBar />
      <EditEventForm
        eventId={eventId}
        initialData={eventData}
        returnTo={returnTo}
      />
    </>
  );
};
