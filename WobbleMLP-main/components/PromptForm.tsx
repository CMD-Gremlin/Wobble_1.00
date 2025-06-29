// components/PromptForm.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabaseClient'
import { listPlugins, AIPlugin } from '@/lib/plugins'

type PromptFormProps = {
  onSubmit: (prompt: string, pluginId?: string) => void
}

export default function PromptForm({ onSubmit }: PromptFormProps) {
  const [plugins, setPlugins] = useState<AIPlugin[]>([])
  const [plugin, setPlugin] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    console.log('🔌 Loading plugins...');
    listPlugins(supabase)
      .then((data) => {
        console.log('✅ Plugins loaded:', data);
        setPlugins(data);
      })
      .catch(err => {
        console.error('❌ Failed to load plugins:', err);
        setPlugins([]); // Set empty array on error
      })
  }, [supabase])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('🚀 Form submitted!');
    
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get('prompt') as string;
    
    console.log('📝 Prompt:', prompt);
    console.log('🔌 Plugin:', plugin);
    
    if (prompt?.trim()) {
      setLoading(true);
      try {
        onSubmit(prompt.trim(), plugin || undefined);
      } catch (error) {
        console.error('❌ Error in onSubmit:', error);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please enter a prompt!');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <input
        name="prompt"
        placeholder="What do you want to do?"
        className="border p-2 w-full"
      />
      <select
        className="border p-2 w-full"
        value={plugin}
        onChange={e => setPlugin(e.target.value)}
      >
        <option value="">No Plugin</option>
        {plugins.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded transition-colors"
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </form>
  )
}

