const KNOWN: Record<string, string> = {
  BJP: '#FF6B00', INC: '#00A651', AITC: '#1a9e7e', TMC: '#1a9e7e',
  'CPI(M)': '#c0392b', CPM: '#c0392b', CPI: '#e74c3c', 'CPI-M': '#c0392b',
  AAP: '#0073CF', BSP: '#1665C0', NCP: '#003594', JDU: '#009B4E',
  DMK: '#bd0029', AIADMK: '#2c3e50', MDMK: '#8e44ad',
  AGP: '#27ae60', AIUDF: '#16a085', BPF: '#6c3483', UPPL: '#e91e8c',
  NPP: '#795548', UDP: '#1565C0', PDF: '#e67e22', KNP: '#DC143C',
  IUML: '#2e7d32', RSP: '#c62828', 'KC(M)': '#00838f', 'NCP(SP)': '#1565C0',
  SHS: '#f57c00', SP: '#e53935', RJD: '#1976d2', SUCI: '#c62828',
  TDP: '#ffab00', YSRCP: '#0d47a1', BRS: '#f06292', TPDK: '#43a047',
  AINRC: '#00695c', PMK: '#558b2f', VCK: '#4e342e', DMDK: '#6d4c41',
  MNM: '#37474f', AMMK: '#37474f', KMDK: '#e65100',
  IND: '#546e7a', NOTA: '#37474f', 'IND.': '#546e7a',
}

export function partyColor(party: string): string {
  if (!party) return '#546e7a'
  const key = party.toUpperCase().trim()
  if (KNOWN[key]) return KNOWN[key]
  if (KNOWN[party]) return KNOWN[party]
  // Hash-based deterministic color for unknown parties
  let h = 0
  for (const c of party) h = c.charCodeAt(0) + ((h << 5) - h)
  return `hsl(${Math.abs(h) % 300 + 30}, 55%, 42%)`
}

export function partyInitials(party: string): string {
  if (!party || party === 'IND') return 'IND'
  return party.replace(/\(.*\)/g, '').trim().substring(0, 4)
}

export const TIER1_PARTIES = new Set([
  'BJP', 'INC', 'CPI(M)', 'CPM', 'CPI', 'BSP', 'NCP', 'AAP',
  'AITC', 'TMC', 'SP', 'DMK', 'AIADMK',
])
