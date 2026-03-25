import React from "react";
import { Link } from 'react-router-dom';
import './css files/ButtonStyle.css';

export default function LoginButton() {
    return (
        <div>
            <Link to="login" className="button">
                Login
            </Link>
        </div>
    )
}
