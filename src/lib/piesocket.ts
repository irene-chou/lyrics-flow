const PIESOCKET_API_KEY = import.meta.env.VITE_PIESOCKET_API_KEY ?? ''
const PIESOCKET_CLUSTER_ID = import.meta.env.VITE_PIESOCKET_CLUSTER_ID ?? 'demo'

export function getSessionId(): string {
  let id = localStorage.getItem('lb-session-id')
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10)
    localStorage.setItem('lb-session-id', id)
  }
  return id
}

export function getChannelName(): string {
  return `lyribox-${getSessionId()}`
}

export function getOBSUrl(): string {
  const base = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/')
  return `${base}obs.html?s=${getSessionId()}`
}

export { PIESOCKET_API_KEY, PIESOCKET_CLUSTER_ID }
