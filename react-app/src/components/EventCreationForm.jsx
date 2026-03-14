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

  return (
    <div className="event-creation-form-container">
      <h2>Create a New Event</h2>
      <form>
        {/* Event Title */}
        <div className="form-item">
          <label>Event Title:</label>
          <input
            type="text"
            name="name"
            value="todo"
            onChange={handleChange}
            placeholder="My Event Name"
          />
        </div>
        {/* Event Start and End Dates */}
        <div className="form-row">
          <div className="form-item">
            <label>Start Date and Time</label>
            <input
              type="datetime-local"
              name="start_date"
              value="todo"
              onChange={handleChange}
            />
          </div>
          <div className="form-item">
            <label>End Date and Time</label>
            <input
              type="datetime-local"
              name="end_date"
              value="todo"
              onChange={handleChange}
            />
          </div>
        </div>
        {/* Image Upload */}
        <div className="form-item">
          <label>Upload Event Image</label>
          <input type="file" onChange={handleImageChange} accept="image/*" />
        </div>
        {/* Location Information */}
        <fieldset>
          <legend>Location</legend>
          <div className="form-item">
            <label>Address</label>
            <input
              type="text"
              name="location.address"
              value="todo"
              onChange={handleChange}
              placeholder="e.g. 321"
            />
          </div>
          <div className="form-item">
            <label>Street</label>
            <input
              type="text"
              name="location.street"
              value="todo"
              onChange={handleChange}
              placeholder="Enterprise Way"
            />
          </div>
          <div className="form-item">
            <label>City</label>
            <input
              type="text"
              name="location.city"
              value="todo"
              onChange={handleChange}
              placeholder="Kelowna"
            />
          </div>
          <div className="form-item">
            <label>Province</label>
            <input
              type="text"
              name="location.province"
              value="todo"
              onChange={handleChange}
              placeholder="British Columbia"
            />
          </div>
          <div className="form-item">
            <label>Country</label>
            <input
              type="text"
              name="location.country"
              value="todo"
              onChange={handleChange}
              placeholder="Canada"
            />
          </div>
        </fieldset>
        {/* Description Section */}
        <div className="form-item">
          <label>Description</label>
          <textarea
            name="description"
            value="todo"
            onChange={handleChange}
            rows={10}
            placeholder="Describe in a few sentences what this event is about..."
          />
        </div>
        <button type="submit" className="submit-btn">
          Create Event
        </button>
      </form>
    </div>
  );
}
