type Listener = (data: any) => void
const listeners: Record<string, Listener[]> = {}

export const emit = (event: string, data?: any) => {
  (listeners[event] || []).forEach(fn => fn(data))
}

export const on = (event: string, fn: Listener) => {
  listeners[event] = listeners[event] || []
  listeners[event].push(fn)
  return () => {
    listeners[event] = listeners[event].filter(f => f !== fn)
  }
}
