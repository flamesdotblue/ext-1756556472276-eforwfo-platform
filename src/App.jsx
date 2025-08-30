import { useEffect, useMemo, useState, useCallback } from 'react'
import HeaderBar from './components/HeaderBar'
import ControlPanel from './components/ControlPanel'
import RunsGrid from './components/RunsGrid'

const GRAPHQL_ENDPOINT = 'https://api.wandb.ai/graphql'

const RUNS_QUERY = `
  query Runs($entity: String!, $project: String!, $first: Int) {
    project(entityName: $entity, name: $project) {
      id
      name
      entityName
      runCount
      runs(first: $first, order: {orderKey: "created_at", orderDirection: DESC}) {
        edges {
          node {
            id
            name
            displayName
            state
            createdAt
            updatedAt
            sweepName
            tags
            summaryMetrics
            config
          }
        }
      }
    }
  }
`

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue]
}

export default function App() {
  const [apiKey, setApiKey] = useLocalStorage('wandb_api_key', '')
  const [entity, setEntity] = useLocalStorage('wandb_entity', '')
  const [project, setProject] = useLocalStorage('wandb_project', '')
  const [limit, setLimit] = useLocalStorage('wandb_limit', 20)

  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null)

  const canQuery = useMemo(() => apiKey && entity && project, [apiKey, entity, project])

  const fetchRuns = useCallback(async (signal) => {
    if (!canQuery) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query: RUNS_QUERY,
          variables: { entity, project, first: Number(limit) || 20 },
        }),
        signal,
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Network error: ${res.status} ${text}`)
      }
      const data = await res.json()
      if (data.errors) {
        throw new Error(data.errors?.[0]?.message || 'Unknown GraphQL error')
      }
      const edges = data?.data?.project?.runs?.edges || []
      const parsed = edges.map((e) => normalizeRun(e.node))
      setRuns(parsed)
      setLastRefreshedAt(new Date())
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Failed to fetch runs')
    } finally {
      setLoading(false)
    }
  }, [apiKey, canQuery, entity, project, limit])

  useEffect(() => {
    const controller = new AbortController()
    fetchRuns(controller.signal)
    return () => controller.abort()
  }, [fetchRuns])

  useEffect(() => {
    const interval = setInterval(() => {
      const controller = new AbortController()
      fetchRuns(controller.signal)
    }, 20000)
    return () => clearInterval(interval)
  }, [fetchRuns])

  const handleManualRefresh = () => {
    const controller = new AbortController()
    fetchRuns(controller.signal)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HeaderBar onRefresh={handleManualRefresh} lastRefreshedAt={lastRefreshedAt} />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        <ControlPanel
          apiKey={apiKey}
          setApiKey={setApiKey}
          entity={entity}
          setEntity={setEntity}
          project={project}
          setProject={setProject}
          limit={limit}
          setLimit={setLimit}
          onApply={handleManualRefresh}
        />

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        ) : null}

        <RunsGrid runs={runs} loading={loading} />
      </main>
    </div>
  )
}

function normalizeRun(node) {
  // Flatten and derive some helpful fields
  const summary = safeJson(node.summaryMetrics)
  const config = safeJson(node.config)
  const createdAt = node.createdAt ? new Date(node.createdAt) : null
  const updatedAt = node.updatedAt ? new Date(node.updatedAt) : null

  // Derive progress percent if possible
  const step = getFirstNumber(summary, ['_step', 'global_step', 'step', 'train/global_step'])
  const total = getFirstNumber(config, ['max_steps', 'max_train_steps', 'training_steps', 'num_train_steps', 'total_steps', 'trainer.max_steps'])
  const progress = total && step ? Math.min(100, Math.round((step / total) * 100)) : null

  // Key metrics guesses
  const loss = getFirstNumber(summary, ['loss', 'train/loss', 'training_loss', 'train_loss'])
  const valLoss = getFirstNumber(summary, ['val/loss', 'validation/loss', 'eval/loss', 'valid_loss'])
  const acc = getFirstNumber(summary, ['accuracy', 'eval/accuracy', 'val/accuracy', 'acc'])

  return {
    id: node.id,
    name: node.displayName || node.name,
    state: node.state,
    createdAt,
    updatedAt,
    sweepName: node.sweepName || null,
    tags: Array.isArray(node.tags) ? node.tags : [],
    summary,
    config,
    metrics: { loss, valLoss, acc },
    progress,
  }
}

function safeJson(value) {
  if (!value) return {}
  if (typeof value === 'object') return value
  try { return JSON.parse(value) } catch { return {} }
}

function getFirstNumber(obj, keys) {
  for (const k of keys) {
    const v = getByPath(obj, k)
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return null
}

function getByPath(obj, path) {
  if (!obj) return undefined
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}
