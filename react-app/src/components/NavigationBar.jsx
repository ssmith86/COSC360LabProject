import eventy_logo from '../assets/eventy_logo.png';
import './NavigationBar.css';

export default function NavigationBar() {
    return(
        <header className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src={eventy_logo} alt="Eventy Logo" />
                </div>
            </div>
        </header>
    );
}