import {useState} from "react";
import {MdDashboard, MdEvent, MdFavorite, MdPerson, MdAdminPanelSettings, MdBarChart} from "react-icons/md";
import {MdArrowForward, MdArrowBack} from "react-icons/md";
import './css files/SideBar.css';
import {useNavigate, useLocation} from "react-router-dom";


export function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const[collapsed, setCollapsed] = useState(false);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const analyticsPath = isAdmin ? '/admin-analytics' : '/user-insights';
  const analyticsPaths = ['/admin-analytics', '/user-insights'];

  return (
    <nav className={collapsed ? "sidebar collapsed" : "sidebar"}>
    {/* nav links */}
    <ul>
        {isAdmin && (
            <li className={location.pathname === '/admin' ? 'active' : ''} onClick={() => navigate('/admin')}>
                <MdAdminPanelSettings/>
                {!collapsed && <span>Admin Dashboard</span>}
            </li>
        )}
        <li className={location.pathname === '/dashboard' ? 'active' : ''} onClick={() => navigate('/dashboard')}>
            <MdDashboard/>
            {!collapsed && <span>My Dashboard</span>}
        </li>
        <li className={location.pathname === '/my-events' ? 'active' : ''} onClick={() => navigate('/my-events')}>
            <MdEvent/>
            {!collapsed && <span>My Events</span>}
        </li>
        <li className={location.pathname === '/saved-events' ? 'active' : ''} onClick={() => navigate('/saved-events')}>
            <MdFavorite/>
            {!collapsed && <span>My Favourite Events</span>}
        </li>
        <li className={analyticsPaths.includes(location.pathname) ? 'active' : ''} onClick={() => navigate(analyticsPath)}>
            <MdBarChart/>
            {!collapsed && <span>Analytics</span>}
        </li>
        <li className={location.pathname === '/profile' ? 'active' : ''} onClick={() => navigate('/profile')}>
            <MdPerson/>
            {!collapsed && <span>My Profile</span>}
        </li>
    </ul>
    {/* collapse button at the bottom */}
    <button className="collapse-button" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <MdArrowForward/> : <MdArrowBack/>}
    </button>
</nav>
  )
}
