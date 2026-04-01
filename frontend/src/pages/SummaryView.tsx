import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SummaryCard } from '../components/SummaryCard'
import type { Summary } from '../api/client'
import * as api from '../api/client'

export function SummaryView() {
  const { type, period } = useParams<{ type: string; period: string }>()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  const summaryType = (type === 'week' || type === 'month') ? type : 'week'

  const fetchSummary = useCallback(async () => {
    if (!period) return
    setLoading(true)
    try {
      const data = summaryType === 'week'
        ? await api.getWeekSummary(period)
        : await api.getMonthSummary(period)
      setSummary(data)
    } finally {
      setLoading(false)
    }
  }, [summaryType, period])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  const handleRegenerate = async () => {
    if (!period) return
    setRegenerating(true)
    try {
      const data = summaryType === 'week'
        ? await api.generateWeekSummary(period)
        : await api.generateMonthSummary(period)
      setSummary(data)
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="btn-ghost text-sm flex items-center gap-1 -ml-1"
          >
            ← 返回
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="btn-ghost text-sm text-primary"
          >
            {regenerating ? '重新生成中…' : '重新生成'}
          </button>
        </div>

        {loading ? (
          <div className="card h-64 animate-pulse bg-border/50" />
        ) : summary ? (
          <SummaryCard summary={summary} type={summaryType} />
        ) : (
          <div className="card text-center py-16">
            <p className="text-text-muted text-sm mb-4">暂无总结内容</p>
            <button onClick={handleRegenerate} className="btn-primary text-sm">
              立即生成
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
