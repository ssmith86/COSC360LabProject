import { Navigate } from "react-router-dom";

export const AnalyticsPage = () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return <Navigate to={isAdmin ? "/admin-analytics" : "/insights"} replace />;
};
