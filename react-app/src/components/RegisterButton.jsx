import React from "react";
import { Link } from 'react-router-dom';
import './css files/ButtonStyle.css';

export default function RegisterButton() {
    return (
        <div>
            <Link to="/register" className="button">
                Register
            </Link>
        </div>
    )
}
