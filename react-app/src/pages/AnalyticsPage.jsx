import { useState, useEffect, useCallback } from "react";
import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import "./AnalyticsPage.css";

const COLORS = ["#9b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"];

const PRESETS = [
  { label: "3D", days: 3 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

function getPresetRange(days) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: from.toISOString().split("T")[0], to: to.toISOString().split("T")[0] };
}

function buildQuery(from, to) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const API = "http://localhost:3001/api/analytics";

export const AnalyticsPage = () => {
  const [tab, setTab] = useState("events");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  // Time range filter state
  const [activePreset, setActivePreset] = useState("7D");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fixed data (no filter)
  const [eventSummary, setEventSummary] = useState(null);
  const [totalComments, setTotalComments] = useState(null);
  const [userSummary, setUserSummary] = useState(null);

  // Filtered data
  const [eventTrends, setEventTrends] = useState([]);
  const [eventGranularity, setEventGranularity] = useState("month");
  const [saveTrends, setSaveTrends] = useState([]);
  const [saveGranularity, setSaveGranularity] = useState("month");
  const [popularEvents, setPopularEvents] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [locationDist, setLocationDist] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [userGrowthGranularity, setUserGrowthGranularity] = useState("month");
  const [newInPeriod, setNewInPeriod] = useState(0);
  const [savesInPeriod, setSavesInPeriod] = useState(0);
  const [commentsInPeriod, setCommentsInPeriod] = useState(null);
  const [userActivity, setUserActivity] = useState(null);

  // Compute effective from/to
  const getRange = useCallback(() => {
    if (activePreset === "custom") {
      return { from: dateFrom, to: dateTo };
    }
    const preset = PRESETS.find((p) => p.label === activePreset);
    return preset ? getPresetRange(preset.days) : { from: "", to: "" };
  }, [activePreset, dateFrom, dateTo]);

  // Fetch fixed data once
  useEffect(() => {
    fetch(`${API}/event-summary`).then((r) => r.json()).then(setEventSummary).catch(() => {});
    fetch(`${API}/total-comments`).then((r) => r.json()).then((d) => setTotalComments(d.totalComments)).catch(() => {});
    if (isAdmin) {
      fetch(`${API}/user-summary`).then((r) => r.json()).then(setUserSummary).catch(() => {});
    }
  }, [isAdmin]);

  // Fetch filtered data whenever range changes
  useEffect(() => {
    const { from, to } = getRange();
    const qs = buildQuery(from, to);

    fetch(`${API}/event-trends${qs}`).then((r) => r.json()).then((d) => {
      setEventTrends(d.data || []);
      setEventGranularity(d.granularity || "month");
    }).catch(() => {});
    fetch(`${API}/save-trends${qs}`).then((r) => r.json()).then((d) => {
      setSaveTrends(d.data || []);
      setSaveGranularity(d.granularity || "month");
    }).catch(() => {});
    fetch(`${API}/popular-events${qs}`).then((r) => r.json()).then(setPopularEvents).catch(() => {});
    fetch(`${API}/top-creators${qs}`).then((r) => r.json()).then(setTopCreators).catch(() => {});
    fetch(`${API}/location-distribution${qs}`).then((r) => r.json()).then(setLocationDist).catch(() => {});
    fetch(`${API}/event-summary${qs}`).then((r) => r.json()).then((d) => {
      setNewInPeriod(d.newInPeriod || 0);
      setSavesInPeriod(d.savesInPeriod || 0);
      setCommentsInPeriod(d.commentsInPeriod);
    }).catch(() => {});

    if (isAdmin) {
      fetch(`${API}/user-growth${qs}`).then((r) => r.json()).then((d) => {
        setUserGrowth(d.data || []);
        setUserGrowthGranularity(d.granularity || "month");
      }).catch(() => {});
      fetch(`${API}/user-activity-breakdown${qs}`).then((r) => r.json()).then(setUserActivity).catch(() => {});
    }
  }, [getRange, isAdmin]);

  const handlePreset = (label) => {
    setActivePreset(label);
  };

  const handleCustomApply = () => {
    setActivePreset("custom");
  };

  return (
    <>
      <NavigationBar />
      <div className="analytics-page-body">
        <SideBar />
        <div className="analytics-content">
          <h1>Analytics</h1>

          <div className="analytics-toolbar">
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

            <div className="date-filter">
              <div className="date-filter-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    className={activePreset === p.label ? "preset-btn active" : "preset-btn"}
                    onClick={() => handlePreset(p.label)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="date-filter-custom">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
                <button className="preset-btn custom-apply" onClick={handleCustomApply}>
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* ===== Fixed Summary Cards ===== */}
          {tab === "events" && eventSummary && (
            <div className="summary-row">
              <div className="summary-card">
                <span className="summary-number">{eventSummary.totalEvents}</span>
                <span className="summary-label">Total Events</span>
              </div>
              <div className="summary-card">
                <span className="summary-number">{eventSummary.totalSaves}</span>
                <span className="summary-label">Total Saves</span>
              </div>
              <div className="summary-card">
                <span className="summary-number">{totalComments !== null ? totalComments : "N/A"}</span>
                <span className="summary-label">Total Comments</span>
              </div>
            </div>
          )}

          {isAdmin && tab === "users" && userSummary && (
            <div className="summary-row">
              <div className="summary-card">
                <span className="summary-number">{userSummary.totalUsers}</span>
                <span className="summary-label">Total Users</span>
              </div>
              <div className="summary-card">
                <span className="summary-number">{userSummary.activeUsers}</span>
                <span className="summary-label">Total Active</span>
              </div>
              <div className="summary-card">
                <span className="summary-number">{userSummary.bannedUsers}</span>
                <span className="summary-label">Total Banned</span>
              </div>
            </div>
          )}

          {/* ===== Filtered Period Summary ===== */}
          {tab === "events" && (
            <div className="summary-row period-summary">
              <div className="summary-card accent">
                <span className="summary-number">{newInPeriod}</span>
                <span className="summary-label">New Events in Period</span>
              </div>
              <div className="summary-card accent">
                <span className="summary-number">{savesInPeriod}</span>
                <span className="summary-label">Saves in Period</span>
              </div>
              <div className="summary-card accent">
                <span className="summary-number">{commentsInPeriod !== null ? commentsInPeriod : "N/A"}</span>
                <span className="summary-label">Comments in Period</span>
              </div>
            </div>
          )}

          {isAdmin && tab === "users" && userActivity && (
            <div className="summary-row period-summary">
              <div className="summary-card accent">
                <span className="summary-number">{userActivity.activeInRange}</span>
                <span className="summary-label">Active Users in Period</span>
              </div>
              <div className="summary-card accent">
                <span className="summary-number">{userActivity.inactiveInRange}</span>
                <span className="summary-label">Inactive Users in Period</span>
              </div>
              <div className="summary-card accent">
                <span className="summary-number">{userActivity.banned}</span>
                <span className="summary-label">Banned Users in Period</span>
              </div>
            </div>
          )}

          {/* ===== Events Tab ===== */}
          {tab === "events" && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2>Event Trends</h2>
                <p className="analytics-subtitle">Events created per {eventGranularity}</p>
                {eventTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eventTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#9b5cf6" strokeWidth={2} name="Events" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No event data available</p>
                )}
              </div>

              <div className="analytics-card">
                <h2>Save Activity</h2>
                <p className="analytics-subtitle">User saves per {saveGranularity}</p>
                {saveTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={saveTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} name="Saves" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No save data available</p>
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
                      <YAxis dataKey="eventName" type="category" width={120} tick={{ fontSize: 12 }} />
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
                <h2>Most Active Creators</h2>
                <p className="analytics-subtitle">Users with most events created</p>
                {topCreators.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCreators} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="creator" type="category" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="eventCount" name="Events">
                        {topCreators.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No creator data available</p>
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

          {/* ===== Users Tab (Admin Only) ===== */}
          {isAdmin && tab === "users" && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2>User Growth</h2>
                <p className="analytics-subtitle">New registrations per {userGrowthGranularity}</p>
                {userGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} name="New Users" />
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
