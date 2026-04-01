import { useState, useEffect } from 'react'
import { useJournalStore } from '../store/useJournalStore'
import * as api from '../api/client'

type Props = {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: Props) {
  const { settings, setSettings } = useJournalStore()
  const [form, setForm] = useState({ llm_provider: 'none', api_key: '', llm_model: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) setForm({ ...settings })
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await api.updateSettings(form)
      setSettings(updated)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-card rounded-card shadow-card-hover p-8 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-text-main mb-1">LLM 设置</h2>
        <p className="text-xs text-text-muted mb-6">配置 AI 模型以获得更个性化的鼓励语和总结</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-muted font-medium mb-1.5 block">模型提供商</label>
            <select
              value={form.llm_provider}
              onChange={(e) => setForm({ ...form, llm_provider: e.target.value })}
              className="w-full bg-bg border border-border rounded-btn px-3 py-2
                         text-sm text-text-main focus:outline-none focus:ring-2
                         focus:ring-primary/30"
            >
              <option value="none">不使用 LLM（规则生成）</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
            </select>
          </div>

          {form.llm_provider !== 'none' && (
            <>
              <div>
                <label className="text-sm text-text-muted font-medium mb-1.5 block">API Key</label>
                <input
                  type="password"
                  value={form.api_key}
                  onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                  placeholder={form.llm_provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                  className="w-full bg-bg border border-border rounded-btn px-3 py-2
                             text-sm text-text-main placeholder-text-muted
                             focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm text-text-muted font-medium mb-1.5 block">
                  模型名称（留空使用默认）
                </label>
                <input
                  type="text"
                  value={form.llm_model}
                  onChange={(e) => setForm({ ...form, llm_model: e.target.value })}
                  placeholder={
                    form.llm_provider === 'anthropic'
                      ? 'claude-haiku-4-5-20251001'
                      : 'gpt-4o-mini'
                  }
                  className="w-full bg-bg border border-border rounded-btn px-3 py-2
                             text-sm text-text-main placeholder-text-muted
                             focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-8 justify-end">
          <button onClick={onClose} className="btn-ghost text-sm">取消</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
