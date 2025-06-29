'use client'
import { useState } from 'react'
import Ajv from 'ajv'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function NewPlugin() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [method, setMethod] = useState('POST')
  const [inputSchema, setInputSchema] = useState('{}')
  const [outputSchema, setOutputSchema] = useState('{}')
  const [visibility, setVisibility] = useState<'public' | 'private'>('private')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const save = async () => {
    setError(null)
    setSuccess(false)
    try {
      const ajv = new Ajv()
      const input = JSON.parse(inputSchema)
      const output = JSON.parse(outputSchema)
      ajv.compile(input)
      ajv.compile(output)
      const { data } = await supabaseBrowser.auth.getUser()
      const user = data.user!
      const { error } = await supabaseBrowser
        .from('ai_plugins')
        .insert({
          name,
          description,
          api_url: apiUrl,
          method,
          input_schema: input,
          output_schema: output,
          visibility,
          created_by: user.id,
        })
      if (error) throw error
      setSuccess(true)
      setName('')
      setDescription('')
      setApiUrl('')
      setInputSchema('{}')
      setOutputSchema('{}')
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <main className="p-4 space-y-2">
      <h1 className="text-xl font-semibold">Register Plugin</h1>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">Saved!</p>}
      <input
        className="border p-1 w-full"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <textarea
        className="border p-1 w-full"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <input
        className="border p-1 w-full"
        placeholder="API URL"
        value={apiUrl}
        onChange={e => setApiUrl(e.target.value)}
      />
      <select
        className="border p-1 w-full"
        value={method}
        onChange={e => setMethod(e.target.value)}
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </select>
      <select
        className="border p-1 w-full"
        value={visibility}
        onChange={e => setVisibility(e.target.value as any)}
      >
        <option value="private">Private</option>
        <option value="public">Public</option>
      </select>
      <textarea
        className="border p-1 w-full"
        placeholder="Input JSON Schema"
        rows={4}
        value={inputSchema}
        onChange={e => setInputSchema(e.target.value)}
      />
      <textarea
        className="border p-1 w-full"
        placeholder="Output JSON Schema"
        rows={4}
        value={outputSchema}
        onChange={e => setOutputSchema(e.target.value)}
      />
      <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">
        Save
      </button>
    </main>
  )
}
