import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useNavigate } from "react-router-dom";

const DEFAULT_PREFS = {
  commentOnMyEvent: true,
  favouritedEventUpdated: true,
  favouritedEventDeleted: true,
  newEventInMyArea: true,
  commentOnCommentedEvent: true,
  attendingEventCancelled: true,
  newEventInFollowedCategory: true,
};

export const SettingsPage = () => {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [notifications, setNotifications] = useState(DEFAULT_PREFS);

  useEffect(() => {
    if (!userId) return;
    fetch("/api/users/" + userId)
      .then((r) => r.json())
      .then((user) => {
        if (user.notificationPreferences) {
          setNotifications({ ...DEFAULT_PREFS, ...user.notificationPreferences });
        }
      })
      .catch(() => {});
  }, [userId]);

  const handleNotifications = async () => {
    const res = await fetch("/api/users/" + userId + "/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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

  return (
    <>
      <NavigationBar />
      <div className="profile-page-body">
        <SideBar />
        <div className="profile-content">
          <h1>Settings</h1>

          <div className="profile-section">
            <h2>Notification Settings</h2>
            {message && (
              <div className={`profile-message ${messageType}`}>{message}</div>
            )}
            <p>Select the notifications you want to receive:</p>
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
