'use client'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { createToolchain } from '@/lib/toolchains'

interface ToolMeta { id: string; name: string }

export default function ToolchainComposer({
  tools,
  onRun,
}: {
  tools: ToolMeta[]
  onRun?: (ids: string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [name, setName] = useState('')
  const supabase = getSupabaseBrowserClient()

  const toggle = (id: string) => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]
    )
  }

  const save = async () => {
    if (!name || selected.length === 0) return
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user!
      await createToolchain(supabase, user.id, name, selected)
      setSelected([])
      setName('')
    } catch (err) {
      console.error('Failed to create chain', err)
    }
  }

  const run = () => {
    if (onRun) onRun(selected)
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Toolchain</h2>
      <input
        className="border p-1"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <ul className="space-y-1">
        {tools.map(t => (
          <li key={t.id} className="flex items-center space-x-2">
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={selected.includes(t.id)}
                onChange={() => toggle(t.id)}
              />
              <span>{t.name}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="space-x-2">
        <button onClick={save} className="px-2 py-1 bg-blue-600 text-white rounded">
          Save Chain
        </button>
        <button onClick={run} className="px-2 py-1 bg-green-600 text-white rounded">
          Run
        </button>
      </div>
    </div>
  )
}

