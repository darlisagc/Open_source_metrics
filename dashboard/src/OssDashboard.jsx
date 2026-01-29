import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"

const METRICS = [
  "GitHub Stars",
  "GitHub Forks",
  "GitHub Contributors",
  "GitHub Pull Requests (PRs) Merged",
  "Number of Releases",
  "Downloads",
]

const METRIC_COLORS = {
  "GitHub Stars": "#f59e0b",
  "GitHub Forks": "#10b981",
  "GitHub Contributors": "#3b82f6",
  "GitHub Pull Requests (PRs) Merged": "#8b5cf6",
  "Number of Releases": "#ef4444",
  "Downloads": "#06b6d4",
}

const METRIC_ICONS = {
  "GitHub Stars": "★",
  "GitHub Forks": "⑂",
  "GitHub Contributors": "👥",
  "GitHub Pull Requests (PRs) Merged": "⎇",
  "Number of Releases": "📦",
  "Downloads": "⬇",
}

function MetricCard({ metric, initialValue, latestValue, color }) {
  const diff = latestValue - initialValue
  const percent = initialValue === 0 ? 0 : (diff / initialValue) * 100
  const isPositive = diff > 0
  const isNegative = diff < 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 min-w-[160px] flex-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{METRIC_ICONS[metric]}</span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {metric.replace("GitHub ", "").replace(" (PRs)", "")}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {latestValue.toLocaleString()}
      </div>
      <div className={`text-sm font-medium flex items-center gap-1 ${
        isPositive ? 'text-emerald-600 dark:text-emerald-400' :
        isNegative ? 'text-red-600 dark:text-red-400' :
        'text-slate-500 dark:text-slate-400'
      }`}>
        {isPositive && <span>↑</span>}
        {isNegative && <span>↓</span>}
        {diff === 0 ? (
          <span>No change</span>
        ) : (
          <>
            <span>{Math.abs(diff).toLocaleString()}</span>
            <span className="text-slate-400 dark:text-slate-500">
              ({isPositive ? '+' : ''}{percent.toFixed(1)}%)
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  )
}

export default function OssDashboard({ darkMode, setDarkMode }) {
  const [history, setHistory] = useState(null)
  const [selectedDates, setSelectedDates] = useState([])
  const [selectedProject, setSelectedProject] = useState("")
  const [availableDates, setAvailableDates] = useState([])
  const [availableProjects, setAvailableProjects] = useState([])
  const [chartData, setChartData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("./metrics_history.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch metrics data.")
        return res.json()
      })
      .then((data) => {
        setHistory(data)
        const projectNames = Object.keys(data).sort()
        const firstProject = projectNames[0]
        setAvailableProjects(projectNames)
        setSelectedProject(firstProject)
        setAvailableDates(data[firstProject]?.dates || [])
        // Select all dates by default
        setSelectedDates(data[firstProject]?.dates || [])
        setLoading(false)
      })
      .catch((err) => {
        setError("Could not load metrics data.")
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!history || !selectedProject) return
    const dates = history[selectedProject]?.dates || []
    setAvailableDates(dates)
    setSelectedDates(dates)
  }, [history, selectedProject])

  useEffect(() => {
    if (!selectedProject || !history || selectedDates.length === 0) {
      setChartData([])
      return
    }
    const values = history[selectedProject]
    if (!values || !Array.isArray(values.dates)) return

    const points = selectedDates
      .filter(date => values.dates.includes(date))
      .sort((a, b) => {
        // Parse DD/MM/YYYY format
        const [dayA, monthA, yearA] = a.split('/')
        const [dayB, monthB, yearB] = b.split('/')
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
      })
      .map((date) => {
        const index = values.dates.indexOf(date)
        const point = { date }
        METRICS.forEach((metric) => {
          const metricValues = values.data[metric] || []
          if (index !== -1 && metricValues[index] !== undefined) {
            const raw = metricValues[index].toString()
            const parsed = parseInt(raw.match(/\d+/g)?.[0] || 0)
            point[metric] = parsed
          }
        })
        return point
      })
    setChartData(points)
  }, [history, selectedProject, selectedDates])

  const toggleDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    )
  }

  const getMetricProgress = () => {
    if (!history || !selectedProject || selectedDates.length < 2) return null

    const sortedDates = [...selectedDates].sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/')
      const [dayB, monthB, yearB] = b.split('/')
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
    })

    const initialDate = sortedDates[0]
    const latestDate = sortedDates[sortedDates.length - 1]
    const dateList = history[selectedProject]?.dates || []
    const initialIdx = dateList.indexOf(initialDate)
    const latestIdx = dateList.indexOf(latestDate)

    return METRICS.map((metric) => {
      const metricValues = history[selectedProject]?.data?.[metric] || []
      const initialValue = initialIdx >= 0
        ? parseInt((metricValues[initialIdx] ?? "0").toString().replace(/[^\d]/g, ""))
        : 0
      const latestValue = latestIdx >= 0
        ? parseInt((metricValues[latestIdx] ?? "0").toString().replace(/[^\d]/g, ""))
        : 0
      return { metric, initialValue, latestValue }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading metrics...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md text-center">
          <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
        </div>
      </div>
    )
  }

  const metricProgress = getMetricProgress()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Open Source Metrics
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Monitor growth and activity across Cardano Foundation projects
            </p>
          </div>
          <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Project Select */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            >
              {availableProjects.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Dates
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSelectedDates([...availableDates])}
                className="px-3 py-1.5 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedDates([])}
                className="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-900 rounded-lg p-2 border border-slate-200 dark:border-slate-600">
              {availableDates.map((date) => (
                <label
                  key={date}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                    selectedDates.includes(date)
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDates.includes(date)}
                    onChange={() => toggleDate(date)}
                    className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                  />
                  <span className={`text-sm ${
                    selectedDates.includes(date)
                      ? 'font-medium text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {date}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        {metricProgress && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Progress Overview
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {selectedDates.length > 1 && (() => {
                  const sortedDates = [...selectedDates].sort((a, b) => {
                    const [dayA, monthA, yearA] = a.split('/')
                    const [dayB, monthB, yearB] = b.split('/')
                    return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
                  })
                  return `${sortedDates[0]} → ${sortedDates[sortedDates.length - 1]}`
                })()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {metricProgress.map(({ metric, initialValue, latestValue }) => (
                <MetricCard
                  key={metric}
                  metric={metric}
                  initialValue={initialValue}
                  latestValue={latestValue}
                  color={METRIC_COLORS[metric]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Metric Trends
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis
                  dataKey="date"
                  stroke={darkMode ? '#94a3b8' : '#64748b'}
                  tick={{ fontSize: 12 }}
                  tickMargin={12}
                />
                <YAxis
                  stroke={darkMode ? '#94a3b8' : '#64748b'}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: darkMode ? '#f1f5f9' : '#1e293b', fontWeight: 600 }}
                  itemStyle={{ color: darkMode ? '#cbd5e1' : '#475569' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {value.replace("GitHub ", "").replace(" (PRs)", "")}
                    </span>
                  )}
                />
                {METRICS.map((metric) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={METRIC_COLORS[metric]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: METRIC_COLORS[metric] }}
                    activeDot={{ r: 5, fill: METRIC_COLORS[metric] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8 py-4 border-t border-slate-200 dark:border-slate-800">
          &copy; {new Date().getFullYear()} Cardano Foundation - Open Source Metrics Dashboard
        </footer>
      </div>
    </div>
  )
}
