'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { getToolById } from '@/lib/tools'

const makeEmbedSnippet = (id: string) =>
  `<iframe src="${location.origin}/embed/${id}" style="width:100%;border:0;height:300px"></iframe>`

interface ToolMeta {
  id: string
  name: string
  updated_at: string
}

export default function UserToolList({ tools: initialTools, onLoad }: { tools?: ToolMeta[]; onLoad: (tool: { html: string; script: string }) => void }) {
  const [tools, setTools] = useState<ToolMeta[]>(initialTools || [])
  const [loading, setLoading] = useState<string | null>(null)
  const [embedFor, setEmbedFor] = useState<string | null>(null)
  const [fetchingTools, setFetchingTools] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    setFetchingTools(true)
    try {
      const response = await fetch('/api/tools')
      if (response.ok) {
        const toolsData = await response.json()
        setTools(toolsData)
      }
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setFetchingTools(false)
    }
  }

  const handleLoad = async (id: string) => {
    setLoading(id)
    try {
      const tool = await getToolById(supabase, id)
      onLoad(tool)
    } catch (err) {
      console.error('Failed to load tool', err)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      if (response.ok) {
        setTools(tools.filter(t => t.id !== id))
      } else {
        throw new Error('Failed to delete tool')
      }
    } catch (error) {
      console.error('Failed to delete tool:', error)
      alert('Failed to delete tool. Please try again.')
    }
  }

  if (fetchingTools) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 mx-auto mb-4">
          <img 
            src="/images/wobble-main.svg" 
            alt="Loading" 
            className="w-8 h-8 animate-spin"
          />
        </div>
        <p className="text-gray-600">Loading your tools...</p>
      </div>
    )
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 opacity-50">
          <img 
            src="/images/wobble-main.svg" 
            alt="No tools" 
            className="w-16 h-16"
          />
        </div>
        <p className="text-gray-600 mb-2">No tools yet!</p>
        <p className="text-sm text-gray-500">Generate your first tool using the form above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tools.map(t => (
        <div key={t.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{t.name}</h3>
              <p className="text-sm text-gray-500">
                Updated {new Date(t.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleLoad(t.id)}
                disabled={loading === t.id}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                {loading === t.id ? '⏳' : '👁️'} {loading === t.id ? 'Loading...' : 'View'}
              </button>
              <button
                onClick={() => setEmbedFor(embedFor === t.id ? null : t.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                📋 Embed
              </button>
              <button
                onClick={() => handleDelete(t.id, t.name)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
          
          {embedFor === t.id && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-2">Embed Code:</p>
              <textarea
                readOnly
                className="w-full text-xs text-gray-600 bg-white border rounded p-2 font-mono"
                rows={3}
                value={makeEmbedSnippet(t.id)}
                onClick={(e) => e.currentTarget.select()}
              />
              <p className="text-xs text-gray-500 mt-1">Click to select all</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

