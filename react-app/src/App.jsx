import "./App.css";
import NavigationBar from "./components/NavigationBar";
import { SearchBar } from "./components/SearchBar";
import EventCard from "./components/EventCard";
import sportImg from "./assets/sportImage.webp";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import {useState } from "react";


function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  return (
    <div className="App">
      <NavigationBar />
      <SearchBar 
        setSearchResults={setSearchResults}
        setHasSearched={setHasSearched}
      />
      {hasSearched ? (
        searchResults.length === 0 ? (
          <p className="no-results">No results found.</p>
        ) : (
          searchResults.map((item, index) => (
            <EventCard
              key={index}
              image={sportImg}
              title={item.event.name}
              startDateTime={item.event.start_date}
              endDateTime={item.event.end_date}
              location={`${item.event.location.street}, ${item.event.location.city}`}
              isSaved={0}
              isOwner={0}
              isAdmin={0}
            />
          ))
        )
      ) : (
        <EventCard
          image={sportImg}
          title="Alamo Bowl 2025"
          startDateTime="12/31/2025 17:00"
          endDateTime="12/31/2025 23:00"
          location="Alamodome, San Antonio, TX"
          isSaved={1}
          isOwner={1}
          isAdmin={1}
        />
      )}

      <LoginForm />
      <SignUpForm />
    </div>
  );
}

export default App;