import { useState, useEffect } from "react";
import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import "./AnalyticsPage.css";

const COLORS = ["#9b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"];

export const AnalyticsPage = () => {
  const [tab, setTab] = useState("events");
  const [eventTrends, setEventTrends] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [locationDist, setLocationDist] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    fetch("http://localhost:3001/api/analytics/event-trends")
      .then((r) => r.json())
      .then(setEventTrends)
      .catch(() => {});

    fetch("http://localhost:3001/api/analytics/popular-events")
      .then((r) => r.json())
      .then(setPopularEvents)
      .catch(() => {});

    fetch("http://localhost:3001/api/analytics/location-distribution")
      .then((r) => r.json())
      .then(setLocationDist)
      .catch(() => {});

    if (isAdmin) {
      fetch("http://localhost:3001/api/analytics/user-growth")
        .then((r) => r.json())
        .then(setUserGrowth)
        .catch(() => {});
    }
  }, [isAdmin]);

  return (
    <>
      <NavigationBar />
      <div className="analytics-page-body">
        <SideBar />
        <div className="analytics-content">
          <h1>Analytics</h1>

          {/* Tab switcher — only visible to admin */}
          {isAdmin && (
            <div className="analytics-tabs">
              <button
                className={tab === "events" ? "tab-btn active" : "tab-btn"}
                onClick={() => setTab("events")}
              >
                Event Insights
              </button>
              <button
                className={tab === "users" ? "tab-btn active" : "tab-btn"}
                onClick={() => setTab("users")}
              >
                User Reports
              </button>
            </div>
          )}

          {/* Events tab (visible to all users, and admin when on "events" tab) */}
          {tab === "events" && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2>Event Trends</h2>
                <p className="analytics-subtitle">Events created per month</p>
                {eventTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eventTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#9b5cf6"
                        strokeWidth={2}
                        name="Events"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No event data available</p>
                )}
              </div>

              <div className="analytics-card">
                <h2>Popular Events</h2>
                <p className="analytics-subtitle">Top events by saves</p>
                {popularEvents.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={popularEvents} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        dataKey="eventName"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="saveCount" name="Saves">
                        {popularEvents.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No save data available</p>
                )}
              </div>

              <div className="analytics-card">
                <h2>Events by Location</h2>
                <p className="analytics-subtitle">Event count per city</p>
                {locationDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={locationDist}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Events">
                        {locationDist.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No location data available</p>
                )}
              </div>
            </div>
          )}

          {/* Users tab — admin only */}
          {isAdmin && tab === "users" && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2>User Growth</h2>
                <p className="analytics-subtitle">New registrations per month</p>
                {userGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        name="New Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No user data available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
