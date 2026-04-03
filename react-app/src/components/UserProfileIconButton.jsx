import { MdAccountCircle, MdKeyboardArrowDown } from "react-icons/md";
import "./css files/UserProfileIconButton.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useContext} from "react";
import { UserAvatarContext } from "../context/UserAvatarContext";   

export default function UserProfileIconButton(){
    const { avatar } = useContext(UserAvatarContext);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        localStorage.removeItem('firstName');
        navigate('/');
    };

    return(
            <div className="profile-wraper">
            <button className="profile-menu" type="button" onClick ={() => setOpen(!open)}>
                    {avatar
                        ? <img src={"http://localhost:3001" + avatar} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        : <MdAccountCircle className="profile-icon" />
                    }
                    <MdKeyboardArrowDown className="chevron-icon" />
            </button>
            {open && (
                <div className="profile-dropdown">
                    <button onClick={() => navigate('/profile')}>My Profile</button>
                    <button onClick={() => navigate('/settings')}>Settings</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
        </div>
    );
}
