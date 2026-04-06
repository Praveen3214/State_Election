'use client'

import { useState } from 'react'
import type { StateData } from '@/lib/types'
import { partyColor, partyInitials } from '@/lib/party-colors'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

interface Props {
  stateData: StateData
  onBack: () => void
  onConstSelect: (constName: string) => void
}

export default function StatePanel({ stateData, onBack, onConstSelect }: Props) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'count'>('count')

  const constituencies = Object.entries(stateData.constituencies || {})

  const filtered = constituencies
    .filter(([name]) =>
      name.toLowerCase().includes(search.toLowerCase())
    )
    .sort(([aName, aCands], [bName, bCands]) =>
      sortBy === 'count'
        ? bCands.length - aCands.length
        : aName.localeCompare(bName)
    )

  const topParties = Object.entries(stateData.party_summary || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  const accepted = constituencies.reduce((sum, [, cands]) =>
    sum + cands.filter(c => c.status === 'Accepted').length, 0)
  const totalCands = stateData.total_candidates || 0
  const acceptRate = totalCands > 0 ? Math.round((accepted / totalCands) * 100) : 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* State header */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border bg-card">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            aria-label="Back to overview"
          >
            ← Back
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate">{stateData.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <Badge variant="outline" className="font-mono text-xs gap-1">
                <span className="text-orange-500 font-bold">{totalCands}</span> Candidates
              </Badge>
              <Badge variant="outline" className="font-mono text-xs gap-1">
                <span className="text-blue-400 font-bold">{stateData.constituency_count}</span> ACs
              </Badge>
              <Badge variant="outline" className="font-mono text-xs gap-1">
                <span className="text-green-500 font-bold">{acceptRate}%</span> Accepted
              </Badge>
              <Badge variant="outline" className="font-mono text-xs gap-1">
                <span className="text-purple-400 font-bold">{topParties.length}+</span> Parties
              </Badge>
            </div>
          </div>
        </div>

        {/* Party strip */}
        {topParties.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {topParties.map(([party, count]) => (
              <div
                key={party}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold text-white"
                style={{ background: partyColor(party) }}
                title={`${party}: ${count} candidates`}
              >
                <span>{partyInitials(party)}</span>
                <span className="opacity-80 font-mono">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search + sort bar */}
      <div className="flex-shrink-0 px-5 py-2.5 border-b border-border bg-background/50 flex gap-2 items-center">
        <Input
          placeholder="Search constituency…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-7 text-xs flex-1"
        />
        <div className="flex text-[11px] border border-border rounded-md overflow-hidden flex-shrink-0">
          <button
            onClick={() => setSortBy('count')}
            className={`px-2.5 py-1 transition-colors ${
              sortBy === 'count'
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            By Candidates
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2.5 py-1 border-l border-border transition-colors ${
              sortBy === 'name'
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            A–Z
          </button>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono flex-shrink-0">
          {filtered.length}/{constituencies.length}
        </span>
      </div>

      {/* Constituency grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-12">
            No constituencies match "{search}"
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {filtered.map(([constName, candidates]) => {
              const acceptedCount = candidates.filter(c => c.status === 'Accepted').length
              const partiesHere = [...new Set(candidates.map(c => c.party))].slice(0, 4)
              const contestLevel =
                candidates.length >= 8 ? 'high' :
                candidates.length >= 5 ? 'medium' : 'low'

              return (
                <button
                  key={constName}
                  onClick={() => onConstSelect(constName)}
                  className="text-left p-3 rounded-xl border border-border bg-card hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold group-hover:text-orange-400 transition-colors leading-tight">
                      {constName}
                    </span>
                    <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      contestLevel === 'high'
                        ? 'bg-red-500/15 text-red-400'
                        : contestLevel === 'medium'
                        ? 'bg-yellow-500/15 text-yellow-400'
                        : 'bg-green-500/15 text-green-400'
                    }`}>
                      {candidates.length} candidates
                    </span>
                  </div>

                  <div className="flex gap-2 mb-2 text-[10px] text-muted-foreground font-mono">
                    <span className="text-green-500">{acceptedCount} accepted</span>
                    {candidates.length - acceptedCount > 0 && (
                      <span className="text-red-400">{candidates.length - acceptedCount} other</span>
                    )}
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {partiesHere.map(p => (
                      <span
                        key={p}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white opacity-90"
                        style={{ background: partyColor(p) }}
                      >
                        {partyInitials(p)}
                      </span>
                    ))}
                    {[...new Set(candidates.map(c => c.party))].length > 4 && (
                      <span className="text-[9px] text-muted-foreground px-1">
                        +{[...new Set(candidates.map(c => c.party))].length - 4}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
