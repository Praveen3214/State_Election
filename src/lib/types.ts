export interface Candidate {
  name: string
  party: string
  constituency: string
  status: string
  age: number | null
  gender: string
  father_name: string
  address: string
  profile_url: string
}

export interface StateData {
  name: string
  total_candidates: number
  constituency_count: number
  constituencies: Record<string, Candidate[]>
  party_summary: Record<string, number>
  status?: 'pending' | 'complete'
}

export interface ElectionInfo {
  name: string
  election_states: string[]
  total_states: number
  total_candidates: number
  total_constituencies: number
  generated_at: string
}

export interface DashboardData {
  election_info: ElectionInfo
  states: Record<string, StateData>
}
