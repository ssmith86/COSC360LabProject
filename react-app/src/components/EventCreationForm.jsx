function EventCreationForm() {
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
