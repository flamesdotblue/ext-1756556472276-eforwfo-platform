import RunCard from './RunCard'

export default function RunsGrid({ runs, loading }) {
  if (loading && (!runs || runs.length === 0)) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl border border-white/10 bg-white/5" />
        ))}
      </div>
    )
  }

  if (!runs || runs.length === 0) {
    return (
      <div className="mt-10 text-center text-white/60">No runs found. Set your entity/project and API key above.</div>
    )
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {runs.map((run) => (
        <RunCard key={run.id} run={run} />
      ))}
    </div>
  )
}
