'use client'

import { useState } from 'react'
import type { DashboardData, StateData, Candidate } from '@/lib/types'
import dynamic from 'next/dynamic'
import StatePanel from './StatePanel'
import ConstituencyPanel from './ConstituencyPanel'
import { Badge } from './ui/badge'
import { partyColor } from '@/lib/party-colors'

const IndiaMap = dynamic(() => import('./IndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-zinc-950">
      <div className="text-muted-foreground text-sm animate-pulse">Loading map…</div>
    </div>
  ),
})

type View = 'overview' | 'state' | 'constituency'
type MobileTab = 'map' | 'browse'

interface Props { data: DashboardData }

export default function Dashboard({ data }: Props) {
  const [view, setView]               = useState<View>('overview')
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedConst, setSelectedConst] = useState<string | null>(null)
  const [mobileTab, setMobileTab]     = useState<MobileTab>('map')

  const electionStates = data.election_info.election_states || Object.keys(data.states)

  function handleStateSelect(stateName: string) {
    if (!data.states[stateName]) return
    setSelectedState(stateName)
    setSelectedConst(null)
    setView('state')
    setMobileTab('browse')           // auto-switch to Browse on mobile
  }

  function handleConstSelect(constName: string) {
    setSelectedConst(constName)
    setView('constituency')
  }

  function handleBack() {
    if (view === 'constituency') {
      setView('state')
      setSelectedConst(null)
    } else {
      setView('overview')
      setSelectedState(null)
    }
  }

  const stateData: StateData | null =
    selectedState ? (data.states[selectedState] ?? null) : null
  const constCandidates: Candidate[] =
    selectedState && selectedConst
      ? (data.states[selectedState]?.constituencies?.[selectedConst] ?? [])
      : []

  // ── breadcrumb label for mobile tab ──────────────────────────
  const browseLabel =
    view === 'constituency' && selectedConst
      ? selectedConst.length > 12 ? selectedConst.slice(0, 12) + '…' : selectedConst
      : view === 'state' && selectedState
      ? selectedState.length > 12 ? selectedState.slice(0, 12) + '…' : selectedState
      : 'Browse'

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-background">

      {/* ── TOP HEADER ─────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-border bg-card">

        {/* Row 1: branding + stats */}
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5">

          {/* Flag stripe + title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-1 h-7 rounded-full bg-gradient-to-b from-orange-500 via-white to-green-600" />
            <div>
              <h1 className="text-xs sm:text-sm font-bold leading-tight tracking-tight">
                India Elections <span className="text-orange-500">2026</span>
              </h1>
              <p className="hidden sm:block text-[10px] text-muted-foreground font-mono">
                Assembly GEN-BYE-Election · Mar–May 2026
              </p>
            </div>
          </div>

          {/* Stats — scrollable row so they never wrap/cut */}
          <div className="flex items-center gap-1.5 ml-3 overflow-x-auto no-scrollbar">
            <StatPill value={data.election_info.total_states} label="States"         color="text-orange-500" />
            <StatPill value={data.election_info.total_constituencies} label="ACs"    color="text-blue-400" />
            <StatPill value={data.election_info.total_candidates} label="Candidates" color="text-green-500" />
          </div>

          {/* Timestamp — desktop only */}
          <span className="hidden lg:block text-[10px] font-mono text-muted-foreground ml-auto whitespace-nowrap">
            {data.election_info.generated_at}
          </span>
        </div>

        {/* Row 2: state tabs — scrollable, desktop shows full names, mobile truncates */}
        <div className="flex items-center gap-1 px-3 pb-2 sm:px-4 overflow-x-auto no-scrollbar">
          <TabBtn
            active={view === 'overview'}
            onClick={() => { setView('overview'); setSelectedState(null); setSelectedConst(null); setMobileTab('browse') }}
          >
            All States
          </TabBtn>
          {electionStates.map((s) => {
            const sd = data.states[s]
            return (
              <TabBtn
                key={s}
                active={selectedState === s}
                onClick={() => handleStateSelect(s)}
              >
                <span className="hidden sm:inline">{s}</span>
                <span className="sm:hidden">{abbreviate(s)}</span>
                <span className="font-mono bg-muted/60 rounded px-1 text-[9px] ml-1">
                  {sd?.total_candidates?.toLocaleString() || '…'}
                </span>
              </TabBtn>
            )
          })}
        </div>
      </header>

      {/* ── MOBILE: tab switcher Map | Browse ──────────────────── */}
      <div className="flex-shrink-0 lg:hidden border-b border-border bg-card">
        <div className="flex">
          <MobileTabBtn active={mobileTab === 'map'} onClick={() => setMobileTab('map')}>
            Map
          </MobileTabBtn>
          <MobileTabBtn active={mobileTab === 'browse'} onClick={() => setMobileTab('browse')}>
            {browseLabel}
          </MobileTabBtn>
        </div>
      </div>

      {/* ── MAIN BODY ──────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── MAP ─────────────────────────────────────────────── */}
        {/* Mobile: full screen when map tab active */}
        {/* Desktop: fixed left column */}
        <div className={`
          flex-shrink-0 border-border overflow-hidden
          ${/* mobile: full width, shown only on map tab */''}
          w-full lg:w-[420px] xl:w-[480px]
          border-b lg:border-b-0 lg:border-r
          ${mobileTab === 'map' ? 'flex flex-col' : 'hidden'}
          lg:flex lg:flex-col
        `}>
          <IndiaMap
            electionStates={electionStates}
            selectedState={selectedState}
            onStateClick={handleStateSelect}
          />
        </div>

        {/* ── DETAIL PANEL ────────────────────────────────────── */}
        {/* Mobile: full screen when browse tab active */}
        {/* Desktop: always visible flex-1 */}
        <div className={`
          flex-1 overflow-hidden flex flex-col
          ${mobileTab === 'browse' ? 'flex' : 'hidden'}
          lg:flex
        `}>
          {view === 'overview' && (
            <OverviewPanel
              data={data}
              electionStates={electionStates}
              onStateSelect={handleStateSelect}
            />
          )}
          {view === 'state' && stateData && (
            <StatePanel
              stateData={stateData}
              onBack={handleBack}
              onConstSelect={handleConstSelect}
            />
          )}
          {view === 'constituency' && selectedState && selectedConst && (
            <ConstituencyPanel
              stateName={selectedState}
              constName={selectedConst}
              candidates={constCandidates}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatPill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Badge variant="outline" className="font-mono text-[10px] sm:text-xs gap-1 whitespace-nowrap flex-shrink-0 px-2 py-0.5">
      <span className={`font-bold ${color}`}>{value.toLocaleString()}</span>
      <span className="hidden sm:inline">{label}</span>
    </Badge>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-colors whitespace-nowrap flex items-center flex-shrink-0 ${
        active
          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}

function MobileTabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-xs font-semibold transition-colors border-b-2 ${
        active
          ? 'border-orange-500 text-orange-400'
          : 'border-transparent text-muted-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function abbreviate(name: string): string {
  const map: Record<string, string> = {
    'Assam': 'AS', 'West Bengal': 'WB', 'Kerala': 'KL',
    'Puducherry': 'PY', 'Tamil Nadu': 'TN',
  }
  return map[name] ?? name.slice(0, 2).toUpperCase()
}

// ── Overview panel ──────────────────────────────────────────────────────────

function OverviewPanel({
  data,
  electionStates,
  onStateSelect,
}: {
  data: DashboardData
  electionStates: string[]
  onStateSelect: (s: string) => void
}) {
  return (
    <div className="p-4 sm:p-5 overflow-y-auto h-full">
      <h2 className="text-sm font-semibold mb-0.5 text-orange-400">
        Assembly General Bye-Election 2026
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Tap a state tab or map region to explore constituencies and candidates.
      </p>

      {/* State cards — 1 col mobile, 2 col sm, 3 col xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {electionStates.map((s) => {
          const sd = data.states[s]
          const total = sd?.total_candidates || 0
          const topParties = Object.entries(sd?.party_summary || {})
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)

          return (
            <button
              key={s}
              onClick={() => onStateSelect(s)}
              className="text-left p-4 rounded-xl border border-border bg-card hover:border-orange-500/40 hover:bg-orange-500/5 active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold group-hover:text-orange-400 transition-colors">
                  {s}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono bg-muted rounded px-1.5 py-0.5">
                  {sd?.constituency_count || 0} ACs
                </span>
              </div>
              <div className="text-3xl font-bold font-mono text-orange-500 mb-0.5 tabular-nums">
                {total.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                candidates
              </div>
              <div className="flex gap-1 flex-wrap">
                {topParties.map(([p, count]) => (
                  <span
                    key={p}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ background: partyColor(p) }}
                    title={`${p}: ${count}`}
                  >
                    {p.substring(0, 6)}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
