'use client'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { listPlugins, AIPlugin } from '@/lib/plugins'

export default function PluginMarketplace({
  onUse,
}: {
  onUse?: (id: string) => void
}) {
  const [plugins, setPlugins] = useState<AIPlugin[]>([])
  const [filter, setFilter] = useState<'public' | 'private'>('public')

  useEffect(() => {
    const load = async () => {
      try {
        const list = await listPlugins(supabaseBrowser, filter)
        setPlugins(list)
      } catch (err) {
        console.error('Failed to load plugins', err)
      }
    }
    load()
  }, [filter])

  return (
    <div className="space-y-2">
      <div>
        <select
          className="border p-1"
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      <ul className="space-y-2">
        {plugins.map(p => (
          <li key={p.id} className="border p-2 flex justify-between">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">{p.description}</div>
            </div>
            <div className="space-x-2">
              <a
                href={p.api_url}
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Preview
              </a>
              {onUse && (
                <button
                  onClick={() => onUse(p.id)}
                  className="text-blue-600 hover:underline"
                >
                  Use
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
