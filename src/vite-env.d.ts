/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PIESOCKET_API_KEY: string
  readonly VITE_PIESOCKET_CLUSTER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
