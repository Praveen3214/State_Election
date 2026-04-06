import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ state: string }> }
) {
  // In Next.js 16, params is async
  const { state } = await params
  const slug = state.toLowerCase().replace(/\s+/g, '_')

  // Try multiple file name patterns
  const candidates = [
    path.join(process.cwd(), 'public', 'geojson', `${slug}.geojson`),
    path.join(process.cwd(), 'public', 'geojson', `${state}.geojson`),
    path.join(process.cwd(), 'public', 'geojson', `${slug}.json`),
  ]

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, 'utf-8')
      return new Response(data, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
  }

  return NextResponse.json({ error: `GeoJSON not found for state: ${state}` }, { status: 404 })
}
