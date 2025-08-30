import { RefreshCw, Activity } from 'lucide-react'

export default function HeaderBar({ onRefresh, lastRefreshedAt }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">W&B Mobile Dashboard</h1>
            <p className="text-xs text-white/60">Quickly monitor fine-tuning and training runs</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshedAt ? (
            <p className="hidden text-xs text-white/60 sm:block">Updated {timeAgo(lastRefreshedAt)}</p>
          ) : null}
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium hover:bg-white/10 active:scale-[0.98]"
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </header>
  )
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
