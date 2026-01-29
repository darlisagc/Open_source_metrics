import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
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
  "GitHub Stars": "#FBBF24",
  "GitHub Forks": "#34D399",
  "GitHub Contributors": "#60A5FA",
  "GitHub Pull Requests (PRs) Merged": "#A78BFA",
  "Number of Releases": "#F87171",
  "Downloads": "#22D3EE",
}

const METRIC_ICONS = {
  "GitHub Stars": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  "GitHub Forks": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 5a3 3 0 100 6 3 3 0 000-6zM4 8a3 3 0 116 0 3 3 0 01-6 0zm13-3a3 3 0 100 6 3 3 0 000-6zm-3 3a3 3 0 116 0 3 3 0 01-6 0zM7 14a3 3 0 100 6 3 3 0 000-6zm-3 3a3 3 0 116 0 3 3 0 01-6 0zm10-3a3 3 0 100 6 3 3 0 000-6zm-3 3a3 3 0 116 0 3 3 0 01-6 0z"/>
    </svg>
  ),
  "GitHub Contributors": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  ),
  "GitHub Pull Requests (PRs) Merged": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 3a3 3 0 100 6 3 3 0 000-6zM3 6a3 3 0 116 0 3 3 0 01-6 0zm3 9a3 3 0 100 6 3 3 0 000-6zm-3 3a3 3 0 116 0 3 3 0 01-6 0zm12-12a3 3 0 100 6 3 3 0 000-6zm-3 3a3 3 0 116 0 3 3 0 01-6 0z"/>
    </svg>
  ),
  "Number of Releases": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
  "Downloads": (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
}

const METRIC_SHORT_NAMES = {
  "GitHub Stars": "Stars",
  "GitHub Forks": "Forks",
  "GitHub Contributors": "Contributors",
  "GitHub Pull Requests (PRs) Merged": "PRs Merged",
  "Number of Releases": "Releases",
  "Downloads": "Downloads",
}

// Cardano Logo SVG Component
function CardanoLogo({ className = "w-8 h-8" }) {
  return (
    <svg className={className} viewBox="0 0 375 346.51" fill="currentColor">
      <path d="M102.76 172a25.31 25.31 0 0 0 .2 4.89 24.62 24.62 0 0 0 8.87 15.54 25.06 25.06 0 0 0 17.12 5.96 25.55 25.55 0 0 0 16.63-7.17 24.62 24.62 0 0 0 7.42-16.14 25.31 25.31 0 0 0-.2-4.89 24.62 24.62 0 0 0-8.87-15.54 25.06 25.06 0 0 0-17.12-5.96 25.55 25.55 0 0 0-16.63 7.17 24.62 24.62 0 0 0-7.42 16.14z"/>
      <circle cx="187.5" cy="38.03" r="21"/>
      <circle cx="187.5" cy="308.47" r="21"/>
      <circle cx="69.35" cy="103.52" r="16"/>
      <circle cx="305.65" cy="242.99" r="16"/>
      <circle cx="69.35" cy="242.99" r="16"/>
      <circle cx="305.65" cy="103.52" r="16"/>
      <circle cx="22" cy="172" r="13"/>
      <circle cx="353" cy="172" r="13"/>
      <path d="M221.93 172a25.31 25.31 0 0 0 .2 4.89 24.62 24.62 0 0 0 8.87 15.54 25.06 25.06 0 0 0 17.12 5.96 25.55 25.55 0 0 0 16.63-7.17 24.62 24.62 0 0 0 7.42-16.14 25.31 25.31 0 0 0-.2-4.89 24.62 24.62 0 0 0-8.87-15.54 25.06 25.06 0 0 0-17.12-5.96 25.55 25.55 0 0 0-16.63 7.17 24.62 24.62 0 0 0-7.42 16.14z"/>
      <circle cx="118.66" cy="67.77" r="11"/>
      <circle cx="256.34" cy="278.74" r="11"/>
      <circle cx="47.67" cy="138.77" r="11"/>
      <circle cx="327.33" cy="207.74" r="11"/>
      <circle cx="47.67" cy="207.74" r="11"/>
      <circle cx="327.33" cy="138.77" r="11"/>
      <circle cx="118.66" cy="278.74" r="11"/>
      <circle cx="256.34" cy="67.77" r="11"/>
      <circle cx="153.08" cy="38.03" r="8"/>
      <circle cx="221.92" cy="308.47" r="8"/>
      <circle cx="153.08" cy="308.47" r="8"/>
      <circle cx="221.92" cy="38.03" r="8"/>
      <circle cx="91.83" cy="53.27" r="8"/>
      <circle cx="283.17" cy="293.24" r="8"/>
      <circle cx="91.83" cy="293.24" r="8"/>
      <circle cx="283.17" cy="53.27" r="8"/>
      <circle cx="38.42" cy="95.02" r="8"/>
      <circle cx="336.58" cy="251.49" r="8"/>
      <circle cx="38.42" cy="251.49" r="8"/>
      <circle cx="336.58" cy="95.02" r="8"/>
      <circle cx="187.5" cy="95.02" r="17"/>
      <circle cx="187.5" cy="251.49" r="17"/>
      <circle cx="127.93" cy="129.52" r="14"/>
      <circle cx="247.07" cy="217" r="14"/>
      <circle cx="127.93" cy="217" r="14"/>
      <circle cx="247.07" cy="129.52" r="14"/>
    </svg>
  )
}

