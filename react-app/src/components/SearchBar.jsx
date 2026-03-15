import React, {useState} from "react";
import {FaSearch} from "react-icons/fa";
import './SearchBar.css';

export const SearchBar = ({ setSearchResults, setHasSearched }) => {
  const [input, setInput] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    const response = await fetch(`http://localhost:3001/search?q=${input}`);
    const data = await response.json();

    setSearchResults(data);
    setHasSearched(true);
    setInput("");
  };

  return (
    <form className="input-wrapper" onSubmit={handleSearch}>
      <FaSearch id="search-icon" />
      <input
        placeholder="Search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </form>
  );
};