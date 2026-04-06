import eventy_logo from '../assets/eventy_logo.png';
import './css files/NavigationBar.css';
import RegisterButton from './RegisterButton';
import LoginButton from './LoginButton';
import UserProfileIconButton from './UserProfileIconButton';
import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useContext } from "react";
import { FaBell } from "react-icons/fa";
import { UserAvatarContext } from "../context/UserAvatarContext";

export function NavigationBar() {
    const location = useLocation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const { isBanned } = useContext(UserAvatarContext);
    const userId = localStorage.getItem('userId');

    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!isLoggedIn || !userId) return;
        fetch(`http://localhost:3001/api/notifications?userId=${userId}`)
            .then(res => res.json())
            .then(data => setNotifications(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, [location.pathname, isLoggedIn, userId]);

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

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filteredNotifications = activeTab === "all"
        ? notifications
        : notifications.filter(n => n.category === activeTab);

    const markAllRead = () => {
        if (unreadCount === 0) return;
        fetch("http://localhost:3001/api/notifications/read-all", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
        }).then(() => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        });
    };

    const handleBellClick = () => {
        setDropdownOpen(prev => !prev);
        if (!dropdownOpen) markAllRead();
    };

    return(
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
                                        <p className="notifications-title">Notifications</p>
                                        <div className="notifications-tabs">
                                            {["all", "system", "interaction"].map(tab => (
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
                                            filteredNotifications.map(n => (
                                                <div key={n._id} className={`notification-item${n.isRead ? "" : " unread"}`}>
                                                    {n.message}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {isLoggedIn ? (
                            <UserProfileIconButton/>
                        ) : (
                            <>
                                {location.pathname !== '/login' && localStorage.getItem('isLoggedIn') !== 'true' && <LoginButton/>}
                                {location.pathname !== '/register' && localStorage.getItem('isLoggedIn') !== 'true' && <RegisterButton/>}
                            </>
                        )}
                    </div>
                </div>
            </header>
            {isBanned && (
                <div className="banned-banner">
                    Your account has been banned. You can browse events but cannot perform any actions.
                </div>
            )}
        </>
    );
}