import { useEffect, useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const METRICS = [
  "GitHub Stars",
  "GitHub Forks",
  "GitHub Contributors",
  "GitHub Pull Requests (PRs) Merged",
  "Number of Releases",
  "Downloads",
]

const METRIC_CONFIG = {
  "GitHub Stars": {
    color: "#F59E0B",
    gradient: ["#FCD34D", "#F59E0B"],
    icon: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z",
    label: "Stars"
  },
  "GitHub Forks": {
    color: "#10B981",
    gradient: ["#6EE7B7", "#10B981"],
    icon: "M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z",
    label: "Forks"
  },
  "GitHub Contributors": {
    color: "#3B82F6",
    gradient: ["#93C5FD", "#3B82F6"],
    icon: "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z",
    label: "Contributors"
  },
  "GitHub Pull Requests (PRs) Merged": {
    color: "#8B5CF6",
    gradient: ["#C4B5FD", "#8B5CF6"],
    icon: "M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z",
    label: "PRs Merged"
  },
  "Number of Releases": {
    color: "#EC4899",
    gradient: ["#F9A8D4", "#EC4899"],
    icon: "M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z",
    label: "Releases"
  },
  "Downloads": {
    color: "#06B6D4",
    gradient: ["#67E8F9", "#06B6D4"],
    icon: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z",
    label: "Downloads"
  },
}

function CardanoLogo({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 375 346.51" fill="currentColor">
      <path d="M102.76 172a25.31 25.31 0 0 0 .2 4.89 24.62 24.62 0 0 0 8.87 15.54 25.06 25.06 0 0 0 17.12 5.96 25.55 25.55 0 0 0 16.63-7.17 24.62 24.62 0 0 0 7.42-16.14 25.31 25.31 0 0 0-.2-4.89 24.62 24.62 0 0 0-8.87-15.54 25.06 25.06 0 0 0-17.12-5.96 25.55 25.55 0 0 0-16.63 7.17 24.62 24.62 0 0 0-7.42 16.14z"/>
      <circle cx="187.5" cy="38.03" r="21"/><circle cx="187.5" cy="308.47" r="21"/>
      <circle cx="69.35" cy="103.52" r="16"/><circle cx="305.65" cy="242.99" r="16"/>
      <circle cx="69.35" cy="242.99" r="16"/><circle cx="305.65" cy="103.52" r="16"/>
      <circle cx="22" cy="172" r="13"/><circle cx="353" cy="172" r="13"/>
      <path d="M221.93 172a25.31 25.31 0 0 0 .2 4.89 24.62 24.62 0 0 0 8.87 15.54 25.06 25.06 0 0 0 17.12 5.96 25.55 25.55 0 0 0 16.63-7.17 24.62 24.62 0 0 0 7.42-16.14 25.31 25.31 0 0 0-.2-4.89 24.62 24.62 0 0 0-8.87-15.54 25.06 25.06 0 0 0-17.12-5.96 25.55 25.55 0 0 0-16.63 7.17 24.62 24.62 0 0 0-7.42 16.14z"/>
      <circle cx="118.66" cy="67.77" r="11"/><circle cx="256.34" cy="278.74" r="11"/>
      <circle cx="47.67" cy="138.77" r="11"/><circle cx="327.33" cy="207.74" r="11"/>
      <circle cx="47.67" cy="207.74" r="11"/><circle cx="327.33" cy="138.77" r="11"/>
      <circle cx="118.66" cy="278.74" r="11"/><circle cx="256.34" cy="67.77" r="11"/>
      <circle cx="153.08" cy="38.03" r="8"/><circle cx="221.92" cy="308.47" r="8"/>
      <circle cx="153.08" cy="308.47" r="8"/><circle cx="221.92" cy="38.03" r="8"/>
      <circle cx="187.5" cy="95.02" r="17"/><circle cx="187.5" cy="251.49" r="17"/>
      <circle cx="127.93" cy="129.52" r="14"/><circle cx="247.07" cy="217" r="14"/>
      <circle cx="127.93" cy="217" r="14"/><circle cx="247.07" cy="129.52" r="14"/>
    </svg>
  )
}

function MetricCard({ metric, value, previousValue, isSelected, onClick }) {
  const config = METRIC_CONFIG[metric]
  const diff = value - previousValue
  const percent = previousValue === 0 ? 0 : (diff / previousValue) * 100
  const isPositive = diff > 0
  const isNegative = diff < 0

  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left p-4 rounded-2xl transition-all duration-300 ${
        isSelected
          ? 'bg-white/10 ring-1 ring-white/20 shadow-lg'
          : 'bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      {/* Glow effect when selected */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-2xl opacity-20 blur-xl -z-10"
          style={{ backgroundColor: config.color }}
        />
      )}

      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <svg className="w-4 h-4" fill={config.color} viewBox="0 0 20 20">
            <path fillRule="evenodd" d={config.icon} clipRule="evenodd" />
          </svg>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' :
          isNegative ? 'bg-red-500/10 text-red-400' :
          'bg-white/5 text-white/40'
        }`}>
          {isPositive && '↑'}
          {isNegative && '↓'}
          {diff === 0 ? '—' : `${Math.abs(percent).toFixed(1)}%`}
        </div>
      </div>

      <div className="text-2xl font-semibold text-white mb-1 tracking-tight">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-white/40">{config.label}</div>
    </button>
  )
}

function MiniChart({ data, metric, color }) {
  if (!data || data.length < 2) return null

  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`mini-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={metric}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#mini-${metric})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="text-xs text-white/50 mb-2">{label}</div>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-white/70">{METRIC_CONFIG[entry.name]?.label}</span>
            <span className="text-sm font-medium text-white ml-auto">
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OssDashboard() {
  const [history, setHistory] = useState(null)
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedMetric, setSelectedMetric] = useState("GitHub Stars")
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
        setSelectedProject(projectNames[0])
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load metrics data.")
        setLoading(false)
      })
  }, [])

  const projectData = useMemo(() => {
    if (!history || !selectedProject) return null
    return history[selectedProject]
  }, [history, selectedProject])

  const chartData = useMemo(() => {
    if (!projectData?.dates) return []

    return projectData.dates
      .map((date, index) => {
        const point = { date }
        METRICS.forEach((metric) => {
          const values = projectData.data[metric] || []
          const raw = values[index]?.toString() || "0"
          point[metric] = parseInt(raw.match(/\d+/g)?.[0] || 0)
        })
        return point
      })
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/')
        const [dayB, monthB, yearB] = b.date.split('/')
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
      })
  }, [projectData])

  const latestValues = useMemo(() => {
    if (!chartData.length) return {}
    const latest = chartData[chartData.length - 1]
    const previous = chartData[chartData.length - 2] || chartData[0]
    return METRICS.reduce((acc, metric) => {
      acc[metric] = {
        value: latest[metric] || 0,
        previous: previous[metric] || 0
      }
      return acc
    }, {})
  }, [chartData])

  const availableProjects = useMemo(() => {
    return history ? Object.keys(history).sort() : []
  }, [history])

  const selectedConfig = METRIC_CONFIG[selectedMetric]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/50">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span>Loading metrics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
                <CardanoLogo className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Open Source Metrics</h1>
              <p className="text-sm text-white/40">Cardano Foundation</p>
            </div>
          </div>

          {/* Project Selector */}
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {availableProjects.map((p) => (
                <option key={p} value={p} className="bg-[#0a0a0f]">{p}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </header>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {METRICS.map((metric) => (
            <MetricCard
              key={metric}
              metric={metric}
              value={latestValues[metric]?.value || 0}
              previousValue={latestValues[metric]?.previous || 0}
              isSelected={selectedMetric === metric}
              onClick={() => setSelectedMetric(metric)}
            />
          ))}
        </div>

        {/* Main Chart */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium mb-1">{selectedConfig.label} Over Time</h2>
              <p className="text-sm text-white/40">
                {chartData.length > 0 && `${chartData[0]?.date} — ${chartData[chartData.length - 1]?.date}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedConfig.color }}
              />
              <span className="text-sm text-white/60">{selectedConfig.label}</span>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={selectedConfig.color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={selectedConfig.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={selectedConfig.color}
                  strokeWidth={2}
                  fill="url(#chartGradient)"
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: selectedConfig.color,
                    stroke: '#030305',
                    strokeWidth: 3
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* All Metrics Chart */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium mb-1">All Metrics Comparison</h2>
              <p className="text-sm text-white/40">Track all metrics simultaneously</p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {METRICS.map((metric) => (
                    <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={METRIC_CONFIG[metric].color} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={METRIC_CONFIG[metric].color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                />
                <Tooltip content={<CustomTooltip />} />
                {METRICS.map((metric) => (
                  <Area
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={METRIC_CONFIG[metric].color}
                    strokeWidth={1.5}
                    fill={`url(#gradient-${metric})`}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 pt-6 border-t border-white/[0.06]">
            {METRICS.map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`flex items-center gap-2 text-sm transition-opacity ${
                  selectedMetric === metric ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: METRIC_CONFIG[metric].color }}
                />
                <span>{METRIC_CONFIG[metric].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardanoLogo className="w-5 h-5 text-white/30" />
            <span className="text-sm text-white/30">Cardano Foundation</span>
          </div>
          <p className="text-sm text-white/20">
            © {new Date().getFullYear()} Open Source Metrics
          </p>
        </footer>
      </div>
    </div>
  )
}
