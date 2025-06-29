'use client'
import { useState } from 'react'

export default function Foo({ messages }: { messages: any[] }) {
  const [result, setResult] = useState('')

  const run = async () => {
    const res = await fetch('/api/tool-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages }),
    })
    const json = await res.json()
    setResult(json.result || json.error)
  }

  return (
    <div>
      <button onClick={run}>Run</button>
      <pre>{result}</pre>
    </div>
  )
}
