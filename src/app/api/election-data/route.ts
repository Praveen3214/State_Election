import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getDataPath(): string {
  return (
    process.env.ELECTION_DATA_PATH ||
    path.join(process.cwd(), '..', 'Candidate_Affidavit', 'dashboard_data.json')
  )
}

export async function GET() {
  try {
    const dataPath = getDataPath()
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: `Data file not found at: ${dataPath}. Run build_dashboard_data.py first.` },
        { status: 404 }
      )
    }
    const raw = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(raw)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to load election data', detail: String(err) },
      { status: 500 }
    )
  }
}
