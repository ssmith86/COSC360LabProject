import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdDelete } from "react-icons/md";
import "./AdministrationDashboard.css";

export const AdministrationDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    userName: "",
    isAdmin: false,
    isBanned: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilters, setUserFilters] = useState({ active: true, banned: true, admin: true, user: true });
  const [eventFilters, setEventFilters] = useState({ byName: true, byOwner: true, byDate: true });

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term.trim()) {
      setUsers([]);
      setEvents([]);
      return;
    }
    const res = await fetch(`http://localhost:3001/api/users/search?q=${encodeURIComponent(term)}`);
    const data = await res.json();
    setUsers(Array.isArray(data.users) ? data.users : []);
    setEvents(Array.isArray(data.events) ? data.events : []);
  };


  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    const res = await fetch(`http://localhost:3001/api/events/${eventId}`, { method: "DELETE" });
    if (res.ok) {
      setEvents(events.filter((e) => e._id !== eventId));
    }
  };

  const handleDelete = async () => {
    const res = await fetch(
      "http://localhost:3001/api/users/" + userToDelete._id,
      { method: "DELETE" },
    );
    if (res.ok) {
      setUsers(users.filter((u) => u._id !== userToDelete._id));
      setUserToDelete(null);
    }
  };

  const handleEdit = async () => {
    // Add additional Client-Side security check
    const userNameRegex = /^[a-zA-Z0-9_]+$/;
    if (!editForm.userName.trim()) {
      alert("Username cannot be empty.");
      return;
    }
    if (!userNameRegex.test(editForm.userName.trim())) {
      alert("Username can only contain letters, numbers, and underscores.");
      return;
    }

    const body = {
      userName: editForm.userName,
      isAdmin: editForm.isAdmin,
      isBanned: editForm.isBanned,
    };
    const res = await fetch(
      "http://localhost:3001/api/users/" + userToEdit._id,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (res.ok) {
      setUsers(
        users.map((u) => (u._id === userToEdit._id ? { ...u, ...body } : u)),
      );
      setUserToEdit(null);
    }
  };

  const handlePasswordReset = async () => {
    await fetch(
      "http://localhost:3001/api/users/" + userToEdit._id + "/reset-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userToEdit.email }),
      },
    );
    alert("Password reset email sent to " + userToEdit.email);
  };

  return (
    <>
      <NavigationBar />

      <div className="admin-page-body">
        <SideBar />
        <div className="admin-content">
          <h1>Admin Dashboard</h1>
          <input
            type="text"
            placeholder="Search users by name, email, or event..."
            value={searchTerm}
            onChange={handleSearch}
            className="user-search"
          />
          {searchTerm && (
            <>
              <h2>Users ({users.filter(u => (userFilters.active && !u.isBanned) || (userFilters.banned && u.isBanned)).filter(u => (userFilters.admin && u.isAdmin) || (userFilters.user && !u.isAdmin)).length})</h2>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 'bold' }}>Status:</span>
                <label><input type="checkbox" checked={userFilters.active} onChange={() => setUserFilters(f => ({ ...f, active: !f.active }))} /> Active</label>
                <label><input type="checkbox" checked={userFilters.banned} onChange={() => setUserFilters(f => ({ ...f, banned: !f.banned }))} /> Banned</label>
                <span style={{ fontWeight: 'bold', marginLeft: '0.5rem' }}>Role:</span>
                <label><input type="checkbox" checked={userFilters.admin} onChange={() => setUserFilters(f => ({ ...f, admin: !f.admin }))} /> Admin</label>
                <label><input type="checkbox" checked={userFilters.user} onChange={() => setUserFilters(f => ({ ...f, user: !f.user }))} /> User</label>
              </div>
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter(u => (userFilters.active && !u.isBanned) || (userFilters.banned && u.isBanned))
                    .filter(u => (userFilters.admin && u.isAdmin) || (userFilters.user && !u.isAdmin))
                    .map((user) => (
                    <tr key={user._id}>
                      <td>{user.userName}</td>
                      <td>{user.email}</td>
                      <td>{user.isBanned ? "Banned" : "Active"}</td>
                      <td>{user.isAdmin ? "Admin" : "User"}</td>
                      <td>
                        <button
                          className="edit-button"
                          onClick={() => {
                            setUserToEdit(user);
                            setEditForm({
                              userName: user.userName,
                              isAdmin: user.isAdmin,
                              isBanned: user.isBanned || false,
                            });
                          }}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => setUserToDelete(user)}
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h2>Events ({events.length})</h2>
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 'bold' }}>Show columns:</span>
                <label><input type="checkbox" checked={eventFilters.byName} onChange={() => setEventFilters(f => ({ ...f, byName: !f.byName }))} /> Event Name</label>
                <label><input type="checkbox" checked={eventFilters.byOwner} onChange={() => setEventFilters(f => ({ ...f, byOwner: !f.byOwner }))} /> Owner</label>
                <label><input type="checkbox" checked={eventFilters.byDate} onChange={() => setEventFilters(f => ({ ...f, byDate: !f.byDate }))} /> Date</label>
              </div>
              <table className="users-table">
                <thead>
                  <tr>
                    {eventFilters.byName && <th>Event Name</th>}
                    {eventFilters.byOwner && <th>Owner</th>}
                    {eventFilters.byDate && <th>Date</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      {eventFilters.byName && <td>{event.event?.name}</td>}
                      {eventFilters.byOwner && <td>{event.owner?.name}</td>}
                      {eventFilters.byDate && <td>{event.event?.start_date}</td>}
                      <td>
                        <button
                          className="edit-button"
                          onClick={() => navigate(`/edit-event/${event._id}`)}
                        >
                          <MdEdit />
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
      {userToDelete && (
        <div className="delete-confirmation">
          <div className="confirmation-box">
            <p>
              Are you sure you want to delete {userToDelete.userName}'s account?
            </p>
            <button onClick={handleDelete}>Yes</button>
            <button onClick={() => setUserToDelete(null)}>Cancel</button>
          </div>
        </div>
      )}
      {userToEdit && (
        <div className="edit-overlay">
          <div className="edit-box">
            <h2>Edit User: {userToEdit.userName}</h2>
            <label>Username:</label>
            <input
              type="text"
              value={editForm.userName}
              onChange={(e) =>
                setEditForm({ ...editForm, userName: e.target.value })
              }
            />
            <label>Admin:</label>
            <input
              type="checkbox"
              checked={editForm.isAdmin}
              onChange={(e) =>
                setEditForm({ ...editForm, isAdmin: e.target.checked })
              }
            />
            <label>Banned:</label>
            <input
              type="checkbox"
              checked={editForm.isBanned}
              onChange={(e) =>
                setEditForm({ ...editForm, isBanned: e.target.checked })
              }
            />
            <button onClick={handlePasswordReset}>
              Send Password Reset Email
            </button>
            <button onClick={handleEdit}>Save</button>
            <button onClick={() => setUserToEdit(null)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};
