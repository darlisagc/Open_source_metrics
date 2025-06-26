import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const METRICS = [
  "GitHub Stars",
  "GitHub Forks",
  "GitHub Contributors",
  "GitHub Pull Requests (PRs) Merged",
  "Number of Releases",
  "Downloads",
];
const METRIC_COLORS = [
  "#2563eb", // Stars - blue
  "#16a34a", // Forks - green
  "#f59e42", // Contributors - orange
  "#d946ef", // PRs Merged - purple
  "#dc2626", // Releases - red
  "#818cf8", // Downloads - indigo
];

export default function Dashboard() {
  const [history, setHistory] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [availableDates, setAvailableDates] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  // Custom scrollbar styling (Chrome/Safari/Edge)
  useEffect(() => {
    if (!document.getElementById("custom-scrollbar-style")) {
      const style = document.createElement("style");
      style.id = "custom-scrollbar-style";
      style.innerHTML = `
        .date-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: #e5e7eb;
        }
        .date-scrollbar::-webkit-scrollbar-thumb {
          background: #818cf8;
          border-radius: 7px;
        }
        .date-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #818cf8 #e5e7eb;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    fetch("./metrics_history.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch metrics data.");
        return res.json();
      })
      .then((data) => {
        setHistory(data);
        const projectNames = Object.keys(data);
        const firstProject = projectNames[0];
        setAvailableProjects(projectNames);
        setSelectedProject(firstProject);
        setAvailableDates(data[firstProject]?.dates || []);
        setSelectedDates([]);
      })
      .catch(() => {
        setError("Could not load metrics data.");
      });
  }, []);

  useEffect(() => {
    if (!history || !selectedProject) return;
    setAvailableDates(history[selectedProject]?.dates || []);
    setSelectedDates([]);
  }, [history, selectedProject]);

  useEffect(() => {
    if (!selectedProject || !history || selectedDates.length === 0) {
      setChartData([]);
      return;
    }
    const values = history[selectedProject];
    if (!values || !Array.isArray(values.dates)) return;

    // Chart points
    const points = selectedDates.map((date) => {
      const index = values.dates.indexOf(date);
      const point = { date };
      METRICS.forEach((metric) => {
        const metricValues = values.data[metric] || [];
        if (index !== -1 && metricValues[index] !== undefined) {
          const raw = metricValues[index].toString();
          const parsed = parseInt(raw.match(/\d+/g)?.[0] || 0);
          point[metric] = parsed;
        }
      });
      return point;
    });
    setChartData(points);

  }, [history, selectedProject, selectedDates]);

  const toggleDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  // Card styling for totals
  const metricCard = (color) => ({
    background: color + "22",
    borderRadius: 15,
    padding: "16px 18px",
    minWidth: 165,
    margin: "5px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    boxShadow: "0 1px 5px rgba(0,0,0,0.04)",
    border: `1.5px solid ${color}33`,
    height: 92
  });

  if (error) {
    return (
      <div style={{
        color: "#dc2626",
        background: "#fee2e2",
        borderRadius: 12,
        padding: 24,
        maxWidth: 480,
        margin: "60px auto",
        textAlign: "center"
      }}>
        <b>Error:</b> {error}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      // Cardano Foundation brand gradient & font!
      background: "#F5F6FA",
      fontFamily: "Switzer, Helvetica Neue, Arial, sans-serif"
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          color: "#1e293b",
          marginBottom: 8,
          letterSpacing: "-0.03em"
        }}>
          📊 Open Source Metrics Dashboard
        </h1>
        <div style={{ color: "#64748b", marginBottom: 32, fontSize: "1.1rem" }}>
          Monitor and compare open source growth and activity across your projects.
        </div>

        {/* Controls */}
        <div style={{
          display: "flex",
          gap: 32,
          marginBottom: 20,
          width: "100%",
          maxWidth: 1100
        }}>
          {/* Project Select */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 14px rgba(30,41,59,0.09)",
            padding: 22,
            flex: 1,
            maxWidth: 520,
            minWidth: 270
          }}>
            <label style={{ fontWeight: 600, marginBottom: 8, display: "block", color: "#334155" }}>
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 15,
                color: "#22223b",
                background: "#f9fafb"
              }}
            >
              {availableProjects.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 14px rgba(30,41,59,0.09)",
            padding: 22,
            flex: 1,
            maxWidth: 520,
            minWidth: 270
          }}>
            <label style={{ fontWeight: 600, marginBottom: 8, display: "block", color: "#334155" }}>
              Select Dates
            </label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "#dbeafe",
                  color: "#1e40af",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                type="button"
                onClick={() => setSelectedDates([...availableDates])}
              >
                Select all
              </button>
              <button
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "#f3f4f6",
                  color: "#334155",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
                type="button"
                onClick={() => setSelectedDates([])}
              >
                Clear all
              </button>
            </div>
            <div
              className="date-scrollbar"
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "10px 12px",
                height: 94,
                overflowY: "scroll",
                background: "#f8fafc"
              }}>
              {availableDates.map((date) => (
                <label
                  key={date}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    padding: "7px 3px",
                    borderRadius: 7,
                    background: selectedDates.includes(date) ? "#eff6ff" : "transparent",
                    fontWeight: selectedDates.includes(date) ? 600 : 400,
                    color: "#334155"
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      toggleDate(date);
                    }
                  }}
                  onClick={e => {
                    if (e.target.tagName !== "INPUT") toggleDate(date);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDates.includes(date)}
                    onChange={() => toggleDate(date)}
                    style={{
                      height: 18,
                      width: 18,
                      accentColor: "#2563eb",
                      marginRight: 10,
                      cursor: "pointer"
                    }}
                    tabIndex={-1}
                  />
                  <span>{date}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Totals (Summary) Card - now showing  */}
        {selectedDates.length > 1 && history && (
          <div style={{
            background: "#f8fafc",
            borderRadius: 16,
            boxShadow: "0 2px 14px rgba(30,41,59,0.09)",
            marginBottom: 22,
            border: "1.5px solid #e0e7ef",
            padding: 22
          }}>
            <div style={{
              fontWeight: 700,
              fontSize: "1.18rem",
              marginBottom: 14,
              color: "#1e293b"
            }}>
              🧮 Progress over time
            </div>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              alignItems: "stretch",
              justifyContent: "center",
            }}>
              {(() => {
                const sortedDates = [...selectedDates].sort();
                const initialDate = sortedDates[0];
                const latestDate = sortedDates[sortedDates.length - 1];
                return METRICS.map((metric, idx) => {
                  const metricValues = history?.[selectedProject]?.data?.[metric] || [];
                  const dateList = history?.[selectedProject]?.dates || [];
                  const initialIdx = dateList.indexOf(initialDate);
                  const latestIdx = dateList.indexOf(latestDate);
                  const initialValue = initialIdx >= 0 ? parseInt((metricValues[initialIdx] ?? "0").toString().replace(/[^\d]/g, "")) : 0;
                  const latestValue = latestIdx >= 0 ? parseInt((metricValues[latestIdx] ?? "0").toString().replace(/[^\d]/g, "")) : 0;
                  const diff = latestValue - initialValue;
                  const diffSign = diff > 0 ? "+" : diff < 0 ? "−" : "";
                  const diffColor = diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#64748b";
                  // Calculate percent change
                  const percent = initialValue === 0 ? 0 : (diff / initialValue) * 100;
                  const percentSign = percent > 0 ? "+" : percent < 0 ? "−" : "";
                  const percentString = initialValue === 0
                    ? "n/a"
                    : `${percentSign}${Math.abs(percent).toFixed(1)}%`;
                  return (
                    <div key={metric} style={metricCard(METRIC_COLORS[idx])}>
                      <div style={{
                        fontWeight: 600,
                        color: METRIC_COLORS[idx],
                        fontSize: "1.05rem",
                        marginBottom: 6
                      }}>
                        {metric}
                      </div>
                      <div style={{
                        fontWeight: 900,
                        fontSize: 22,
                        letterSpacing: 1,
                        color: "#1e293b"
                      }}>
                        {initialValue} → {latestValue}
                      </div>
                      <div style={{
                        color: diffColor,
                        fontWeight: 700,
                        marginTop: 3,
                        fontSize: 17
                      }}>
                        {diff === 0 ? "No change" : (
                          <>
                            {diff > 0 ? "▲ " : diff < 0 ? "▼ " : ""}{diffSign}{Math.abs(diff)}
                            <span style={{ fontSize: 15, opacity: 0.8 }}>
                              {" "}{percentString}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            {/* This line kept as requested */}
            <div style={{ marginTop: 18, color: "#64748b", fontSize: 13 }}>
              Comparing: <b>{(() => {
                const sortedDates = [...selectedDates].sort();
                return `${sortedDates[0]} → ${sortedDates[sortedDates.length - 1]}`;
              })()}</b>
            </div>
          </div>
        )}

        {/* Main Metric Trends Line Chart */}
        {chartData.length > 0 && (
          <div style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 14px rgba(30,41,59,0.09)",
            padding: 28,
            marginBottom: 36
          }}>
            <div style={{
              fontWeight: 700,
              fontSize: "1.18rem",
              color: "#1e293b",
              marginBottom: 18
            }}>
              📈 Metric Trends
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#4B5563"
                  tickMargin={18}
                />
                <YAxis stroke="#4B5563" />
                <Tooltip />
                {/* Built-in legend removed */}
                {METRICS.map((metric, idx) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={METRIC_COLORS[idx % METRIC_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            {/* Divider line between axis and legend */}
            <div style={{
              borderTop: "2px solid #e5e7eb",
              margin: "18px 0 10px 0"
            }}></div>
            {/* Custom Legend with colorful text */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8
            }}>
              {METRICS.map((metric, idx) => (
                <span key={metric} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginRight: 12,
                  fontSize: 15,
                  color: METRIC_COLORS[idx],
                  fontWeight: 600
                }}>
                  <span style={{
                    display: "inline-block",
                    width: 16,
                    height: 4,
                    background: METRIC_COLORS[idx],
                    borderRadius: 2
                  }}></span>
                  {metric}
                </span>
              ))}
            </div>
          </div>
        )}

        <footer style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 14,
          marginTop: 36,
          marginBottom: 0,
          opacity: 0.8
        }}>
          &copy; {new Date().getFullYear()} Open Source Metrics Dashboard
        </footer>
      </div>
    </div>
  );
}
