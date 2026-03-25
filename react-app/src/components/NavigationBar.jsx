import eventy_logo from '../assets/eventy_logo.png';
import './NavigationBar.css';
import UserProfileIconButton from "./UserProfileIconButton";

export function NavigationBar() {
    return(
        <header className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src={eventy_logo} alt="Eventy Logo" />
                </div>

                <UserProfileIconButton />
            </div>
        </header>
    );
}