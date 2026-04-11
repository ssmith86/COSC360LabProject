import { Navigate } from "react-router-dom";

// Add this ProtectedRoute component to resolve back button after logout
// bug, which could lead to previous logged-in cached view of a page
// that should not be displayed to un-logged-in users
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isLoggedIn) {
    // replace will replace browser history entry rather than pushing to it
    // so the back button on browser won't loop back to protected page
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    // replace will replace browser history entry rather than pushing to it
    // so the back button on browser won't loop back to protected page
    return <Navigate to="/my-events" replace />;
  }

  return children;
};
