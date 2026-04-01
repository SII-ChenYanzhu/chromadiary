import { useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isToday, addMonths, subMonths
} from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { getStatutoryHoliday } from '../utils/dateInfo'

type Props = {
  currentMonth: Date
  markedDates: Set<string>
  diaryDates: Set<string>
  onMonthChange: (d: Date) => void
  onDayClick: (date: string) => void
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export function Calendar({
  currentMonth,
  markedDates,
  diaryDates,
  onMonthChange,
  onDayClick,
}: Props) {
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const allDays = eachDayOfInterval({ start, end })
    const startWeekday = (getDay(start) + 6) % 7
    const blanks = Array(startWeekday).fill(null)
    return [...blanks, ...allDays]
  }, [currentMonth])

  return (
    <div className="w-full">
      <div className="mb-7 flex items-center justify-between lg:mb-8">
        <button
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="btn-ghost flex h-10 w-10 items-center justify-center text-xl lg:h-11 lg:w-11"
        >
          ‹
        </button>
        <h2 className="text-xl font-semibold tracking-wide text-text-main lg:text-3xl">
          {format(currentMonth, 'yyyy年 M月', { locale: zhCN })}
        </h2>
        <button
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="btn-ghost flex h-10 w-10 items-center justify-center text-xl lg:h-11 lg:w-11"
        >
          ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 lg:mb-3">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1.5 text-center text-xs font-medium text-text-muted lg:text-lg">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-1 gap-y-1.5 lg:gap-x-1.5 lg:gap-y-2">
        {days.map((day, idx) => {
          if (!day) return <div key={`blank-${idx}`} />

          const dateStr = format(day, 'yyyy-MM-dd')
          const hasData = markedDates.has(dateStr)
          const hasDiary = diaryDates.has(dateStr)
          const today = isToday(day)
          const holiday = getStatutoryHoliday(day)
          const dayOfWeek = getDay(day)
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(dateStr)}
              className={[
                'relative flex aspect-[1/0.9] w-full flex-col items-center justify-center rounded-[1.4rem] transition-all duration-150',
                'min-h-[4.2rem] lg:min-h-[5.4rem]',
                today
                  ? 'bg-primary text-white font-semibold shadow-md'
                  : hasDiary
                    ? 'bg-primary-light text-primary hover:bg-primary hover:text-white font-medium'
                    : isWeekend
                      ? 'text-[#D48D98] hover:bg-[#FFF1F3] hover:text-[#C86F7C] font-light'
                    : 'hover:bg-primary-light hover:text-primary text-text-main font-light',
              ].join(' ')}
            >
              {holiday && (
                <span className="holiday-badge absolute top-2 z-10 max-w-[70%] truncate lg:top-2.5">
                  {holiday}
                </span>
              )}
              <span className={['leading-none', holiday ? 'mt-2 text-sm lg:text-2xl' : 'text-sm lg:text-2xl'].join(' ')}>
                {format(day, 'd')}
              </span>
              {hasData && !today && (
                <span
                  className={[
                    'absolute bottom-1.5 h-1.5 w-1.5 rounded-full lg:bottom-2.5',
                    hasDiary ? 'bg-primary opacity-90' : 'bg-primary opacity-60',
                  ].join(' ')}
                />
              )}
              {hasData && today && (
                <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-white opacity-80 lg:bottom-2.5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
