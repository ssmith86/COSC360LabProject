import { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import EventCard from "../components/EventCard";
import sportImg from "../assets/sportImage.webp";
import { NavigationBar } from "../components/NavigationBar";

export const HomePage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // for processing EventCard.jsx
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <div>
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
              isSaved={false}
              isOwner={false}
              isAdmin={isAdmin}
              isLoggedIn={isLoggedIn}
              onSave={() => console.log("save", item._id)}
              onEdit={() => console.log("edit", item._id)}
              onDelete={() => console.log("delete", item._id)}
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
          isSaved={false}
          isOwner={false}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          onSave={() => console.log("save")}
          onEdit={() => console.log("edit")}
          onDelete={() => console.log("delete")}
        />
      )}
    </div>
  );
};
