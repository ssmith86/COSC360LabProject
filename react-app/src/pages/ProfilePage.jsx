import { NavigationBar } from '../components/NavigationBar';
import { SideBar } from '../components/SideBar';
import { useState, useEffect } from 'react';
import './ProfilePage.css';

export const ProfilePage = () => {
    const userId = localStorage.getItem('userId');
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState('');
    const [profileMessageType, setProfileMessageType] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordMessageType, setPasswordMessageType] = useState('');

    useEffect(() => {
        if (!userId) return;
        fetch("http://localhost:3001/api/users/" + userId)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setFirstName(data.firstName || '');
                setLastName(data.lastName || '');
                setUserName(data.userName || '');
                setEmail(data.email || '');
            });
    }, [userId]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim() || !userName.trim() || !email.trim()) {
            setProfileMessage('All fields are required');
            setProfileMessageType('error');
            return;
        }
        const res = await fetch("http://localhost:3001/api/users/" + userId, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, userName, email }),
        });
        if (res.ok) {
            setProfileMessage('Profile updated successfully');
            setProfileMessageType('success');
        } else {
            const data = await res.json();
            setProfileMessage(data.message || 'Failed to update profile');
            setProfileMessageType('error');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage('All password fields are required');
            setPasswordMessageType('error');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMessage('New password must be at least 8 characters');
            setPasswordMessageType('error');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage('New passwords do not match');
            setPasswordMessageType('error');
            return;
        }
        const res = await fetch("http://localhost:3001/api/users/" + userId, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPassword, currentPassword }),
        });
        if (res.ok) {
            setPasswordMessage('Password updated successfully');
            setPasswordMessageType('success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            const data = await res.json();
            setPasswordMessage(data.message || 'Failed to update password');
            setPasswordMessageType('error');
        }
    };

    if (!userId) {
        return (
            <>
                <NavigationBar />
                <div className="profile-page-body">
                    <SideBar />
                    <div className="profile-content">
                        <h1>My Profile</h1>
                        <p>Please log in to view your profile.</p>
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
                    <h1>My Profile</h1>

                    <div className="profile-section">
                        <h2>Personal Information</h2>
                        {profileMessage && (
                            <div className={`profile-message ${profileMessageType}`}>
                                {profileMessage}
                            </div>
                        )}
                        <form onSubmit={handleUpdateProfile}>
                            <div className="profile-field">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="profile-field">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter last name"
                                />
                            </div>
                            <div className="profile-field">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="Enter username"
                                />
                            </div>
                            <div className="profile-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email"
                                />
                            </div>
                            <button type="submit" className="profile-btn">Save Changes</button>
                        </form>
                    </div>

                    <div className="profile-section">
                        <h2>Change Password</h2>
                        {passwordMessage && (
                            <div className={`profile-message ${passwordMessageType}`}>
                                {passwordMessage}
                            </div>
                        )}
                        <form onSubmit={handleUpdatePassword}>
                            <div className="profile-field">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="profile-field">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 8 characters)"
                                />
                            </div>
                            <div className="profile-field">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                />
                            </div>
                            <button type="submit" className="profile-btn">Update Password</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};
