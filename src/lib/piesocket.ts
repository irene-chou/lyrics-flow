const PIESOCKET_API_KEY = import.meta.env.VITE_PIESOCKET_API_KEY ?? ''
const PIESOCKET_CLUSTER_ID = import.meta.env.VITE_PIESOCKET_CLUSTER_ID ?? 'demo'

export function getSessionId(): string {
  let id = localStorage.getItem('lf-session-id')
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
    localStorage.setItem('lf-session-id', id)
  }
  return id
}

export function getChannelName(): string {
  return `lyrics-flow-${getSessionId()}`
}

export function getOBSUrl(): string {
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/')
  const params = new URLSearchParams({
    s: getSessionId(),
    k: PIESOCKET_API_KEY,
    c: PIESOCKET_CLUSTER_ID,
  })
  return `${base}obs.html?${params.toString()}`
}

export { PIESOCKET_API_KEY, PIESOCKET_CLUSTER_ID }
