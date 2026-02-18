import { ThemeProvider } from 'next-themes'
import { AppLayout } from './components/layout/AppLayout'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="lf-theme">
      <AppLayout />
    </ThemeProvider>
  )
}

export default App
