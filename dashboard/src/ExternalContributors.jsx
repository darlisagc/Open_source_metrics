import React, { useEffect, useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// -------------------- Tooltip --------------------

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="text-xs text-white/70 mb-3">{label}</div>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
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

// -------------------- Summary Card --------------------

function SummaryCard({ label, value, icon, color = "blue" }) {
  const colorMap = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
  }
  const textMap = {
    blue: "text-blue-400",
    green: "text-emerald-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
  }
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <div className={`text-3xl font-bold ${textMap[color]}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  )
}

// -------------------- MultiSelect (lightweight) --------------------

function MultiSelect({ label, options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredOptions = search
    ? options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    : options

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
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
          {selected.length === 0
            ? "Select..."
            : selected.length === 1
            ? selected[0]
            : `${selected.length} selected`}
        </span>
        <svg className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <button onClick={() => onChange([...options])} className="flex-1 text-xs font-medium px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                Select All
              </button>
              <button onClick={() => onChange([])} className="flex-1 text-xs font-medium px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                Clear All
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    selected.includes(option) ? "bg-blue-500/20 text-white" : "hover:bg-white/5 text-white/70"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selected.includes(option) ? "bg-blue-500 border-blue-500" : "border-white/20"
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

// -------------------- Repo Table --------------------



// -------------------- Contributor List --------------------

// -------------------- Main Component --------------------

export default function ExternalContributors({ className = "" }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriods, setSelectedPeriods] = useState([])
  const [selectedRepos, setSelectedRepos] = useState([])
  const [newOnly, setNewOnly] = useState(false)
  const [expandedBreakdownRepo, setExpandedBreakdownRepo] = useState(null)
  const [repoFilter, setRepoFilter] = useState("all")

  useEffect(() => {
    fetch("./external_contributors_history.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch external contributors data.")
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load external contributors data.")
        setLoading(false)
      })
  }, [])

  // Available periods and repos
  const availablePeriods = useMemo(() => {
    if (!data) return []
    return (data.periods || []).map((p) => p.label)
  }, [data])

  const availableRepos = useMemo(() => {
    if (!data) return []
    // Use the full tracked repos list if available, otherwise fall back to repos with activity
    if (data.tracked_repos && data.tracked_repos.length > 0) {
      return [...data.tracked_repos].sort()
    }
    const repos = new Set()
    ;(data.periods || []).forEach((p) => {
      if (selectedPeriods.length === 0 || selectedPeriods.includes(p.label)) {
        Object.keys(p.repos || {}).forEach((r) => repos.add(r))
      }
    })
    return Array.from(repos).sort()
  }, [data, selectedPeriods])

  // Filter periods
  const filteredPeriods = useMemo(() => {
    if (!data) return []
    return (data.periods || []).filter(
      (p) => selectedPeriods.length === 0 || selectedPeriods.includes(p.label)
    )
  }, [data, selectedPeriods])

  // Current period (latest selected, for detail view)
  const currentPeriod = useMemo(() => {
    if (filteredPeriods.length === 0) return null
    return filteredPeriods[filteredPeriods.length - 1]
  }, [filteredPeriods])

  // Filtered repos data for the current period
  const currentRepos = useMemo(() => {
    if (!currentPeriod) return {}
    const repos = currentPeriod.repos || {}
    const filtered = {}
    for (const [name, rdata] of Object.entries(repos)) {
      if (selectedRepos.length > 0 && !selectedRepos.includes(name)) continue
      if (newOnly) {
        // Only include repos that have new contributors
        if ((rdata.new_count || 0) > 0) {
          filtered[name] = {
            ...rdata,
            returning_contributors: [],
            returning_count: 0,
            total_external: rdata.new_count || 0,
          }
        }
      } else {
        filtered[name] = rdata
      }
    }
    return filtered
  }, [currentPeriod, selectedRepos, newOnly])

  // Chart data: trend across selected periods
  const chartData = useMemo(() => {
    return filteredPeriods.map((p) => {
      const repos = p.repos || {}
      let totalNew = 0
      let totalReturning = 0

      for (const [name, rdata] of Object.entries(repos)) {
        if (selectedRepos.length > 0 && !selectedRepos.includes(name)) continue
        totalNew += rdata.new_count || 0
        if (!newOnly) totalReturning += rdata.returning_count || 0
      }

      return {
        period: p.label,
        "New Contributors": totalNew,
        "Returning Contributors": totalReturning,
        Total: totalNew + totalReturning,
      }
    })
  }, [filteredPeriods, selectedRepos, newOnly])

  // Aggregate summary across selected periods and repos
  const summary = useMemo(() => {
    let totalExternal = 0
    let totalNew = 0
    let totalReturning = 0
    const reposWithActivity = new Set()
    const allContributors = new Set()

    filteredPeriods.forEach((p) => {
      for (const [name, rdata] of Object.entries(p.repos || {})) {
        if (selectedRepos.length > 0 && !selectedRepos.includes(name)) continue
        totalNew += rdata.new_count || 0
        if (!newOnly) {
          totalReturning += rdata.returning_count || 0
          totalExternal += rdata.total_external || 0
        } else {
          totalExternal += rdata.new_count || 0
        }
        const count = newOnly ? (rdata.new_count || 0) : (rdata.total_external || 0)
        if (count > 0) reposWithActivity.add(name)
        ;(rdata.new_contributors || []).forEach((u) => allContributors.add(u))
        if (!newOnly) {
          ;(rdata.returning_contributors || []).forEach((u) => allContributors.add(u))
        }
      }
    })

    return {
      totalExternal,
      totalNew,
      totalReturning,
      reposWithActivity: reposWithActivity.size,
    }
  }, [filteredPeriods, selectedRepos, newOnly])

  // Per-repo breakdown across all selected periods
  const repoBreakdown = useMemo(() => {
    const byRepo = {}
    // Initialize all repos (selected or all tracked) so they appear even with 0 activity
    const reposToShow = selectedRepos.length > 0 ? selectedRepos : availableRepos
    reposToShow.forEach((name) => {
      byRepo[name] = { total: 0, newCount: 0, returning: 0, newUsers: new Set(), returningUsers: new Set() }
    })
    filteredPeriods.forEach((p) => {
      for (const [name, rdata] of Object.entries(p.repos || {})) {
        if (selectedRepos.length > 0 && !selectedRepos.includes(name)) continue
        if (!byRepo[name]) byRepo[name] = { total: 0, newCount: 0, returning: 0, newUsers: new Set(), returningUsers: new Set() }
        byRepo[name].total += rdata.total_external || 0
        byRepo[name].newCount += rdata.new_count || 0
        byRepo[name].returning += rdata.returning_count || 0
        ;(rdata.new_contributors || []).forEach((u) => byRepo[name].newUsers.add(u))
        ;(rdata.returning_contributors || []).forEach((u) => byRepo[name].returningUsers.add(u))
      }
    })
    return Object.entries(byRepo)
      .map(([name, v]) => [name, { ...v, newUsers: [...v.newUsers].sort(), returningUsers: [...v.returningUsers].sort() }])
      .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]))
  }, [filteredPeriods, selectedRepos, availableRepos])

  if (loading) {
    return (
      <div className={`min-h-screen bg-[#030305] flex items-center justify-center ${className}`}>
        <div className="flex items-center gap-3 text-white/70">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span>Loading external contributors...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-[#030305] flex items-center justify-center p-4 ${className}`}>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-md">
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    )
  }

  const hasPeriods = (data?.periods || []).length > 0

  return (
    <div className={className}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!hasPeriods ? (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-12 text-center">
            <div className="text-white/70 mb-2">No data collected yet</div>
            <p className="text-sm text-white/60">
              External contributor data will appear here after the first monthly collection runs.
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <MultiSelect
                label="Periods"
                options={availablePeriods}
                selected={selectedPeriods}
                onChange={setSelectedPeriods}
              />
              <MultiSelect
                label="Repositories"
                options={availableRepos}
                selected={selectedRepos}
                onChange={setSelectedRepos}
              />
            </div>

            {selectedPeriods.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-12 text-center">
                <div className="text-white/70 mb-2">Select a period to view data</div>
                <p className="text-sm text-white/60">
                  Use the filters above to choose a collection period and optionally narrow down by repository.
                </p>
              </div>
            ) : (
            <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <SummaryCard label="New Contributors" value={summary.totalNew} icon="🌟" color="green" />
              <SummaryCard label="Returning Contributors" value={summary.totalReturning} icon="🔄" color="purple" />
              <SummaryCard label="Active Repos" value={summary.reposWithActivity} icon="📦" color="cyan" />
            </div>

            {/* Trend Chart */}
            {chartData.length > 0 && (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 mb-8">
                <h2 className="text-lg font-medium mb-1">External Contributor Trend</h2>
                <p className="text-sm text-white/60 mb-6">Total, new, and returning contributors per collection period</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradReturning" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} dx={-10} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        formatter={(value) => <span className="text-white/80 text-sm">{value}</span>}
                      />
                      <Area type="monotone" dataKey="Total" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradTotal)" dot={{ r: 4, fill: "#8B5CF6", stroke: "#030305", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#8B5CF6", stroke: "#030305", strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="New Contributors" stroke="#10B981" strokeWidth={2} fill="url(#gradNew)" dot={{ r: 4, fill: "#10B981", stroke: "#030305", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#10B981", stroke: "#030305", strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="Returning Contributors" stroke="#06B6D4" strokeWidth={2} fill="url(#gradReturning)" dot={{ r: 4, fill: "#06B6D4", stroke: "#030305", strokeWidth: 2 }} activeDot={{ r: 6, fill: "#06B6D4", stroke: "#030305", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Repo breakdown under chart */}
                {repoBreakdown.length > 0 && (() => {
                  const filteredBreakdown = repoBreakdown.filter(([, counts]) => {
                    if (repoFilter === "new") return counts.newCount > 0
                    if (repoFilter === "returning") return counts.returning > 0
                    if (repoFilter === "active") return counts.total > 0
                    return true
                  })
                  return (
                  <div className="mt-6 pt-6 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-white/60">Show:</span>
                      {[
                        { key: "all", label: "All repos" },
                        { key: "active", label: "With activity" },
                        { key: "new", label: "With new contributors" },
                        { key: "returning", label: "With returning contributors" },
                      ].map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setRepoFilter(f.key)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            repoFilter === f.key
                              ? "bg-white/15 text-white"
                              : "text-white/60 hover:text-white/80 hover:bg-white/5"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                      <span className="text-xs text-white/60 ml-auto">{filteredBreakdown.length} repos</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="text-left py-2 text-white/60 font-medium"></th>
                          <th className="text-left py-2 text-white/60 font-medium">Repository</th>
                          <th className="text-right py-2 text-white/60 font-medium pr-4">Total</th>
                          <th className="text-right py-2 text-white/60 font-medium pr-4">New</th>
                          <th className="text-right py-2 text-white/60 font-medium">Returning</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBreakdown.map(([name, counts]) => (
                          <React.Fragment key={name}>
                            <tr
                              className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                              onClick={() => setExpandedBreakdownRepo(expandedBreakdownRepo === name ? null : name)}
                            >
                              <td className="py-2.5 w-6 text-white/60">
                                <svg className={`w-3.5 h-3.5 transition-transform ${expandedBreakdownRepo === name ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </td>
                              <td className="py-2.5 text-white/85">{name}</td>
                              <td className="py-2.5 text-white font-medium text-right pr-4">{counts.total}</td>
                              <td className="py-2.5 text-emerald-400 text-right pr-4">{counts.newCount}</td>
                              <td className="py-2.5 text-cyan-400 text-right">{counts.returning}</td>
                            </tr>
                            {expandedBreakdownRepo === name && (
                              <tr>
                                <td colSpan={5} className="pb-3 pt-1 px-6">
                                  <div className="flex flex-wrap gap-4">
                                    {counts.newUsers.length > 0 && (
                                      <div className="flex-1 min-w-[200px]">
                                        <div className="text-xs text-emerald-400 font-medium mb-1.5">New Contributors</div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {counts.newUsers.map((u) => (
                                            <a key={u} href={`https://github.com/${u}`} target="_blank" rel="noreferrer"
                                              className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-300 hover:bg-emerald-500/20 transition-colors">
                                              {u}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {counts.returningUsers.length > 0 && (
                                      <div className="flex-1 min-w-[200px]">
                                        <div className="text-xs text-cyan-400 font-medium mb-1.5">Returning Contributors</div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {counts.returningUsers.map((u) => (
                                            <a key={u} href={`https://github.com/${u}`} target="_blank" rel="noreferrer"
                                              className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                                              {u}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {counts.newUsers.length === 0 && counts.returningUsers.length === 0 && (
                                      <div className="text-xs text-white/60">Individual usernames not available for this period</div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-white/[0.06]">
                          <td className="pt-3"></td>
                          <td className="pt-3 text-white/80 font-medium">Total</td>
                          <td className="pt-3 text-white font-semibold text-right pr-4">{filteredBreakdown.reduce((s, [,c]) => s + c.total, 0)}</td>
                          <td className="pt-3 text-emerald-400 font-semibold text-right pr-4">{filteredBreakdown.reduce((s, [,c]) => s + c.newCount, 0)}</td>
                          <td className="pt-3 text-cyan-400 font-semibold text-right">{filteredBreakdown.reduce((s, [,c]) => s + c.returning, 0)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  )
                })()}
              </div>
            )}

            </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
