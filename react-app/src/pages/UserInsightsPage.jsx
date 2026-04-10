import { useState, useEffect, useCallback } from "react";
import { NavigationBar } from "../components/NavigationBar";
import { SideBar } from "../components/SideBar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

const API = "/api/analytics";

export const UserInsightsPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activePreset, setActivePreset] = useState("All");

  const [popularEvents, setPopularEvents] = useState([]);
  const [mostActiveCreators, setMostActiveCreators] = useState([]);
  const [locationDist, setLocationDist] = useState([]);

  const getRange = useCallback(() => {
    if (activePreset === "custom") {
      return { from: startDate, to: endDate };
    }
    const preset = PRESETS.find((p) => p.label === activePreset);
    if (!preset || preset.days === null) return { from: "", to: "" };
    return getPresetRange(preset.days);
  }, [activePreset, startDate, endDate]);

  useEffect(() => {
    const { from, to } = getRange();
    const qs = buildQuery(from, to);

    fetch(`${API}/popular-events${qs}`)
      .then((r) => r.json())
      .then(setPopularEvents)
      .catch(() => {});
    fetch(`${API}/most-active-creators${qs}`)
      .then((r) => r.json())
      .then(setMostActiveCreators)
      .catch(() => {});
    fetch(`${API}/location-distribution${qs}`)
      .then((r) => r.json())
      .then(setLocationDist)
      .catch(() => {});
  }, [getRange]);

  return (
    <>
      <NavigationBar />
      <div className="analytics-page-body">
        <SideBar />
        <div className="analytics-content">
          <h1>Insights</h1>

          <div className="analytics-toolbar">
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
                      onClick={() => setActivePreset(p.label)}
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
                    onClick={() => setActivePreset("custom")}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
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
                <p className="no-data">No event data available</p>
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
          </div>
        </div>
      </div>
    </>
  );
};
