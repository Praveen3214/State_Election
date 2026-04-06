import fs from 'fs'
import path from 'path'
import type { DashboardData } from '@/lib/types'
import Dashboard from '@/components/Dashboard'

async function getDashboardData(): Promise<DashboardData | null> {
  // Always read from public/ — works locally and on Vercel
  const dataPath =
    process.env.ELECTION_DATA_PATH ||
    path.join(process.cwd(), 'public', 'dashboard_data.json')
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default async function Page() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 text-center p-8">
        <div className="text-6xl">🗳️</div>
        <h1 className="text-2xl font-bold text-orange-500">Election Dashboard</h1>
        <p className="text-muted-foreground max-w-md">
          Data not found. Make sure{' '}
          <code className="font-mono bg-muted px-2 py-1 rounded text-sm">
            public/dashboard_data.json
          </code>{' '}
          exists, then refresh.
        </p>
      </div>
    )
  }

  return <Dashboard data={data} />
}
