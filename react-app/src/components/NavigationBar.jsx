import eventy_logo from "../assets/eventy_logo.png";
import "./css files/NavigationBar.css";
import RegisterButton from "./RegisterButton";
import LoginButton from "./LoginButton";
import UserProfileIconButton from "./UserProfileIconButton";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import { FaBell } from "react-icons/fa";
import { UserAvatarContext } from "../context/UserAvatarContext";

export function NavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const { isBanned } = useContext(UserAvatarContext);
  const userId = localStorage.getItem("userId");

  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    const fetchNotifications = () => {
      fetch(`/api/notifications?userId=${userId}`)
        .then((res) => {
          if (res.status === 401) {
            localStorage.clear();
            localStorage.setItem("loginMessage", "Your account has been deleted.");
            navigate("/login");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) setNotifications(Array.isArray(data) ? data : []);
        })
        .catch(() => {});
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, userId, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  const markAllRead = () => {
    if (unreadCount === 0) return;
    fetch("/api/notifications/read-all", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

  const handleBellClick = () => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen) markAllRead();
  };

  const deleteNotification = (id) => {
    fetch(`/api/notifications/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("delete failed");
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      })
      .catch(() => {});
  };

  const clearCurrentTab = () => {
    if (filteredNotifications.length === 0) return;
    const body = { userId };
    if (activeTab !== "all") body.category = activeTab;
    fetch("/api/notifications/clear-all", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("clear failed");
        setNotifications((prev) =>
          activeTab === "all"
            ? []
            : prev.filter((n) => n.category !== activeTab),
        );
      })
      .catch(() => {});
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src={eventy_logo} alt="Eventy Logo" />
          </div>
          <div className="navbar-buttons">
            {isLoggedIn && (
              <div className="navbar-bell" ref={dropdownRef}>
                <button className="bell-btn" onClick={handleBellClick}>
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className="bell-badge">{unreadCount}</span>
                  )}
                </button>
                {dropdownOpen && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <p className="notifications-title">Notifications</p>
                      {filteredNotifications.length > 0 && (
                        <button
                          className="notifications-clear-btn"
                          onClick={clearCurrentTab}
                        >
                          Clear this tab
                        </button>
                      )}
                    </div>
                    <div className="notifications-tabs">
                      {["all", "system", "interaction"].map((tab) => (
                        <button
                          key={tab}
                          className={`notifications-tab${activeTab === tab ? " active" : ""}`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                    {filteredNotifications.length === 0 ? (
                      <p className="notifications-empty">No notifications</p>
                    ) : (
                      filteredNotifications.map((n) => (
                        <div
                          key={n._id}
                          className={`notification-item${n.isRead ? "" : " unread"}`}
                        >
                          <span className="notification-message">
                            {n.message}
                          </span>
                          <button
                            className="notification-delete-btn"
                            onClick={() => deleteNotification(n._id)}
                            aria-label="Delete notification"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {isLoggedIn ? (
              <UserProfileIconButton />
            ) : (
              <>
                {location.pathname !== "/login" &&
                  localStorage.getItem("isLoggedIn") !== "true" && (
                    <LoginButton />
                  )}
                {location.pathname !== "/register" &&
                  localStorage.getItem("isLoggedIn") !== "true" && (
                    <RegisterButton />
                  )}
              </>
            )}
          </div>
        </div>
      </header>
      {isBanned && (
        <div className="banned-banner">
          Your account has been banned. You can browse events but cannot perform
          any actions.
        </div>
      )}
    </>
  );
}
