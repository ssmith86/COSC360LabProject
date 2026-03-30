import {
  FaHeart,
  FaRegHeart,
  FaEdit,
  FaTrashAlt,
  FaMapMarkedAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import React from "react";
import { useNavigate } from "react-router-dom";
import "./css files/EventCard.css";

/**
 * The EventCard shows details of an event, and will display corresponding buttons for users
 * based on criteria: isSaved, isOwner, isAdmin
 * @param {Object} props - The component props
 * @param {string} props.image - The path or db access to the event's image
 * @param {string} props.title - The title of the event
 * @param {string} props.startDateTime - The starting date and time of the event, e.g. Oct 24, 2025 18:00
 * @param {string} props.endDateTIme - The ending date and time of the event, e.g. Oct 25, 2025 19:00
 * @param {string} props.location - The location of the event
 * @param {boolean} props.isSaved - Wheher the current user has saved/favored this event card
 * @param {boolean} props.isOwner - Whether the current user is the owner of the event card
 * @param {boolean} props.isAdmin - Whether the current user is admin user
 * @param {boolean} props.isLoggedIn - Whether the current user is logged in
 * @param {function} props.onSave - handles functionality when event is on save
 * @param {function} props.onEdit - handles functionality when event is on edit
 * @param {function} props.isAdmin - handles functionality when event is on delete
 */

const EventCard = ({
  image,
  title,
  startDateTime,
  endDateTime,
  location,
  isSaved,
  isOwner,
  isAdmin,
  isLoggedIn,
  onSave,
  onEdit,
  onDelete,
}) => {
  // Add navigate to direct user to different pages once click on a button
  const navigate = useNavigate();

  // add handleSaveClick functionality
  // if unregistered user clicks on save button, direct the person to register page
  // if registered user clicks on save button, handles save functionality
  const handleSaveClick = () => {
    if (!isLoggedIn) {
      navigate("/register");
    } else {
      onSave && onSave();
    }
  };

  return (
    <div className="event-card">
      {/* Display the image of the event on top of EventCard */}
      <div className="event-image-container">
        <img
          src={image}
          alt={`An image of the event: ${title}`}
          className="event-card-image"
        />
      </div>

      {/* Display the event title below the event image */}
      <div className="event-title-banner">
        <h3>{title}</h3>
      </div>

      {/* Display event's general information */}
      <div className="event-info-section">
        {/* Display: DateIcon, startDateTime, and endDateTime */}
        <div className="event-details-wrapper">
          <div className="info-row">
            <FaCalendarAlt className="info-icon" />
            <span>
              {startDateTime} to {endDateTime}
            </span>
          </div>

          {/* Display the Location information */}
          <div className="info-row">
            <FaMapMarkedAlt className="info-icon" />
            <span>{location}</span>
          </div>
        </div>

        {/* Display the user-related buttons: Event Details, SaveHeart, Edit, Delete */}
        <div className="event-footer">
          <button className="check-details-btn">Check Details</button>

          {/* Group the SaveHeart, Edit and Delete in one div */}
          <div className="action-btns">
            {/* Add onClick to handleSaveClick for handling save function */}
            <button className="icon-only-btn" onClick={handleSaveClick}>
              {isSaved ? <FaHeart className="heart-filled" /> : <FaRegHeart />}
            </button>
            {/* Update the edit button logic and add onClick to onEdit */}
            {(isOwner || isAdmin) && (
              <button className="icon-only-btn edit-btn-color" onClick={onEdit}>
                <FaEdit />
              </button>
            )}
            {/* Update the delete button logic and add onClick to onDelete */}
            {(isAdmin || isOwner) && (
              <button
                className="icon-only-btn delete-btn-color"
                onClick={onDelete}
              >
                <FaTrashAlt />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
