import { useEffect, useState, useCallback } from 'react'
import * as api from '../api/client'

type Props = {
  date: string
  taskCount: number
}

export function EncouragementCard({ date, taskCount }: Props) {
  const [message, setMessage] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchMessage = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getEncouragement(date)
      setMessage(data.message)
      setSource(data.source)
    } catch {
      setMessage('今天也在认真生活，这就够了。')
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => {
    fetchMessage()
  }, [date, taskCount, fetchMessage])

  if (loading) {
    return (
      <div
        className="rounded-card h-24 animate-pulse border p-5"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      />
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-card border p-6"
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary opacity-10 blur-2xl" />
      <div className="absolute -left-3 bottom-0 h-20 w-20 rounded-full bg-accent opacity-10 blur-2xl" />
      <div className="absolute right-14 top-6 h-10 w-10 rounded-full border border-white/50 bg-white/20" />

      <p className="relative z-10 text-base italic leading-relaxed text-text-main" style={{ color: 'rgb(var(--text-main))' }}>
        "{message}"
      </p>
      {source === 'llm' && (
        <span className="mt-3 inline-block rounded-full bg-white/55 px-2.5 py-1 text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
          ✦ AI 生成
        </span>
      )}
      <button
        onClick={fetchMessage}
        className="absolute right-4 top-4 rounded-full border border-white/50 bg-white/45 px-3 py-1.5 text-sm
                   transition-colors hover:text-primary"
        style={{ color: 'rgb(var(--text-muted))' }}
        title="换一句"
      >
        ↻
      </button>
    </div>
  )
}
