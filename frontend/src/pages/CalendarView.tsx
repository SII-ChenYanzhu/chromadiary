import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar } from '../components/Calendar'
import { SettingsModal } from '../components/SettingsModal'
import { ThemeBackdropArt } from '../components/ThemeBackdropArt'
import { useJournalStore } from '../store/useJournalStore'
import * as api from '../api/client'

export function CalendarView() {
  const navigate = useNavigate()
  const { markedDates, diaryDates, setMarkedDates, setDiaryDates, setSettings } = useJournalStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const ym = format(currentMonth, 'yyyy-MM')
    api.getMonthDates(ym)
      .then((res) => {
        setMarkedDates(res.dates)
        setDiaryDates(res.diary_dates)
      })
      .catch(() => {})
  }, [currentMonth])

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {})
  }, [])

  const handleDayClick = (date: string) => navigate(`/day/${date}`)

  const handleMonthSummary = () => {
    const ym = format(currentMonth, 'yyyy-MM')
    navigate(`/summary/month/${ym}`)
  }

  return (
    <div className="page-shell min-h-screen">
      <div className="relative mx-auto w-full max-w-5xl px-5 py-8 sm:px-7 lg:px-8 lg:py-9">
        <ThemeBackdropArt className="pointer-events-none absolute inset-x-0 top-0 h-[18rem]" />
        <div className="mb-9 flex items-center justify-between lg:mb-10">
          <div className="relative">
            <span className="soft-pill mb-3 text-[#b46f86]">彩色手账</span>
            <div className="absolute -left-3 top-6 h-14 w-14 rounded-full bg-[#ffe4ec] blur-2xl" />
            <h1 className="font-display relative text-3xl font-semibold tracking-[0.08em] text-text-main lg:text-4xl">
              日记
            </h1>
            <p className="mt-1 text-sm text-text-muted">记录每一天，也收集一点心情的颜色</p>
          </div>
          <div className="flex gap-2 lg:gap-3">
            <button onClick={handleMonthSummary} className="btn-ghost text-sm">
              月报
            </button>
            <button onClick={() => setSettingsOpen(true)} className="btn-ghost text-sm">
              ⚙
            </button>
          </div>
        </div>

        <div className="card relative overflow-hidden lg:min-h-[62vh]">
          <div className="absolute -left-8 top-5 h-28 w-28 rounded-full bg-[#ffd8e8] opacity-55 blur-3xl" />
          <div className="absolute -right-10 bottom-8 h-32 w-32 rounded-full bg-[#d9e9ff] opacity-55 blur-3xl" />
          <div className="absolute right-1/4 top-10 h-12 w-12 rounded-full border border-white/60 bg-white/25" />
          <div className="absolute left-1/4 bottom-12 h-8 w-8 rounded-full border border-white/60 bg-white/30" />
          <Calendar
            currentMonth={currentMonth}
            markedDates={markedDates}
            diaryDates={diaryDates}
            onMonthChange={setCurrentMonth}
            onDayClick={handleDayClick}
          />
        </div>

        <button
          onClick={() => handleDayClick(format(new Date(), 'yyyy-MM-dd'))}
          className="mt-4 w-full rounded-card border py-3.5 text-base font-medium
                     transition-colors duration-150"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            boxShadow: 'var(--card-shadow)',
            color: 'rgb(var(--primary))',
          }}
        >
          打开今天
        </button>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
