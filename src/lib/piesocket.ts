const PIESOCKET_API_KEY = 'xlkQUJ7Y5BKQ1m0rNfNx2R1yhLBTu9mrVWOFdrnB'
const PIESOCKET_CLUSTER_ID = 'demo'

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
  return `${base}obs.html?s=${getSessionId()}`
}

export { PIESOCKET_API_KEY, PIESOCKET_CLUSTER_ID }
