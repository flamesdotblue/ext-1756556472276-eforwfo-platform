import { CheckCircle2, AlertCircle, XCircle, Clock, Tag } from 'lucide-react'

export default function RunCard({ run }) {
  const stateBadge = getStateBadge(run.state)

  return (
    <article className="group rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{run.name}</h3>
          <p className="mt-0.5 text-xs text-white/50">{run.sweepName ? `Sweep: ${run.sweepName}` : `Updated ${timeAgo(run.updatedAt)}`}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] ${stateBadge.className}`}>
          {stateBadge.icon}
          {stateBadge.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="Loss" value={formatNumber(run.metrics.loss)} />
        <Metric label="Val Loss" value={formatNumber(run.metrics.valLoss)} />
        <Metric label="Acc" value={formatPercent(run.metrics.acc)} />
      </div>

      {run.progress != null ? (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-white/60">
            <span>Progress</span>
            <span>{run.progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${run.progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
          <Clock className="h-3.5 w-3.5" />
          <span>Started {timeAgo(run.createdAt)}</span>
        </div>
      )}

      {run.tags && run.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {run.tags.slice(0, 6).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
              <Tag className="h-3 w-3" /> {t}
            </span>
          ))}
          {run.tags.length > 6 ? (
            <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">+{run.tags.length - 6} more</span>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2">
      <div className="text-[10px] uppercase tracking-wide text-white/50">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value ?? '—'}</div>
    </div>
  )
}

function getStateBadge(state) {
  const base = 'border px-2 py-1 rounded-md text-[11px] inline-flex items-center gap-1'
  switch ((state || '').toLowerCase()) {
    case 'finished':
    case 'crashed': // treat finished/crashed distinctly below but styling similar
    case 'failed':
    case 'killed':
    case 'stopped':
    case 'running':
    case 'queued':
    default:
  }

  if (!state) return { label: 'Unknown', className: 'border-white/10 bg-white/5 text-white/70', icon: <AlertCircle className="h-3.5 w-3.5" /> }
  const s = state.toLowerCase()
  if (s === 'finished' || s === 'complete' || s === 'completed') {
    return { label: 'Finished', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', icon: <CheckCircle2 className="h-3.5 w-3.5" /> }
  }
  if (s === 'running') {
    return { label: 'Running', className: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300', icon: spinner() }
  }
  if (s === 'queued' || s === 'pending') {
    return { label: 'Queued', className: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300', icon: <Clock className="h-3.5 w-3.5" /> }
  }
  if (s === 'crashed' || s === 'failed' || s === 'killed') {
    return { label: capitalize(s), className: 'border-red-500/30 bg-red-500/10 text-red-300', icon: <XCircle className="h-3.5 w-3.5" /> }
  }
  if (s === 'stopped' || s === 'cancelled' || s === 'canceled') {
    return { label: 'Stopped', className: 'border-white/20 bg-white/5 text-white/70', icon: <XCircle className="h-3.5 w-3.5" /> }
  }
  return { label: capitalize(s), className: 'border-white/10 bg-white/5 text-white/70', icon: <AlertCircle className="h-3.5 w-3.5" /> }
}

function spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin text-indigo-300" viewBox="0 0 24 24">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function formatNumber(val) {
  if (val == null) return null
  if (Math.abs(val) >= 1000) return val.toFixed(0)
  if (Math.abs(val) >= 100) return val.toFixed(1)
  if (Math.abs(val) >= 1) return val.toFixed(3)
  return val.toExponential(2)
}

function formatPercent(val) {
  if (val == null) return null
  const pct = val <= 1 ? val * 100 : val
  return `${pct.toFixed(1)}%`
}

function timeAgo(date) {
  if (!date) return 'unknown'
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