function MetricCard({ metric, initialValue, latestValue, color, icon }) {
  const diff = latestValue - initialValue
  const percent = initialValue === 0 ? 0 : (diff / initialValue) * 100
  const isPositive = diff > 0
  const isNegative = diff < 0

  return (
    <div className="group relative bg-gradient-to-br from-dark-800/80 to-dark-900/80 backdrop-blur-sm rounded-2xl p-5 border border-dark-700/50 hover:border-cardano-blue/30 transition-all duration-300 hover:shadow-glow">
      <div className="absolute inset-0 bg-gradient-to-br from-cardano-blue/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <span className="text-sm font-medium text-dark-300">
            {METRIC_SHORT_NAMES[metric]}
          </span>
        </div>
        <div className="text-3xl font-bold text-white mb-2">
          {latestValue.toLocaleString()}
        </div>
        <div className={`text-sm font-semibold flex items-center gap-2 ${
          isPositive ? 'text-emerald-400' :
          isNegative ? 'text-red-400' :
          'text-dark-400'
        }`}>
          {isPositive && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {isNegative && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {diff === 0 ? (
            <span>No change</span>
          ) : (
            <>
              <span>{isPositive ? '+' : ''}{diff.toLocaleString()}</span>
              <span className="text-dark-500">
                ({isPositive ? '+' : ''}{percent.toFixed(1)}%)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2.5 rounded-xl bg-dark-800/80 hover:bg-dark-700/80 border border-dark-700/50 hover:border-cardano-blue/30 transition-all duration-300"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-dark-300" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-dark-300 flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-cardano-blue" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-lg">Loading metrics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center backdrop-blur-sm">
          <div className="text-red-400 font-medium text-lg">{error}</div>
        </div>
      </div>
    )
  }

  const metricProgress = getMetricProgress()

  return (
    <div className="min-h-screen bg-dark-gradient">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 51, 173, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(0, 51, 173, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cardano-gradient rounded-2xl shadow-glow">
              <CardanoLogo className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Open Source Metrics
              </h1>
              <p className="text-dark-400 text-sm sm:text-base mt-1">
                Cardano Foundation Project Analytics
              </p>
            </div>
          </div>
          <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </header>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Project Select */}
          <div className="bg-dark-800/60 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
            <label className="block text-sm font-semibold text-dark-200 mb-3">
              Select Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900/80 border border-dark-600/50 rounded-xl text-white focus:ring-2 focus:ring-cardano-blue focus:border-transparent transition-all duration-300 cursor-pointer hover:border-cardano-blue/30"
            >
              {availableProjects.map((p) => (
                <option key={p} value={p} className="bg-dark-900">{p}</option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div className="bg-dark-800/60 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
            <label className="block text-sm font-semibold text-dark-200 mb-3">
              Select Dates
            </label>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedDates([...availableDates])}
                className="px-4 py-2 text-sm font-semibold bg-cardano-blue/20 text-cardano-blue-200 rounded-lg hover:bg-cardano-blue/30 border border-cardano-blue/30 transition-all duration-300"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedDates([])}
                className="px-4 py-2 text-sm font-semibold bg-dark-700/50 text-dark-300 rounded-lg hover:bg-dark-600/50 border border-dark-600/50 transition-all duration-300"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-28 overflow-y-auto custom-scrollbar bg-dark-900/50 rounded-xl p-3 border border-dark-700/30">
              {availableDates.map((date) => (
                <label
                  key={date}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedDates.includes(date)
                      ? 'bg-cardano-blue/20 border border-cardano-blue/30'
                      : 'hover:bg-dark-700/30 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDates.includes(date)}
                    onChange={() => toggleDate(date)}
                    className="w-4 h-4 rounded bg-dark-700 border-dark-500 text-cardano-blue focus:ring-cardano-blue focus:ring-offset-0"
                  />
                  <span className={`text-sm ${
                    selectedDates.includes(date)
                      ? 'font-semibold text-white'
                      : 'text-dark-300'
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-cardano-gradient rounded-full" />
                Progress Overview
              </h2>
              <span className="text-sm text-dark-400 bg-dark-800/60 px-4 py-2 rounded-lg border border-dark-700/50">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {metricProgress.map(({ metric, initialValue, latestValue }) => (
                <MetricCard
                  key={metric}
                  metric={metric}
                  initialValue={initialValue}
                  latestValue={latestValue}
                  color={METRIC_COLORS[metric]}
                  icon={METRIC_ICONS[metric]}
                />
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-dark-800/60 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-cardano-gradient rounded-full" />
              Metric Trends
            </h2>
            <ResponsiveContainer width="100%" height={420}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <defs>
                  {METRICS.map((metric) => (
                    <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={METRIC_COLORS[metric]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={METRIC_COLORS[metric]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickMargin={12}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '8px' }}
                  itemStyle={{ color: '#cbd5e1', padding: '2px 0' }}
                />
                {METRICS.map((metric) => (
                  <Area
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={METRIC_COLORS[metric]}
                    strokeWidth={2}
                    fill={`url(#gradient-${metric})`}
                    dot={{ r: 3, fill: METRIC_COLORS[metric], strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: METRIC_COLORS[metric], strokeWidth: 2, stroke: '#fff' }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-dark-700/50">
              {METRICS.map((metric) => (
                <div key={metric} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: METRIC_COLORS[metric] }}
                  />
                  <span className="text-sm text-dark-300">{METRIC_SHORT_NAMES[metric]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-dark-800/50">
          <div className="flex items-center justify-center gap-3 mb-3">
            <CardanoLogo className="w-5 h-5 text-cardano-blue" />
            <span className="text-dark-400 text-sm font-medium">Cardano Foundation</span>
          </div>
          <p className="text-dark-500 text-xs">
            &copy; {new Date().getFullYear()} Open Source Metrics Dashboard
          </p>
        </footer>
      </div>
    </div>
  )
}
