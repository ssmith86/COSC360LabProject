import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css files/EventCreationForm.css";

function EventCreationForm() {
  const navigate = useNavigate();
  // set up what we need for each data field
  const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    street: "",
    address: "",
    city: "",
    province: "",
    country: "",
    description: "",
  });
  // replace orignal image, and add a new image useState
  const [imageFile, setImageFile] = useState(null);

  // Add the current time to ensure user cannot choose start_date before current date time
  const now = new Date().toISOString().slice(0, 16);

  // use resposneMessage to handle feedback to user and fetch success/failure
  const [responseMessage, setResponseMessage] = useState("");

  // Implement handleChange to deal with event and state update for form
  const handleChange = (e) => {
    // spread operator on form and update
    // use event's target.name and target.value on html input to update form
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Implement handleFileChange to deal with image upload event and handle state change
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Implement handleSubmit, validate all fields are filled
  const handleSubmit = (e) => {
    e.preventDefault();

    // for (let field in form) {
    //   if (form[field].trim() == "") {
    //     setResponseMessage(
    //       "Please fill out all the fields before creating the event",
    //     );
    //     return;
    //   }
    // }

    // Add logic to ensure certain minimum length for certain fields
    // Validate minimum length for each field
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

    // check if start_date is after current date time
    if (new Date(form.start_date) <= new Date()) {
      setResponseMessage(
        "The Start Date must be later than the current date and time.",
      );
      return;
    }

    // check and ensure end_date is later than start_date
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

    // Add additional Client-Side Security Check
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

    // Once fields are all field, build the event data, matching the SampleData.json
    // for now we add all created events under a hardcoded owner
    // as we proceed with DB, we'll change this behavior
    // const eventData = {
    //   event: {
    //     name: form.name,
    //     start_date: form.start_date,
    //     end_date: form.end_date,
    //     image: form.image,
    //     location: {
    //       address: form.address,
    //       street: form.street,
    //       city: form.city,
    //       province: form.province,
    //       country: form.country,
    //     },
    //   },
    //   description: form.description,
    // };

    // Update handling below for handling image file upload when submit
    // add data step by step to eventData to have separate handling on image file
    const eventData = new FormData();
    eventData.append("event_name", form.name);
    eventData.append("start_date", form.start_date);
    eventData.append("end_date", form.end_date);
    eventData.append("address", form.address);
    eventData.append("street", form.street);
    eventData.append("city", form.city);
    eventData.append("province", form.province);
    eventData.append("country", form.country);
    eventData.append("description", form.description);
    eventData.append("userId", localStorage.getItem("userId") || "");
    eventData.append(
      "owner_name",
      localStorage.getItem("firstName") || "Unknown",
    );
    // add handling of image upload
    if (imageFile) {
      eventData.append("image", imageFile);
    }

    // implement the fetch to send data
    fetch("http://localhost:3001/api/createEventsForm", {
      method: "POST",
      // headers: {
      //   "Content-Type": "application/json",
      // },
      // body: JSON.stringify(eventData),
      body: eventData,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        setResponseMessage(data.message);
        navigate("/my-events");
      })
      .catch(function () {
        setResponseMessage("An error occurred, please try again");
      });
  };

  // retactored below component html
  return (
    <div className="event-creation-card">
      <form className="event-creation-form" onSubmit={handleSubmit} noValidate>
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
            min={now}
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
            min={form.start_date || now}
          />
        </div>

        {/* For now the image only accepts URL */}
        <div className="event-creation-field">
          <label className="event-creation-label">Event Image</label>
          <input
            className="event-creation-input"
            type="file"
            // name="image"
            // value={form.image}
            accept="image/*"
            onChange={handleFileChange}
            // placeholder="e.g. /myImage.webp"
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

export default EventCreationForm;
