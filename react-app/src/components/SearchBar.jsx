import React, {useState} from "react";
import {FaSearch} from "react-icons/fa";
import './SearchBar.css';

export const SearchBar = () => {
    const [input, setInput] = useState("");
    return (
    <div className="input-wrapper">
        <FaSearch id="search-icon"/>
        <input placeholder="Search" value={input} onChange={(e) => setInput(e.target.value)}/>
    </div>
    );

    //TODO: Add functionality to search bar
};