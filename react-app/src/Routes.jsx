import {
  BrowserRouter as Router,
  Routes as RouterRoutes,
  Route,
} from "react-router-dom";
import { AdministrationDashboard } from "./pages/AdministrationDashboard";
import { EventDetailsPage } from "./pages/EventDetailsPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LogInPage";
import { MyEventsPage } from "./pages/MyEventsPage";
import { NewEventCreationPage } from "./pages/NewEventCreationPage";
import { RegistrationPage } from "./pages/RegisterationPage";
import { RegisteredUserDashboard } from "./pages/RegisteredUserDashboard";
import { UnregisteredUserPage } from "./pages/UnregisteredUserPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SavedEventsPage } from "./pages/SavedEventsPage";
import { EditEventPage } from "./pages/EditEventPage";
// add import for ProtectedRoute component
import { ProtectedRoute } from "./components/ProtectedRoute";

export const Routes = () => {
  return (
    <Router>
      <RouterRoutes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/browse" element={<UnregisteredUserPage />} />
        <Route path="/event/:eventId" element={<EventDetailsPage />} />
        {/* Apply ProtectedRoute to the following to prevent back button loop to protected page */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdministrationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-events"
          element={
            <ProtectedRoute>
              <MyEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-event"
          element={
            <ProtectedRoute>
              <NewEventCreationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RegisteredUserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-events"
          element={
            <ProtectedRoute>
              <SavedEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-event/:eventId"
          element={
            <ProtectedRoute>
              <EditEventPage />
            </ProtectedRoute>
          }
        />
      </RouterRoutes>
    </Router>
  );
};
