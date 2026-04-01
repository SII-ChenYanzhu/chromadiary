import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useJournalStore } from '../store/useJournalStore'
import { DiaryEditor } from '../components/DiaryEditor'
import { TaskList } from '../components/TaskList'
import { EncouragementCard } from '../components/EncouragementCard'
import { ThemeBackdropArt } from '../components/ThemeBackdropArt'
import { getDateInfo } from '../utils/dateInfo'
import * as api from '../api/client'

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function DayDetail() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { currentEntry, setCurrentEntry } = useJournalStore()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    api.getEntry(date)
      .then((entry) => setCurrentEntry(entry))
      .finally(() => setLoading(false))
  }, [date])

  if (!date) return null

  const parsedDate = parseISO(date)
  const weekday = WEEKDAY_NAMES[getDay(parsedDate)]
  const isToday = date === format(new Date(), 'yyyy-MM-dd')
  const isSunday = getDay(parsedDate) === 0
  const dateInfo = getDateInfo(parsedDate)

  const handleWeekSummary = async () => {
    setGenerating(true)
    try {
      await api.generateWeekSummary(date)
      navigate(`/summary/week/${date}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleMonthSummary = async () => {
    const ym = format(parsedDate, 'yyyy-MM')
    setGenerating(true)
    try {
      await api.generateMonthSummary(ym)
      navigate(`/summary/month/${ym}`)
    } finally {
      setGenerating(false)
    }
  }

  const taskCount = currentEntry?.tasks.length ?? 0

  return (
    <div className="page-shell min-h-screen">
      <div className="relative mx-auto w-full max-w-4xl px-5 py-8 sm:px-7 lg:px-8 lg:py-9">
        <ThemeBackdropArt className="pointer-events-none absolute inset-x-0 top-2 h-[22rem]" />
        <div className="mb-7 flex items-start justify-between lg:mb-8">
          <button
            onClick={() => navigate('/')}
            className="btn-ghost text-sm flex items-center gap-1 -ml-1"
          >
            ← 日历
          </button>
          {(isSunday || isToday) && (
            <button
              onClick={handleWeekSummary}
              disabled={generating}
              className="btn-ghost text-sm text-primary"
            >
              {generating ? '生成中…' : '生成周报'}
            </button>
          )}
        </div>

        <div className="mb-7 lg:mb-8">
          <span className="soft-pill mb-3 text-[#7d7acf]">今日页面</span>
          <div className="flex items-baseline gap-3">
            <h1 className="font-display text-5xl font-light text-text-main lg:text-6xl">
              {format(parsedDate, 'd')}
            </h1>
            <div>
              <p className="text-lg font-medium text-text-main lg:text-xl">
                {format(parsedDate, 'M月', { locale: zhCN })}
                <span className="text-text-muted font-normal ml-1.5">
                  {format(parsedDate, 'yyyy')}
                </span>
              </p>
              <p className="text-sm text-text-muted lg:text-base">{weekday}</p>
              <p className="mt-1 text-sm text-text-muted">{dateInfo.lunarLabel}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {isToday && (
              <span className="inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary shadow-[0_8px_18px_rgba(168,152,233,0.18)]">
                今天
              </span>
            )}
            {dateInfo.festivals.map((festival) => (
              <span
                key={festival}
                className="inline-block rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-[#C46A5F] shadow-[0_8px_18px_rgba(244,197,188,0.18)]"
              >
                {festival}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-32 animate-pulse bg-border/50" />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="card relative overflow-hidden">
              <div className="absolute right-6 top-6 h-12 w-12 rounded-full bg-[#f7d7eb] opacity-55 blur-2xl" />
              <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-primary inline-block" />
                日记
              </h3>
              <DiaryEditor date={date} />
            </div>

            <div className="card relative overflow-hidden">
              <div className="absolute left-8 top-8 h-12 w-12 rounded-full bg-[#dceaff] opacity-55 blur-2xl" />
              <h3 className="text-sm font-semibold text-text-main mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-accent inline-block" />
                今日任务
              </h3>
              <TaskList date={date} />
            </div>

            <EncouragementCard date={date} taskCount={taskCount} />

            <div className="pt-2">
              <button
                onClick={handleMonthSummary}
                disabled={generating}
                className="w-full py-2.5 text-sm text-text-muted
                           rounded-card border border-white/70 bg-white/65
                           shadow-[0_12px_30px_rgba(219,206,238,0.14)]
                           hover:border-primary hover:text-primary
                           transition-colors duration-150"
              >
                {generating ? '生成中…' : '生成本月月报'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
