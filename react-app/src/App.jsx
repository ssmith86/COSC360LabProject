import "./App.css";
import NavigationBar from "./components/NavigationBar";
import { SearchBar } from "./components/SearchBar";
import EventCard from "./components/EventCard";
import sportImg from "./assets/sportImage.webp";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";


function App() {
  return (
    <div className="App">
      <NavigationBar variant="basic" />
      <NavigationBar variant="auth"/>
      <NavigationBar variant="loggedIn"/>
      <SearchBar />
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
      <LoginForm />
      <SignUpForm />
    </div>
  );
}

export default App;
