'use client'
import { useRef, useEffect } from 'react'

export default function ToolFrame({ toolId }: { toolId: string }) {
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return

    const handler = (ev: MessageEvent) => {
      if (ev.source !== iframe.contentWindow) return
      console.log('tool message', ev.data)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return (
    <iframe
      ref={ref}
      src={`/tools/${toolId}`}
      sandbox="allow-scripts"
      className="w-full h-64 border"
    />
  )
}
