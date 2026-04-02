import "./App.css";
import { Routes } from './Routes.jsx';
import { UserAvatarProvider } from "./context/UserAvatarContext.jsx";

function App() {
  return (
    <div className="App">
      <UserAvatarProvider>
        <Routes/>
      </UserAvatarProvider>
    </div>
  );
}

export default App;