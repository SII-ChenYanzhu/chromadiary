import ReactMarkdown from 'react-markdown'
import type { Summary } from '../api/client'

type Props = {
  summary: Summary
  type: 'week' | 'month'
}

export function SummaryCard({ summary, type }: Props) {
  const label = type === 'week' ? '本周回顾' : '本月回顾'
  const icon = type === 'week' ? '📋' : '🗓'

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="text-lg font-semibold text-text-main">{label}</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {summary.period_start} — {summary.period_end}
            {summary.generated_by === 'llm' && (
              <span className="ml-2 text-primary">✦ AI 生成</span>
            )}
          </p>
        </div>
      </div>

      <div className="prose prose-sm max-w-none
                      [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-main [&_h2]:mt-0 [&_h2]:mb-4
                      [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-text-muted [&_h3]:mt-4 [&_h3]:mb-2
                      [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-text-main
                      [&_li]:text-sm [&_li]:text-text-main
                      [&_ul]:my-2 [&_ul]:pl-4
                      [&_hr]:border-border [&_hr]:my-4
                      [&_em]:text-text-muted [&_em]:not-italic [&_em]:text-sm
                      [&_strong]:text-text-main">
        <ReactMarkdown>{summary.content}</ReactMarkdown>
      </div>

      <p className="text-xs text-text-muted mt-6 text-right">
        生成于 {new Date(summary.created_at).toLocaleString('zh-CN')}
      </p>
    </div>
  )
}
