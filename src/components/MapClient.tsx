'use client'

import { useEffect, useRef } from 'react'
import type L from 'leaflet'

interface Props {
  electionStates: string[]
  selectedState: string | null
  onStateClick: (state: string) => void
}

// GeoJSON property key for state name in the geohacker/india dataset
const NAME_KEY = 'NAME_1'

export default function MapClient({ electionStates, selectedState, onStateClick }: Props) {
  const containerRef    = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<L.Map | null>(null)
  const layerMapRef     = useRef<Record<string, L.Path>>({})
  const onClickRef      = useRef(onStateClick)
  const electionRef     = useRef(electionStates)
  const selectedRef     = useRef(selectedState)

  // Keep refs in sync — no re-renders needed
  onClickRef.current  = onStateClick
  electionRef.current = electionStates

  // Re-style selected state whenever it changes
  useEffect(() => {
    const prev = selectedRef.current
    selectedRef.current = selectedState

    // Un-highlight previous
    if (prev && layerMapRef.current[prev]) {
      layerMapRef.current[prev].setStyle(stateStyle(prev, electionRef.current, false))
    }
    // Highlight new selection
    if (selectedState && layerMapRef.current[selectedState]) {
      layerMapRef.current[selectedState].setStyle(selectedStyle())
    }
  }, [selectedState])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((mod) => {
      if (mapRef.current) return   // guard for React StrictMode double-invoke

      const L = mod.default

      // Fix Leaflet's broken default icon paths under webpack/turbopack
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!containerRef.current) return

      const map = L.map(containerRef.current, {
        center:           [22, 80],
        zoom:             4,
        zoomControl:      true,
        attributionControl: false,
        minZoom:          3,
        maxZoom:          9,
        preferCanvas:     false,
      })

      // Dark basemap — no labels so our state names stand out
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      mapRef.current = map

      // ── Load India state boundaries ───────────────────────────────────────
      fetch('https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson')
        .then(r => r.json())
        .then((geojson) => {
          if (!mapRef.current) return

          L.geoJSON(geojson, {
            style: (feature) => {
              const name: string = feature?.properties?.[NAME_KEY] ?? ''
              const isElection = electionRef.current.includes(name)
              const isSelected = selectedRef.current === name
              if (isSelected)   return selectedStyle()
              if (isElection)   return electionStyle()
              return defaultStyle()
            },

            onEachFeature: (feature, lyr) => {
              const name: string = feature?.properties?.[NAME_KEY] ?? ''
              if (!name) return

              const path = lyr as L.Path
              layerMapRef.current[name] = path

              const isElection = electionRef.current.includes(name)

              // Tooltip for every state
              path.bindTooltip(name, {
                sticky:    true,
                direction: 'top',
                className: isElection
                  ? 'leaflet-tooltip-election'
                  : 'leaflet-tooltip-dark',
              })

              if (isElection) {
                path.on('mouseover', () => {
                  if (selectedRef.current !== name) {
                    path.setStyle(hoverStyle())
                  }
                })
                path.on('mouseout', () => {
                  if (selectedRef.current !== name) {
                    path.setStyle(electionStyle())
                  }
                })
                path.on('click', () => {
                  onClickRef.current(name)
                })
              }
            },
          }).addTo(map)
        })
        .catch((err) => console.warn('GeoJSON load failed:', err))
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      layerMapRef.current = {}
    }
  }, [])  // mount once only

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>{`
        /* Election state paths — pointer cursor */
        .leaflet-interactive.election-state {
          cursor: pointer !important;
        }
        /* Dark tooltip */
        .leaflet-tooltip-dark {
          background: rgba(13,17,23,0.92);
          color: #e6edf3;
          border: 1px solid #30363d;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        }
        /* Election state tooltip */
        .leaflet-tooltip-election {
          background: rgba(255,107,0,0.92);
          color: #fff;
          border: 1px solid #ff8c38;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 10px;
          box-shadow: 0 2px 8px rgba(255,107,0,0.4);
        }
        .leaflet-tooltip-dark::before,
        .leaflet-tooltip-election::before { display: none; }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: '#0d1117', cursor: 'default' }}
      />
    </>
  )
}

// ── Style helpers ─────────────────────────────────────────────────────────────

function defaultStyle(): L.PathOptions {
  return {
    fillColor:   '#1e2028',
    fillOpacity: 0.7,
    color:       '#2e3240',
    weight:      0.8,
  }
}

function electionStyle(): L.PathOptions {
  return {
    fillColor:   '#FF6B00',
    fillOpacity: 0.55,
    color:       '#FF8C38',
    weight:      1.5,
  }
}

function hoverStyle(): L.PathOptions {
  return {
    fillColor:   '#FF8C38',
    fillOpacity: 0.75,
    color:       '#FFB74D',
    weight:      2.5,
  }
}

function selectedStyle(): L.PathOptions {
  return {
    fillColor:   '#FF6B00',
    fillOpacity: 0.9,
    color:       '#FFD54F',
    weight:      3,
  }
}

function stateStyle(
  name: string,
  electionStates: string[],
  _isSelected: boolean
): L.PathOptions {
  return electionStates.includes(name) ? electionStyle() : defaultStyle()
}
