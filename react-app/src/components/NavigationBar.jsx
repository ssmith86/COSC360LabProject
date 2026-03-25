import eventy_logo from '../assets/eventy_logo.png';
import './css files/NavigationBar.css';
import RegisterButton from './RegisterButton';
import LoginButton from './LoginButton';

export function NavigationBar() {
    return(
        <header className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src={eventy_logo} alt="Eventy Logo" />
                </div>
                <div className="navbar-buttons">
                    <LoginButton/>
                    <RegisterButton/>
                </div>
            </div>
        </header>
    );
}