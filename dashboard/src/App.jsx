import { useState, useEffect } from 'react'
import OssDashboard from './OssDashboard'

function App() {
  // Default to dark mode for Cardano Foundation branding
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return <OssDashboard darkMode={darkMode} setDarkMode={setDarkMode} />
}

export default App
