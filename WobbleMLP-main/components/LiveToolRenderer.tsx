// components/LiveToolRenderer.tsx
'use client'
import { useEffect, useRef } from 'react'

export default function LiveToolRenderer({
  tool,
}: {
  tool: { html: string; script: string }
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = `<!DOCTYPE html><html><body>${tool.html}<script>\n${tool.script}\n</script></body></html>`
    iframe.srcdoc = doc
  }, [tool.html, tool.script])

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts"
      className="w-full h-64 border"
    />
  )
}
