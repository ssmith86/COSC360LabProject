import { NavigationBar } from '../components/NavigationBar';
import { SideBar } from '../components/SideBar';
import { SearchBar } from "../components/SearchBar";
import { useState, useEffect } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import './AdministrationDashboard.css';

export const AdministrationDashboard = () => {
    const [users, setUsers] = useState([]);

useEffect(() => {
    fetch("http://localhost:3001/api/users")
        .then(res => res.json())
        .then(data => setUsers(data));
}, []);

    return(
        <>
            <NavigationBar/>
            <SearchBar/>

            <div className="admin-content">
                <h1>Admin Dashboard</h1>
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
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.userName}</td>
                                <td>{user.status || "Active"}</td>
                                <td>{user.isAdmin ? "Admin" : "User"}</td>
                                <td>
                                    <MdEdit/>
                                    <MdDelete/>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SideBar/>
        </>
    );
}