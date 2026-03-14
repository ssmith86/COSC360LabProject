import { useState } from "react";

function EventCreationForm() {
  // set up what we need for each data field
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    image: "",
    address: "",
    city: "",
    province: "",
    country: "",
    description: "",
  });

  // use resposneMessage to handle feedback to user and fetch success/failure
  const [responseMessage, setResponseMessage] = useState("");

  // Implement handleChange to deal with event and state update for form
  const handleChange = (e) => {
    // spread operator on form and update
    // use event's target.name and target.value on html input to update form
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Implement handleSubmit, validate all fields are filled
  const handleSubmit = (e) => {
    e.preventDefault();

    for (let field in form) {
      if (form[field].trim() == "") {
        setResponseMessage(
          "Please fill out all the fields before creating the event",
        );
        return;
      }
    }

    // Once fields are all field, build the event data, matching the SampleData.json
    // for now we add all created events under a hardcoded owner
    // as we proceed with DB, we'll change this behavior
    const eventData = {
      event: {
        name: form.name,
        start_date: form.start_date,
        end_date: form.end_date,
        image: form.image,
        location: {
          address: form.address,
          street: form.street,
          city: form.city,
          province: form.province,
          country: form.country,
        },
      },
      description: form.description,
    };
  };

  // retactored below component html
  return (
    <div className="event-creation-card">
      <form className="event-creation-form" onSubmit={handleSubmit}>
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
          />
        </div>

        {/* For now the image only accepts URL */}
        <div className="event-creation-field">
          <label className="event-creation-label">Image URL</label>
          <input
            className="event-creation-input"
            type="text"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="e.g. /myImage.webp"
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
          Create Event
        </button>

        {responseMessage && (
          <p className="event-creation-response">{responseMessage}</p>
        )}
      </form>
    </div>
  );
}
