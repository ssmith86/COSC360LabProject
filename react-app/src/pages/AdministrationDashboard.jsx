import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import { useState, useEffect } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import "./AdministrationDashboard.css";

export const AdministrationDashboard = () => {
  const [users, setUsers] = useState([]);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    userName: "",
    isAdmin: false,
    isBanned: false,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

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
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="user-search"
          />
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) =>
                  u.userName.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((user) => (
                  <tr key={user._id}>
                    <td>{user.userName}</td>
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
