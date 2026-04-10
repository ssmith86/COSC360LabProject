import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useContext } from "react";
import { UserAvatarContext } from "../context/UserAvatarContext";
import { useNavigate } from "react-router-dom";

export const SettingsPage = () => {
  const userId = localStorage.getItem("userId");

  // the File object the user picks from their computer
  const [selectedFile, setSelectedFile] = useState(null);
  // a temporary local URL so we can preview the image before uploading
  const [preview, setPreview] = useState(null);
  // the avatar path already stored on the server for this user
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const { refreshAvatar } = useContext(UserAvatarContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    commentOnMyEvent: true,
    favouritedEventUpdated: true,
    favouritedEventDeleted: true,
    newEventInMyArea: true,
    commentOnCommentedEvent: true,
    attendingEventCancelled: true,
    newEventInFollowedCategory: true,
  });

  // on load, fetch the user's existing avatar so we can display it
  useEffect(() => {
    if (!userId) return;
    fetch("/api/users/" + userId)
      .then((res) => res.json())
      .then((data) => {
        setCurrentAvatar(data.avatar || "");
      });
  }, [userId]);

  // on submit for changing notifications, send the updated notification settings to the backend
  const handleNotifications = async () => {
    const res = await fetch("/api/users/" + userId + "/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notifications),
    });
    if (res.ok) {
      setMessage("Notification settings updated successfully");
      setMessageType("success");
    } else {
      setMessage("Failed to update notification settings");
      setMessageType("error");
    }
  };

  // when the user picks a file, store it and create a local preview URL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file)); // browser creates a temporary URL pointing to the local file
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This cannot be undone.",
      )
    )
      return;
    const res = await fetch("/api/users/" + userId, { method: "DELETE" });
    if (res.ok) {
      localStorage.clear();
      navigate("/");
    } else {
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage("Please select an image first");
      setMessageType("error");
      return;
    }
    // FormData is required for file uploads — JSON can't carry binary file data
    const formData = new FormData();
    formData.append("avatar", selectedFile); // "avatar" must match the field name in the server route

    const res = await fetch("/api/users/" + userId + "/avatar", {
      method: "PATCH",
      body: formData,
      // DO NOT set Content-Type header — the browser sets it automatically with the correct boundary for multipart
    });

    if (res.ok) {
      const data = await res.json();
      setCurrentAvatar(data.avatar);
      setPreview(null);
      setSelectedFile(null);
      setMessage("Profile picture updated successfully");
      refreshAvatar();
      setMessageType("success");
    } else {
      setMessage("Failed to update profile picture");
      setMessageType("error");
    }
  };

  if (!userId) {
    return (
      <>
        <NavigationBar />
        <div className="profile-page-body">
          <SideBar />
          <div className="profile-content">
            <h1>Settings</h1>
            <p>Please log in to view your settings.</p>
          </div>
        </div>
      </>
    );
  }

  // what image to show:
  // 1. preview = user just picked a file, show it locally before uploading
  // 2. currentAvatar = image already saved on the server
  // 3. fallback = generic placeholder text
  const imageSrc = preview
    ? preview
    : currentAvatar &&
        typeof currentAvatar === "string" &&
        currentAvatar.startsWith("/")
      ? "" + currentAvatar
      : null;

  return (
    <>
      <NavigationBar />
      <div className="profile-page-body">
        <SideBar />
        <div className="profile-content">
          <h1>Settings</h1>

          <div className="profile-section">
            <h2>Profile Picture</h2>
            {message && (
              <div className={`profile-message ${messageType}`}>{message}</div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="profile-field">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Profile"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "1rem",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                      color: "#666",
                    }}
                  >
                    No image
                  </div>
                )}
                <label>Choose a new profile picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <button type="submit" className="profile-btn">
                Save Profile Picture
              </button>
            </form>
          </div>
          <div className="profile-section">
            <h2>Notification Settings</h2>
            <p> Select the notifications you want to receive:</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                rowGap: "0.75rem",
                columnGap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <label style={{ display: "contents" }}>
                <span>Someone comments on your event</span>
                <input
                  type="checkbox"
                  checked={notifications.commentOnMyEvent}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      commentOnMyEvent: !prev.commentOnMyEvent,
                    }))
                  }
                />
              </label>
              <label style={{ display: "contents" }}>
                <span>An event you favourited is updated</span>
                <input
                  type="checkbox"
                  checked={notifications.favouritedEventUpdated}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      favouritedEventUpdated: !prev.favouritedEventUpdated,
                    }))
                  }
                />
              </label>
              <label style={{ display: "contents" }}>
                <span>A new event is posted in your area</span>
                <input
                  type="checkbox"
                  checked={notifications.newEventInMyArea}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      newEventInMyArea: !prev.newEventInMyArea,
                    }))
                  }
                />
              </label>
              <label style={{ display: "contents" }}>
                <span>An event you favourited is deleted</span>
                <input
                  type="checkbox"
                  checked={notifications.favouritedEventDeleted}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      favouritedEventDeleted: !prev.favouritedEventDeleted,
                    }))
                  }
                />
              </label>
              <label style={{ display: "contents" }}>
                <span>Someone comments on an event you commented on</span>
                <input
                  type="checkbox"
                  checked={notifications.commentOnCommentedEvent}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      commentOnCommentedEvent: !prev.commentOnCommentedEvent,
                    }))
                  }
                />
              </label>
              <label style={{ display: "contents" }}>
                <span>An event you are attending is cancelled</span>
                <input
                  type="checkbox"
                  checked={notifications.attendingEventCancelled}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      attendingEventCancelled: !prev.attendingEventCancelled,
                    }))
                  }
                />
              </label>
              <label style={{ display: "contents" }}>
                <span>A new event is posted in a category you follow</span>
                <input
                  type="checkbox"
                  checked={notifications.newEventInFollowedCategory}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      newEventInFollowedCategory:
                        !prev.newEventInFollowedCategory,
                    }))
                  }
                />
              </label>
            </div>
            <button onClick={handleNotifications} className="profile-btn">
              Save Notification Settings
            </button>
          </div>
          <div className="profile-section">
            <h2>Delete Account</h2>
            <p>
              This will permanently delete your account and cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="profile-btn"
              style={{ backgroundColor: "#dc2626" }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
