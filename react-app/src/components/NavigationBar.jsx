import eventy_logo from '../assets/eventy_logo.png';
import './css files/NavigationBar.css';
import RegisterButton from './RegisterButton';
import LoginButton from './LoginButton';
import UserProfileIconButton from './UserProfileIconButton';
import { useLocation } from "react-router-dom";

export function NavigationBar() {
    const location = useLocation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    return(
        <header className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src={eventy_logo} alt="Eventy Logo" />
                </div>
                <div className="navbar-buttons">
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
    );
}