import { useEffect, useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
  "GitHub Stars": { color: "#F59E0B", label: "Stars" },
  "GitHub Forks": { color: "#10B981", label: "Forks" },
  "GitHub Contributors": { color: "#3B82F6", label: "Contributors" },
  "GitHub Pull Requests (PRs) Merged": { color: "#8B5CF6", label: "PRs Merged" },
  "Number of Releases": { color: "#EC4899", label: "Releases" },
  "Downloads": { color: "#06B6D4", label: "Downloads" },
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

function MultiSelect({ label, options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredOptions = search
    ? options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()))
    : options

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-left transition-colors"
      >
        <span className="text-sm truncate">
          {selected.length === 0 ? "Select..." :
           selected.length === 1 ? selected[0] :
           `${selected.length} selected`}
        </span>
        <svg className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setIsOpen(false); setSearch("") }} />
          <div className="absolute z-20 mt-2 w-full bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-white/10">
              <input
                type="text"
                placeholder="Type to search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                autoFocus
              />
            </div>
            <div className="p-2 flex gap-2 border-b border-white/10">
              <button
                onClick={() => onChange([...options])}
                className="flex-1 text-xs font-medium px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Select All
              </button>
              <button
                onClick={() => onChange([])}
                className="flex-1 text-xs font-medium px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    selected.includes(option)
                      ? 'bg-blue-500/20 text-white'
                      : 'hover:bg-white/5 text-white/70'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selected.includes(option)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-white/20'
                  }`}>
                    {selected.includes(option) && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="truncate">{option}</span>
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="text-sm text-white/60 text-center py-3">No matches</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="text-xs text-white/70 mb-3">{label}</div>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-white/80">{entry.name}</span>
            <span className="text-sm font-medium text-white ml-auto">
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const LANGUAGE_COLORS = {
  Java: "#f89820",
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Haskell: "#5e5086",
  Rust: "#dea584",
  Aiken: "#a855f7",
  Elm: "#60b5cc",
  Shell: "#89e051",
  TeX: "#3d6117",
  Python: "#3572a5",
  Go: "#00add8",
  Unknown: "#6b7280",
}

function langColor(lang) {
  return LANGUAGE_COLORS[lang] || "#9ca3af"
}

function IncludedRepos({ history, selectedProjects, isImplicit = false }) {
  const [expanded, setExpanded] = useState(true)

  const grouped = useMemo(() => {
    const groups = {}
    selectedProjects.forEach((name) => {
      const lang = history[name]?.language || "Unknown"
      if (!groups[lang]) groups[lang] = []
      groups[lang].push(name)
    })
    return Object.entries(groups)
      .map(([lang, repos]) => ({ lang, repos: repos.sort() }))
      .sort((a, b) => b.repos.length - a.repos.length)
  }, [history, selectedProjects])

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl mb-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/80">
            Showing {selectedProjects.length} repositor{selectedProjects.length === 1 ? "y" : "ies"}
          </span>
          <span className="text-xs text-white/60">
            across {grouped.length} language{grouped.length === 1 ? "" : "s"}
            {isImplicit && " · all repos in scope"}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-white/60 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-4 pt-1 space-y-3 border-t border-white/[0.04]">
          {grouped.map(({ lang, repos }) => (
            <div key={lang} className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 min-w-[120px]">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: langColor(lang) }}
                />
                <span className="text-xs font-medium text-white/80">{lang}</span>
                <span className="text-xs text-white/60">({repos.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {repos.map((name) => {
                  const fullName = history[name]?.repo
                  const href = fullName ? `https://github.com/${fullName}` : null
                  return href ? (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg text-xs text-white/80 hover:text-white transition-colors"
                    >
                      {name}
                    </a>
                  ) : (
                    <span
                      key={name}
                      className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-xs text-white/80"
                    >
                      {name}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MetricCard({ metric, data, selectedProjects }) {
  const config = METRIC_CONFIG[metric]

  const totals = useMemo(() => {
    let current = 0
    let previous = 0

    selectedProjects.forEach(project => {
      const projectData = data[project]
      if (projectData && projectData.length > 0) {
        current += projectData[projectData.length - 1]?.[metric] || 0
        previous += projectData[projectData.length - 2]?.[metric] || projectData[0]?.[metric] || 0
      }
    })

    return { current, previous }
  }, [data, selectedProjects, metric])

  const diff = totals.current - totals.previous
  const percent = totals.previous === 0 ? 0 : (diff / totals.previous) * 100
  const isPositive = diff > 0
  const isNegative = diff < 0

  return (
    <div className="bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl p-4 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' :
          isNegative ? 'bg-red-500/10 text-red-400' :
          'bg-white/5 text-white/60'
        }`}>
          {diff === 0 ? '—' : `${isPositive ? '+' : ''}${percent.toFixed(1)}%`}
        </div>
      </div>
      <div className="text-2xl font-semibold text-white mb-1">
        {totals.current.toLocaleString()}
      </div>
      <div className="text-sm text-white/60">{config.label}</div>
    </div>
  )
}

export default function OssDashboard({ hideHeader = false }) {
  const [history, setHistory] = useState(null)
  const [selectedProjects, setSelectedProjects] = useState([])
  const [selectedDates, setSelectedDates] = useState([])
  const [selectedMetrics, setSelectedMetrics] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
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
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load metrics data.")
        setLoading(false)
      })
  }, [])

  const availableLanguages = useMemo(() => {
    if (!history) return []
    return Array.from(
      new Set(Object.values(history).map((p) => p?.language || "Unknown"))
    ).sort()
  }, [history])

  const availableProjects = useMemo(() => {
    if (!history) return []
    // No language picked = no language filter; show every repo.
    if (selectedLanguages.length === 0) return Object.keys(history).sort()
    const langSet = new Set(selectedLanguages)
    return Object.keys(history)
      .filter((name) => langSet.has(history[name]?.language || "Unknown"))
      .sort()
  }, [history, selectedLanguages])

  // Drop any explicitly-selected repos that fall outside the current language scope.
  useEffect(() => {
    if (!history) return
    setSelectedProjects((prev) => {
      const allowed = new Set(availableProjects)
      const next = prev.filter((p) => allowed.has(p))
      return next.length === prev.length ? prev : next
    })
  }, [availableProjects, history])

  // Repositories filter is optional fine-tune. Empty = use all in selected languages.
  const effectiveProjects = useMemo(() => {
    return selectedProjects.length > 0 ? selectedProjects : availableProjects
  }, [selectedProjects, availableProjects])

  const availableDates = useMemo(() => {
    if (!history || effectiveProjects.length === 0) return []

    // Get all unique dates across in-scope projects
    const allDates = new Set()
    effectiveProjects.forEach(project => {
      const dates = history[project]?.dates || []
      dates.forEach(d => allDates.add(d))
    })

    // Sort dates chronologically
    return Array.from(allDates).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/')
      const [dayB, monthB, yearB] = b.split('/')
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
    })
  }, [history, effectiveProjects])

  // Drop selected dates that are no longer available when projects change
  useEffect(() => {
    if (!availableDates.length) return
    setSelectedDates((prev) => {
      const allowed = new Set(availableDates)
      return prev.filter((d) => allowed.has(d))
    })
  }, [availableDates])

  const chartData = useMemo(() => {
    if (!history || effectiveProjects.length === 0 || selectedDates.length === 0) return {}

    const projectData = {}

    effectiveProjects.forEach(project => {
      const data = history[project]
      if (!data?.dates) return

      projectData[project] = selectedDates
        .filter(date => data.dates.includes(date))
        .map(date => {
          const index = data.dates.indexOf(date)
          const point = { date }
          METRICS.forEach(metric => {
            const values = data.data[metric] || []
            const raw = values[index]?.toString() || "0"
            point[metric] = parseInt(raw.match(/\d+/g)?.[0] || 0)
          })
          return point
        })
    })

    return projectData
  }, [history, effectiveProjects, selectedDates])

  const combinedChartData = useMemo(() => {
    if (Object.keys(chartData).length === 0) return []

    // For single project, return its data directly
    if (effectiveProjects.length === 1) {
      return chartData[effectiveProjects[0]] || []
    }

    // For multiple projects, combine data by date
    const dataByDate = {}

    effectiveProjects.forEach(project => {
      const data = chartData[project] || []
      data.forEach(point => {
        if (!dataByDate[point.date]) {
          dataByDate[point.date] = { date: point.date }
          METRICS.forEach(m => { dataByDate[point.date][m] = 0 })
        }
        METRICS.forEach(m => {
          dataByDate[point.date][m] += point[m] || 0
        })
      })
    })

    return Object.values(dataByDate).sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/')
      const [dayB, monthB, yearB] = b.date.split('/')
      return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB)
    })
  }, [chartData, effectiveProjects])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/70">
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
    <div className={hideHeader ? "" : "min-h-screen bg-[#030305] text-white"}>
      {!hideHeader && (
        <>
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
        </>
      )}

      <div className={`relative max-w-7xl mx-auto px-6 ${hideHeader ? "" : "py-8"}`}>
        {!hideHeader && (
          <header className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
                  <CardanoLogo className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Open Source Metrics</h1>
                <p className="text-sm text-white/60">Cardano Foundation</p>
              </div>
            </div>
          </header>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MultiSelect
            label="Languages"
            options={availableLanguages}
            selected={selectedLanguages}
            onChange={setSelectedLanguages}
          />
          <MultiSelect
            label="Repositories"
            options={availableProjects}
            selected={selectedProjects}
            onChange={setSelectedProjects}
          />
          <MultiSelect
            label="Dates"
            options={availableDates}
            selected={selectedDates}
            onChange={setSelectedDates}
          />
          <MultiSelect
            label="Metrics"
            options={METRICS}
            selected={selectedMetrics}
            onChange={setSelectedMetrics}
          />
        </div>

        <p className="text-xs text-white/60 -mt-4 mb-6">
          Tip: pick languages <em>or</em> repositories — you don't need both. Empty filters = include everything.
        </p>

        {history && (() => {
          const historicalRepos = Object.entries(history)
            .filter(([, v]) => v.dates && v.dates.length > 1)
            .map(([name]) => name)
            .sort();
          const totalRepos = Object.keys(history).length;
          const newRepos = totalRepos - historicalRepos.length;
          return (
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl px-4 py-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 text-lg leading-none mt-0.5">i</span>
                <div className="text-xs text-blue-200/80">
                  <p>
                    <strong className="text-blue-200">Note:</strong> {newRepos}+ repositories were added in May 2026 and only have data from that date onward.
                    Historical data (prior to May 2026) is available for the {historicalRepos.length} repositories listed below, tracked since June 2025.
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-300 hover:text-blue-200 transition-colors">
                      View {historicalRepos.length} repositories with historical data
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {historicalRepos.map((name) => (
                        <span key={name} className="inline-block bg-blue-400/10 border border-blue-400/15 rounded-md px-2 py-0.5 text-blue-200/90">
                          {name}
                        </span>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Included repos breakdown */}
        {history && effectiveProjects.length > 0 && selectedDates.length > 0 && selectedMetrics.length > 0 && (
          <IncludedRepos
            history={history}
            selectedProjects={effectiveProjects}
            isImplicit={selectedProjects.length === 0}
          />
        )}

        {/* Summary Cards */}
        {effectiveProjects.length > 0 && selectedDates.length > 0 && selectedMetrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {selectedMetrics.map((metric) => (
              <MetricCard
                key={metric}
                metric={metric}
                data={chartData}
                selectedProjects={effectiveProjects}
              />
            ))}
          </div>
        )}

        {/* Chart */}
        {combinedChartData.length > 0 && selectedMetrics.length > 0 && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium mb-1">Metrics Comparison</h2>
                <p className="text-sm text-white/60">
                  {effectiveProjects.length === 1
                    ? effectiveProjects[0]
                    : `${effectiveProjects.length} repositories combined`}
                  {selectedDates.length > 0 && ` • ${selectedDates.length} data points`}
                </p>
              </div>
            </div>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {selectedMetrics.map((metric) => (
                      <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={METRIC_CONFIG[metric].color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={METRIC_CONFIG[metric].color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                    dx={-10}
                    tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {selectedMetrics.map((metric) => (
                    <Area
                      key={metric}
                      type="monotone"
                      dataKey={metric}
                      name={METRIC_CONFIG[metric].label}
                      stroke={METRIC_CONFIG[metric].color}
                      strokeWidth={2}
                      fill={`url(#gradient-${metric})`}
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: METRIC_CONFIG[metric].color,
                        stroke: '#030305',
                        strokeWidth: 2
                      }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 pt-6 border-t border-white/[0.06]">
              {selectedMetrics.map((metric) => (
                <div key={metric} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: METRIC_CONFIG[metric].color }}
                  />
                  <span className="text-white/80">{METRIC_CONFIG[metric].label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(effectiveProjects.length === 0 || selectedDates.length === 0 || selectedMetrics.length === 0) && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-12 text-center">
            <div className="text-white/70 mb-2">No data to display</div>
            <p className="text-sm text-white/60">
              {selectedMetrics.length === 0 && selectedDates.length === 0
                ? "Select metrics and dates to view data"
                : selectedMetrics.length === 0
                ? "Select at least one metric to view data"
                : "Select at least one date to view data"}
            </p>
          </div>
        )}

        {!hideHeader && (
          <footer className="mt-16 pt-8 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardanoLogo className="w-5 h-5 text-white/70" />
              <span className="text-sm text-white/70">Cardano Foundation</span>
            </div>
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} Open Source Metrics
            </p>
          </footer>
        )}
      </div>
    </div>
  )
}
