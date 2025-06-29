const WINDOW = 60_000
const LIMIT = 10
const buckets = new Map<string, { count: number; start: number }>()

export function checkLimit(key: string) {
  const now = Date.now()
  const b = buckets.get(key)
  if (b && now - b.start < WINDOW) {
    b.count += 1
    if (b.count > LIMIT) return false
  } else {
    buckets.set(key, { count: 1, start: now })
  }
  return true
}
