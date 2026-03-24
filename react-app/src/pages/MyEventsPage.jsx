import NavigationBar from "../components/NavigationBar";
import SearchBar from "../components/SearchBar";
import SideBar from "../components/SideBar";

export default function MyEventsPage() {
  return (
    <div className="page-wrapper">
      <NavigationBar.jsx />

      <div className="page-body">
        {/* Display SideBar here */}
        <aside className="sidebar-area">
          <SideBar />
        </aside>
      </div>

      <div className="main-content">
        <div className="search-bar-area">
          <SearchBar
            setSearchResults={setSearchResults}
            setHasSearched={setHasSearched}
          />

          {/* Display search result if the user has searched events */}

          {/* Display the section - Upcoming Events */}
          <section className="events-section"></section>

          {/* Display the section - My Events */}
          <section className="events-section"></section>

          {/*Display the section - My Saved Events */}
          <section className="events-section"></section>
        </div>
      </div>
    </div>
  );
}
