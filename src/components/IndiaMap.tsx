'use client'

// SSR-safe wrapper — Leaflet requires browser APIs
// This component is imported via dynamic() with ssr:false in Dashboard.tsx
import MapClient from './MapClient'

interface Props {
  electionStates: string[]
  selectedState: string | null
  onStateClick: (state: string) => void
}

export default function IndiaMap(props: Props) {
  return <MapClient {...props} />
}
