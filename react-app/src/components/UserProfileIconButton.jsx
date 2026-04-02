import { MdAccountCircle, MdKeyboardArrowDown } from "react-icons/md";
import "./css files/UserProfileIconButton.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfileIconButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    // Fix logout issue to remove userId and firstName
    // otherwise testing with new logged in registered user
    // will never work
    localStorage.removeItem("userId");
    localStorage.removeItem("firstName");
    navigate("/");
  };

  return (
    <div className="profile-wraper">
      <button
        className="profile-menu"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <MdAccountCircle className="profile-icon" />
        <MdKeyboardArrowDown className="chevron-icon" />
      </button>
      {open && (
        <div className="profile-dropdown">
          <button onClick={() => navigate("/profile")}>My Profile</button>
          <button onClick={() => navigate("/settings")}>Settings</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}
