import { Routes, Route, Navigate } from 'react-router-dom'
import { CalendarView } from './pages/CalendarView'
import { DayDetail } from './pages/DayDetail'
import { SummaryView } from './pages/SummaryView'
import { ThemeCanvasBackground } from './components/ThemeCanvasBackground'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { ClickFireworks } from './components/ClickFireworks'
import { useTheme } from './theme/useTheme'

export default function App() {
  const { theme, setTheme } = useTheme()

  return (
    <>
      <ThemeCanvasBackground theme={theme} intensity="vivid" />
      <ClickFireworks />
      <Routes>
        <Route path="/" element={<CalendarView />} />
        <Route path="/day/:date" element={<DayDetail />} />
        <Route path="/summary/:type/:period" element={<SummaryView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ThemeSwitcher theme={theme} onChange={setTheme} />
    </>
  )
}
