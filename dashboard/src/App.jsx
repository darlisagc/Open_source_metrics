import { useState } from 'react'
import OssDashboard from './OssDashboard'
import ExternalContributors from './ExternalContributors'

const TABS = [
  { id: 'metrics', label: 'Metrics' },
  { id: 'external', label: 'External Contributors' },
]

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

function App() {
  const [activeTab, setActiveTab] = useState('metrics')

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

      <div className="relative">
        {/* Header with tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
                  <CardanoLogo className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Open Source Metrics</h1>
                <p className="text-sm text-white/80">Cardano Foundation</p>
              </div>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white/[0.06] border border-white/10 rounded-xl p-1.5 mb-8 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-white/80 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'metrics' && <OssDashboard hideHeader />}
        {activeTab === 'external' && <ExternalContributors />}

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-6">
          <footer className="mt-16 pt-8 border-t border-white/[0.06] flex items-center justify-between pb-8">
            <div className="flex items-center gap-3">
              <CardanoLogo className="w-5 h-5 text-white/70" />
              <span className="text-sm text-white/70">Cardano Foundation</span>
            </div>
            <p className="text-sm text-white/60">
              &copy; {new Date().getFullYear()} Open Source Metrics
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App
