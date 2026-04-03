import {MdDashboard, MdEvent, MdFavorite, MdPerson, MdAdminPanelSettings, MdBarChart} from "react-icons/md";
import './css files/SideBar.css';
import {useNavigate, useLocation} from "react-router-dom";


export function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const analyticsPath = isAdmin ? '/admin-analytics' : '/user-insights';
  const analyticsPaths = ['/admin-analytics', '/user-insights'];

  return (
    <nav className="sidebar">
    <div className="sidebar-panel">
    <ul>
        {isAdmin && (
            <li className={location.pathname === '/admin' ? 'active' : ''} onClick={() => navigate('/admin')}>
                <MdAdminPanelSettings/>
                <span>Admin Dashboard</span>
            </li>
        )}
        <li className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => navigate('/dashboard')}>
            <MdDashboard/>
            <span>My Dashboard</span>
        </li>
        <li className={location.pathname === '/my-events' ? 'active' : ''} onClick={() => navigate('/my-events')}>
            <MdEvent/>
            <span>My Events</span>
        </li>
        <li className={location.pathname === '/saved-events' ? 'active' : ''} onClick={() => navigate('/saved-events')}>
            <MdFavorite/>
            <span>My Favourite Events</span>
        </li>
        <li className={analyticsPaths.includes(location.pathname) ? 'active' : ''} onClick={() => navigate(analyticsPath)}>
            <MdBarChart/>
            <span>Analytics</span>
        </li>
        <li className={location.pathname === '/profile' ? 'active' : ''} onClick={() => navigate('/profile')}>
            <MdPerson/>
            <span>My Profile</span>
        </li>
    </ul>
    </div>
</nav>
  )
}
