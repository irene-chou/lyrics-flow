import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * Replace __VITE_*__ placeholders in public HTML files at build time.
 * Vite does not process files in public/ with import.meta.env,
 * so we handle the substitution manually during the build.
 */
function envReplacementPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'env-replacement',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && typeof file.source === 'string' && file.fileName.endsWith('.html')) {
          file.source = file.source
            .replace(/__VITE_PIESOCKET_API_KEY__/g, env.VITE_PIESOCKET_API_KEY ?? '')
            .replace(/__VITE_PIESOCKET_CLUSTER_ID__/g, env.VITE_PIESOCKET_CLUSTER_ID ?? 'demo')
        }
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    base: '/lyrics-flow/',
    plugins: [react(), tailwindcss(), envReplacementPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
    },
  }
})
