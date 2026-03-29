import { BrowserRouter as Router, Routes as RouterRoutes, Route } from 'react-router-dom';
import { AdministrationDashboard } from './pages/AdministrationDashboard';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LogInPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { NewEventCreationPage } from './pages/NewEventCreationPage';
import { RegistrationPage } from './pages/RegisterationPage';
import { RegisteredUserDashboard } from './pages/RegisteredUserDashboard';
import { UnregisteredUserPage } from './pages/UnregisteredUserPage';

export const Routes = () => {
    return(
        <Router>
            <RouterRoutes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<AdministrationDashboard />} />
                <Route path="/event/:eventId" element={<EventDetailsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/my-events" element={<MyEventsPage />} />
                <Route path="/new-event" element={<NewEventCreationPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/dashboard" element={<RegisteredUserDashboard />} />
                <Route path="/browse" element={<UnregisteredUserPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </RouterRoutes>
        </Router>
    )
}
