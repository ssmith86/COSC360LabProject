import { useState } from "react";
import { useNavigate } from "react-router-dom";
// We re-use the EventCreationForm.css to align and simplify design
import "./css files/EventCreationForm.css";

export function EditEventForm({
  eventId,
  initialData,
  returnTo = "/my-events",
}) {
  const navigate = useNavigate();

  // pre-fill the entire edit event form with data
  const [form, setForm] = useState({
    name: initialData?.event?.name || "",
    start_date: initialData?.event?.start_date?.slice(0, 16) || "",
    end_date: initialData?.event?.end_date?.slice(0, 16) || "",
    address: initialData?.event?.location?.address?.toString() || "",
    street: initialData?.event?.location?.street || "",
    city: initialData?.event?.location?.city || "",
    province: initialData?.event?.location?.province || "",
    country: initialData?.event?.location?.country || "",
    description: initialData?.description || "",
  });

  // image File upload useState and responseMsg
  const [imageFile, setImageFile] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");

  // Add necessary handler functions
  // handleChange function
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handleFileChange function for image file
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // handleSubmit function for handling submission of the edit event form
  const handleSubmit = (e) => {
    e.preventDefault();

    // re-use validation from EventCreationForm
    if (form.name.trim().length < 3) {
      setResponseMessage("Event title must be at least 3 characters.");
      return;
    }

    if (form.start_date === "") {
      setResponseMessage("Please select a start date.");
      return;
    }

    if (form.end_date === "") {
      setResponseMessage("Please select an end date.");
      return;
    }

    if (new Date(form.end_date) <= new Date(form.start_date)) {
      setResponseMessage("End Date must be later than the Start Date.");
      return;
    }

    if (form.address.trim().length < 1) {
      setResponseMessage("Address must be at least 1 character.");
      return;
    }

    if (form.street.trim().length < 3) {
      setResponseMessage("Street must be at least 3 characters.");
      return;
    }

    if (form.city.trim().length < 2) {
      setResponseMessage("City must be at least 2 characters.");
      return;
    }

    if (form.province.trim().length < 2) {
      setResponseMessage("Province must be at least 2 characters.");
      return;
    }

    if (form.country.trim().length < 2) {
      setResponseMessage("Country must be at least 2 characters.");
      return;
    }

    if (form.description.trim().length < 10) {
      setResponseMessage("Description must be at least 10 characters.");
      return;
    }
    // Additional Client-Side Security Check
    const locationRegex = /^[a-zA-Z0-9\s.,''-]+$/;
    const titleRegex = /^[a-zA-Z0-9\s.,'!?-]+$/;

    if (!titleRegex.test(form.name.trim())) {
      setResponseMessage("Event title contains invalid special characters.");
      return;
    }
    if (!locationRegex.test(form.address.trim())) {
      setResponseMessage("Address contains invalid special characters.");
      return;
    }
    if (!locationRegex.test(form.street.trim())) {
      setResponseMessage("Street contains invalid special characters.");
      return;
    }
    if (!locationRegex.test(form.city.trim())) {
      setResponseMessage("City contains invalid special characters.");
      return;
    }
    if (!locationRegex.test(form.province.trim())) {
      setResponseMessage("Province contains invalid special characters.");
      return;
    }
    if (!locationRegex.test(form.country.trim())) {
      setResponseMessage("Country contains invalid special characters.");
      return;
    }

    // build updated event object matching the events collection structure
    // const updatedEvent = {
    //   "event.name": form.name,
    //   "event.start_date": form.start_date,
    //   "event.end_date": form.end_date,
    //   "event.location.address": form.address,
    //   "event.location.street": form.street,
    //   "event.location.city": form.city,
    //   "event.location.province": form.province,
    //   "event.location.country": form.country,
    //   description: form.description,
    // };

    // fetch(`http://localhost:3001/api/events/${eventId}`, {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(updatedEvent),
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     setResponseMessage(data.message);
    //     if (data.message === "Event updated successfully.") {
    //       // navigate back to my events page after successful update
    //       setTimeout(() => navigate("/my-events"), 1500);
    //     }
    //   })
    //   .catch(() => setResponseMessage("An error occurred, please try again."));

    // Update to build FormData in order to support image upload
    const formData = new FormData();
    formData.append("event.name", form.name);
    formData.append("event.start_date", form.start_date);
    formData.append("event.end_date", form.end_date);
    formData.append("event.location.address", form.address);
    formData.append("event.location.street", form.street);
    formData.append("event.location.city", form.city);
    formData.append("event.location.province", form.province);
    formData.append("event.location.country", form.country);
    formData.append("description", form.description);
    // only append image if user selected a new file
    if (imageFile) {
      formData.append("image", imageFile);
    }

    fetch(`http://localhost:3001/api/events/${eventId}`, {
      method: "PUT",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setResponseMessage(data.message);
        if (data.message === "Event updated successfully.") {
          setTimeout(() => navigate(returnTo, { replace: true }), 1500);
        }
      })
      .catch(() => setResponseMessage("An error occurred, please try again."));
  };

  return (
    <>
      <h2>Edit Event</h2>
      <div className="event-creation-card">
        <form
          className="event-creation-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="event-creation-field">
            <label className="event-creation-label">Event Title</label>
            <input
              className="event-creation-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. An Awesome Event"
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">Start Date and Time</label>
            <input
              className="event-creation-input"
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">End Date and Time</label>
            <input
              className="event-creation-input"
              type="datetime-local"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              min={form.start_date}
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">Event Image</label>
            <input
              className="event-creation-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">Address</label>
            <input
              className="event-creation-input"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. 321"
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">Street</label>
            <input
              className="event-creation-input"
              type="text"
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="Enterprise Way"
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">City</label>
            <input
              className="event-creation-input"
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Kelowna"
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">Province</label>
            <input
              className="event-creation-input"
              type="text"
              name="province"
              value={form.province}
              onChange={handleChange}
              placeholder="British Columbia"
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">Country</label>
            <input
              className="event-creation-input"
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Canada"
            />
          </div>

          <div className="event-creation-field">
            <label className="event-creation-label">Description</label>
            <textarea
              className="event-creation-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your event..."
            />
          </div>

          <button className="event-creation-btn" type="submit">
            Save Changes
          </button>

          {responseMessage && (
            <p className="event-creation-response">{responseMessage}</p>
          )}
        </form>
      </div>
    </>
  );
}
