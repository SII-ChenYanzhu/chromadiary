import { useEffect, useRef, useState } from 'react'
import { useJournalStore } from '../store/useJournalStore'
import * as api from '../api/client'

type Props = {
  date: string
}

export function DiaryEditor({ date }: Props) {
  const { currentEntry, updateDiary } = useJournalStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const diary = currentEntry?.diary ?? ''

  const handleChange = (value: string) => {
    updateDiary(value)
    setSaved(false)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        await api.upsertDiary(date, value, currentEntry?.mood ?? '')
        setSaved(true)
      } finally {
        setSaving(false)
      }
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div>
      <textarea
        className="diary-textarea rounded-[1.35rem] border border-white/80 bg-white/52 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
        value={diary}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="今天发生了什么，有什么感受，或者只是随便写写…"
      />
      <div className="flex justify-end mt-2 h-4">
        {saving && <span className="text-xs text-text-muted">正在保存…</span>}
        {!saving && saved && (
          <span className="text-xs text-done-text">已自动保存 ✓</span>
        )}
      </div>
    </div>
  )
}
