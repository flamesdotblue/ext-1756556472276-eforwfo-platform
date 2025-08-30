import { useState } from 'react'
import { Lock, KeyRound } from 'lucide-react'

export default function ControlPanel({ apiKey, setApiKey, entity, setEntity, project, setProject, limit, setLimit, onApply }) {
  const [showKey, setShowKey] = useState(false)

  const canApply = apiKey && entity && project

  return (
    <section className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 flex flex-col gap-1">
          <label className="text-xs text-white/60">Entity</label>
          <input
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            placeholder="your-team-or-user"
            className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:border-indigo-500"
          />
        </div>

        <div className="col-span-1 flex flex-col gap-1">
          <label className="text-xs text-white/60">Project</label>
          <input
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="your-project"
            className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:border-indigo-500"
          />
        </div>

        <div className="col-span-1 flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs text-white/60"><KeyRound className="h-3.5 w-3.5"/> W&B API Key</label>
          <div className="flex items-center gap-2">
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="paste or use WANDB_API_KEY"
              type={showKey ? 'text' : 'password'}
              className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:border-indigo-500"
            />
            <button
              onClick={() => setShowKey((s) => !s)}
              className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-2 text-xs hover:bg-white/10"
            >{showKey ? 'Hide' : 'Show'}</button>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-white/50"><Lock className="h-3 w-3"/> Stored locally in your browser</p>
        </div>

        <div className="col-span-1 flex flex-col gap-1">
          <label className="text-xs text-white/60">Show Last N Runs</label>
          <input
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            type="number"
            min={1}
            max={200}
            className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none placeholder:text-white/40 focus:border-indigo-500"
          />
          <button
            onClick={onApply}
            disabled={!canApply}
            className="mt-2 inline-flex items-center justify-center rounded-md border border-white/10 bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-white/10"
          >Apply</button>
        </div>
      </div>
    </section>
  )
}
