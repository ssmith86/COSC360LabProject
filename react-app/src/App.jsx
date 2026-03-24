import "./App.css";
import NavigationBar from "./components/NavigationBar";
import { SearchBar } from "./components/SearchBar";
import EventCard from "./components/EventCard";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import EventCreationForm from "./components/EventCreationForm";
import {Routes } from './Routes.jsx';

function App() {
  return (
    <div className="App">
      <Routes/>
    </div>
  );
}

export default App;