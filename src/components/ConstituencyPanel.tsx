'use client'

import { useState } from 'react'
import type { Candidate } from '@/lib/types'
import { partyColor, partyInitials } from '@/lib/party-colors'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'

interface Props {
  stateName: string
  constName: string
  candidates: Candidate[]
  onBack: () => void
}

const STATUS_STYLES: Record<string, string> = {
  Accepted:  'bg-green-500/15 text-green-400 border-green-500/30',
  Rejected:  'bg-red-500/15 text-red-400 border-red-500/30',
  Withdrawn: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Applied:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

export default function ConstituencyPanel({
  stateName, constName, candidates, onBack
}: Props) {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<string>('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  const statuses = ['All', ...Array.from(new Set(candidates.map(c => c.status))).filter(Boolean)]
  const parties  = [...new Set(candidates.map(c => c.party))].sort()

  const filtered = candidates.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.party.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || c.status === filter
    return matchSearch && matchFilter
  })

  const accepted  = candidates.filter(c => c.status === 'Accepted').length
  const rejected  = candidates.filter(c => c.status === 'Rejected').length

  // Party tally for mini chart
  const partyTally = parties
    .map(p => ({ party: p, count: candidates.filter(c => c.party === p).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border bg-card">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 text-sm"
          >
            ← {stateName}
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate">{constName}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <Badge variant="outline" className="font-mono text-xs gap-1">
                <span className="text-orange-500 font-bold">{candidates.length}</span> Total
              </Badge>
              <Badge variant="outline" className="font-mono text-xs gap-1">
                <span className="text-green-500 font-bold">{accepted}</span> Accepted
              </Badge>
              {rejected > 0 && (
                <Badge variant="outline" className="font-mono text-xs gap-1">
                  <span className="text-red-400 font-bold">{rejected}</span> Rejected
                </Badge>
              )}
              <Badge variant="outline" className="font-mono text-xs gap-1">
                <span className="text-purple-400 font-bold">{parties.length}</span> Parties
              </Badge>
            </div>
          </div>
        </div>

        {/* Mini party bar */}
        {partyTally.length > 0 && (
          <div className="mt-3 flex items-end gap-1.5 h-10">
            {partyTally.map(({ party, count }) => (
              <div key={party} className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
                <span className="text-[9px] text-muted-foreground font-mono">{count}</span>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max(4, (count / partyTally[0].count) * 24)}px`,
                    background: partyColor(party),
                    opacity: 0.85,
                  }}
                  title={party}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 px-5 py-2.5 border-b border-border bg-background/50 flex gap-2 items-center">
        <Input
          placeholder="Search candidate / party…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-7 text-xs flex-1"
        />
        <div className="flex text-[11px] border border-border rounded-md overflow-hidden flex-shrink-0">
          {statuses.map((s, idx) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 transition-colors ${
                idx > 0 ? 'border-l border-border' : ''
              } ${
                filter === s
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-muted-foreground font-mono flex-shrink-0">
          {filtered.length}
        </span>
      </div>

      {/* Candidate list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-12">
            No candidates match your filters.
          </div>
        ) : (
          filtered.map((cand, idx) => {
            const isExpanded = expanded === cand.name + idx
            const statusStyle = STATUS_STYLES[cand.status] ?? 'bg-muted text-muted-foreground border-border'

            return (
              <div
                key={cand.name + idx}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  className="w-full text-left px-4 py-3 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : cand.name + idx)}
                >
                  <div className="flex items-center gap-3">
                    {/* Party badge */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                      style={{ background: partyColor(cand.party) }}
                      title={cand.party}
                    >
                      {partyInitials(cand.party)}
                    </div>

                    {/* Name + party */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold truncate">{cand.name}</span>
                        {cand.gender && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {cand.gender === 'MALE' || cand.gender === 'Male' ? '♂' :
                             cand.gender === 'FEMALE' || cand.gender === 'Female' ? '♀' : '⚧'}
                          </span>
                        )}
                        {cand.age && (
                          <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">
                            {cand.age}y
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {cand.party}
                      </div>
                    </div>

                    {/* Status */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex-shrink-0 ${statusStyle}`}>
                      {cand.status}
                    </span>

                    {/* Expand arrow */}
                    <span className={`text-muted-foreground text-xs transition-transform flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>▾</span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/50 bg-muted/20">
                    <div className="pt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
                      {cand.father_name && (
                        <div>
                          <span className="text-muted-foreground">Father/Spouse: </span>
                          <span className="text-foreground font-medium">{cand.father_name}</span>
                        </div>
                      )}
                      {cand.age && (
                        <div>
                          <span className="text-muted-foreground">Age: </span>
                          <span className="text-foreground font-medium">{cand.age}</span>
                        </div>
                      )}
                      {cand.gender && (
                        <div>
                          <span className="text-muted-foreground">Gender: </span>
                          <span className="text-foreground font-medium capitalize">
                            {cand.gender.toLowerCase()}
                          </span>
                        </div>
                      )}
                      {cand.constituency && (
                        <div>
                          <span className="text-muted-foreground">Constituency: </span>
                          <span className="text-foreground font-medium">{cand.constituency}</span>
                        </div>
                      )}
                      {cand.address && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Address: </span>
                          <span className="text-foreground">{cand.address}</span>
                        </div>
                      )}
                    </div>

                    {cand.profile_url && (
                      <>
                        <Separator className="my-2.5 opacity-30" />
                        <a
                          href={cand.profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          View ECI Affidavit Profile →
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
