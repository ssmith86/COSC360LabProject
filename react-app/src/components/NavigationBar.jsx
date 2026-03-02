import eventy_logo from '../assets/eventy_logo.png';
import './NavigationBar.css';
import UserProfileIconButton from "./UserProfileIconButton";

// variant: "basic" | "auth" | "loggedIn" (default)
export default function NavigationBar({ variant = "loggedIn" }) {
    return (
        <header className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src={eventy_logo} alt="Eventy Logo" />
                </div>

                {variant === "auth" && (
                    <div className="navbar-auth">
                        <button className="navbar-btn-signin" type="button">Sign in</button>
                        <button className="navbar-btn-register" type="button">Register</button>
                    </div>
                )}

                {variant === "loggedIn" && (
                    <UserProfileIconButton />
                )}
            </div>
        </header>
    );
}
