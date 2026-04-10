import { useState, useEffect, useCallback } from "react";
import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./AnalyticsPage.css";

const COLORS = [
  "#9b5cf6",
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",
  "#4c1d95",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
  "#ede9fe",
  "#f5f3ff",
];

const PRESETS = [
  { label: "3D", days: 3 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
  { label: "All", days: null },
];

function getPresetRange(days) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function buildQuery(from, to) {
  const params = new URLSearchParams();
  const userId = localStorage.getItem("userId");
  if (userId) params.set("userId", userId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const API = "/api/analytics";

export const AdminAnalyticsPage = () => {
  const [tab, setTab] = useState("events");
  const [activePreset, setActivePreset] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [eventTotalSummary, setEventTotalSummary] = useState(null);
  const [userTotalSummary, setUserTotalSummary] = useState(null);

  const [publishTrends, setPublishTrends] = useState([]);
  const [publishGranularity, setPublishGranularity] = useState("month");
  const [startTrends, setStartTrends] = useState([]);
  const [startGranularity, setStartGranularity] = useState("month");
  const [saveTrends, setSaveTrends] = useState([]);
  const [saveGranularity, setSaveGranularity] = useState("month");
  const [popularEvents, setPopularEvents] = useState([]);
  const [mostActiveCreators, setMostActiveCreators] = useState([]);
  const [mostPopularCreators, setMostPopularCreators] = useState([]);
  const [locationDist, setLocationDist] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [userGrowthGranularity, setUserGrowthGranularity] = useState("month");
  const [publishedInPeriod, setPublishedInPeriod] = useState(null);
  const [savedInPeriod, setSavedInPeriod] = useState(null);
  const [commentedInPeriod, setCommentedInPeriod] = useState(undefined);
  const [userPeriodSummary, setUserPeriodSummary] = useState(null);
  const [hotEventsTrend, setHotEventsTrend] = useState({ events: [], data: [] });
  const [hotGranularity, setHotGranularity] = useState("month");
  const [commentTrends, setCommentTrends] = useState([]);
  const [commentGranularity, setCommentGranularity] = useState("month");

  const getRange = useCallback(() => {
    if (activePreset === "custom") {
      return { from: startDate, to: endDate };
    }
    const preset = PRESETS.find((p) => p.label === activePreset);
    if (!preset || preset.days === null) return { from: "", to: "" };
    return getPresetRange(preset.days);
  }, [activePreset, startDate, endDate]);

  useEffect(() => {
    const qs = buildQuery("", "");
    fetch(`${API}/event-total-summary${qs}`)
      .then((r) => r.json())
      .then(setEventTotalSummary)
      .catch(() => {});
    fetch(`${API}/user-total-summary${qs}`)
      .then((r) => r.json())
      .then(setUserTotalSummary)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const { from, to } = getRange();
    const qs = buildQuery(from, to);

    fetch(`${API}/event-trends${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setPublishTrends(d.data || []);
        setPublishGranularity(d.granularity || "month");
      })
      .catch(() => {});
    fetch(`${API}/event-start-trends${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setStartTrends(d.data || []);
        setStartGranularity(d.granularity || "month");
      })
      .catch(() => {});
    fetch(`${API}/save-trends${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setSaveTrends(d.data || []);
        setSaveGranularity(d.granularity || "month");
      })
      .catch(() => {});
    fetch(`${API}/popular-events${qs}`)
      .then((r) => r.json())
      .then(setPopularEvents)
      .catch(() => {});
    fetch(`${API}/most-active-creators${qs}`)
      .then((r) => r.json())
      .then(setMostActiveCreators)
      .catch(() => {});
    fetch(`${API}/most-popular-creators${qs}`)
      .then((r) => r.json())
      .then(setMostPopularCreators)
      .catch(() => {});
    fetch(`${API}/location-distribution${qs}`)
      .then((r) => r.json())
      .then(setLocationDist)
      .catch(() => {});
    fetch(`${API}/event-period-summary${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setPublishedInPeriod(d.publishedInPeriod || 0);
        setSavedInPeriod(d.savedInPeriod || 0);
        setCommentedInPeriod(d.commentedInPeriod);
      })
      .catch(() => {});
    fetch(`${API}/user-growth${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setUserGrowth(d.data || []);
        setUserGrowthGranularity(d.granularity || "month");
      })
      .catch(() => {});
    fetch(`${API}/user-period-summary${qs}`)
      .then((r) => r.json())
      .then(setUserPeriodSummary)
      .catch(() => {});
    fetch(`${API}/hot-events-trend${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setHotEventsTrend({ events: d.events || [], data: d.data || [] });
        setHotGranularity(d.granularity || "month");
      })
      .catch(() => {});
    fetch(`${API}/comment-trends${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setCommentTrends(d.data || []);
        setCommentGranularity(d.granularity || "month");
      })
      .catch(() => {});
  }, [getRange]);

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

            <div className="filter-panel">
              <div className="date-filter">
                <div className="date-filter-presets">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      className={
                        activePreset === p.label
                          ? "preset-btn active"
                          : "preset-btn"
                      }
                      onClick={() => handlePreset(p.label)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="date-filter-custom">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button
                    className="preset-btn custom-apply"
                    onClick={handleCustomApply}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {tab === "events" && (
            <div className="summary-row fixed-summary">
              <div className="metric-card metric-card--highlighted">
                <span className="summary-number">
                  {eventTotalSummary?.totalEvents ?? "..."}
                </span>
                <span className="summary-label">Total Events</span>
              </div>
              <div className="metric-card metric-card--highlighted">
                <span className="summary-number">
                  {eventTotalSummary?.totalSaves ?? "..."}
                </span>
                <span className="summary-label">Total Saves</span>
              </div>
              <div className="metric-card metric-card--highlighted">
                <span className="summary-number">
                  {eventTotalSummary
                    ? (eventTotalSummary.totalComments ?? "N/A")
                    : "..."}
                </span>
                <span className="summary-label">Total Comments</span>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="summary-row fixed-summary">
              <div className="metric-card metric-card--highlighted">
                <span className="summary-number">
                  {userTotalSummary?.totalUsers ?? "..."}
                </span>
                <span className="summary-label">Total Users</span>
              </div>
              <div className="metric-card metric-card--highlighted">
                <span className="summary-number">
                  {userTotalSummary?.activeUsers ?? "..."}
                </span>
                <span className="summary-label">Total Active</span>
              </div>
              <div className="metric-card metric-card--highlighted">
                <span className="summary-number">
                  {userTotalSummary?.bannedUsers ?? "..."}
                </span>
                <span className="summary-label">Total Banned</span>
              </div>
            </div>
          )}

          {tab === "events" && (
            <div className="summary-row period-summary">
              <div className="metric-card">
                <span className="summary-number">
                  {publishedInPeriod ?? "..."}
                </span>
                <span className="summary-label">
                  Events Published in Period
                </span>
              </div>
              <div className="metric-card">
                <span className="summary-number">{savedInPeriod ?? "..."}</span>
                <span className="summary-label">Saves in Period</span>
              </div>
              <div className="metric-card">
                <span className="summary-number">
                  {commentedInPeriod === undefined
                    ? "..."
                    : (commentedInPeriod ?? "N/A")}
                </span>
                <span className="summary-label">Comments in Period</span>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="summary-row period-summary">
              <div className="metric-card">
                <span className="summary-number">
                  {userPeriodSummary?.activeInPeriod ?? "..."}
                </span>
                <span className="summary-label">Active Users in Period</span>
              </div>
              <div className="metric-card">
                <span className="summary-number">
                  {userPeriodSummary?.inactiveInPeriod ?? "..."}
                </span>
                <span className="summary-label">Inactive Users in Period</span>
              </div>
              <div className="metric-card">
                <span className="summary-number">
                  {userPeriodSummary?.bannedInPeriod ?? "..."}
                </span>
                <span className="summary-label">Banned Users in Period</span>
              </div>
            </div>
          )}

          {tab === "events" && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2>Event Trends</h2>
                <p className="analytics-subtitle">
                  Events published per {publishGranularity}
                </p>
                {publishTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={publishTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
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
                <h2>Event Schedule</h2>
                <p className="analytics-subtitle">
                  Events starting per {startGranularity}
                </p>
                {startTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={startTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6d28d9"
                        strokeWidth={2}
                        name="Events"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No event schedule data available</p>
                )}
              </div>

              <div className="analytics-card">
                <h2>Save Activity</h2>
                <p className="analytics-subtitle">
                  User saves per {saveGranularity}
                </p>
                {saveTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={saveTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        name="Saves"
                      />
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

              <div className="analytics-card">
                <h2>Comment Activity</h2>
                <p className="analytics-subtitle">
                  Comments posted per {commentGranularity}
                </p>
                {commentTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={commentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Comments" fill="#9b5cf6" barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No comment data available</p>
                )}
              </div>

              <div className="analytics-card analytics-card--full">
                <h2>Site Activity by Date</h2>
                <p className="analytics-subtitle">
                  Events, saves, and comments per {publishGranularity}
                </p>
                {(() => {
                  const labelSet = new Set([
                    ...publishTrends.map((d) => d.label),
                    ...saveTrends.map((d) => d.label),
                    ...commentTrends.map((d) => d.label),
                  ]);
                  const eventsMap = Object.fromEntries(publishTrends.map((d) => [d.label, d.count]));
                  const savesMap = Object.fromEntries(saveTrends.map((d) => [d.label, d.count]));
                  const commentsMap = Object.fromEntries(commentTrends.map((d) => [d.label, d.count]));
                  const combined = [...labelSet]
                    .sort()
                    .map((label) => ({
                      label,
                      Events: eventsMap[label] ?? 0,
                      Saves: savesMap[label] ?? 0,
                      Comments: commentsMap[label] ?? 0,
                    }));
                  return combined.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={combined}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="Events" stroke="#9b5cf6" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="Saves" stroke="#f59e0b" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="Comments" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="hot-events-table-wrapper">
                        <table className="hot-events-table">
                          <thead>
                            <tr>
                              <th>Period</th>
                              <th>Events</th>
                              <th>Saves</th>
                              <th>Comments</th>
                            </tr>
                          </thead>
                          <tbody>
                            {combined.map((row) => (
                              <tr key={row.label}>
                                <td>{row.label}</td>
                                <td>{row.Events}</td>
                                <td>{row.Saves}</td>
                                <td>{row.Comments}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p className="no-data">No activity data available</p>
                  );
                })()}
              </div>

              <div className="analytics-card analytics-card--full">
                <h2>Hot Events Trend</h2>
                <p className="analytics-subtitle">
                  Save activity for top 5 events per {hotGranularity}
                </p>
                {hotEventsTrend.data.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={hotEventsTrend.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        {hotEventsTrend.events.map((name, i) => (
                          <Line
                            key={name}
                            type="monotone"
                            dataKey={name}
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>

                    <div className="hot-events-table-wrapper">
                      <table className="hot-events-table">
                        <thead>
                          <tr>
                            <th>Period</th>
                            {hotEventsTrend.events.map((name) => (
                              <th key={name}>{name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {hotEventsTrend.data.map((row) => (
                            <tr key={row.label}>
                              <td>{row.label}</td>
                              {hotEventsTrend.events.map((name) => (
                                <td key={name}>{row[name] ?? 0}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="no-data">No hot events data available</p>
                )}
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2>User Growth</h2>
                <p className="analytics-subtitle">
                  New registrations per {userGrowthGranularity}
                </p>
                {userGrowth.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
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

              <div className="analytics-card">
                <h2>Most Active Creators</h2>
                <p className="analytics-subtitle">
                  Users with most events created
                </p>
                {mostActiveCreators.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mostActiveCreators} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        dataKey="creator"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="eventCount" name="Events">
                        {mostActiveCreators.map((_, i) => (
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
                <h2>Most Popular Creators</h2>
                <p className="analytics-subtitle">
                  Users whose events received the most saves
                </p>
                {mostPopularCreators.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mostPopularCreators} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        dataKey="creator"
                        type="category"
                        width={120}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="totalSaves" name="Total Saves">
                        {mostPopularCreators.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="no-data">No popularity data available</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
