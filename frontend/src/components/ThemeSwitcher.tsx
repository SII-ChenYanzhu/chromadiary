import { useState } from 'react'
import { THEME_OPTIONS, getRandomTheme, type ThemeId } from '../theme/themes'

type Props = {
  theme: ThemeId
  onChange: (theme: ThemeId) => void
}

export function ThemeSwitcher({ theme, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-[18rem] rounded-[1.6rem] border border-white/70 bg-white/82 p-3 shadow-[0_24px_60px_rgba(183,170,222,0.28)] backdrop-blur-xl">
          <div className="mb-3 flex items-start justify-between gap-3 px-2">
            <div>
              <p className="text-sm font-semibold text-text-main">切换主题</p>
              <p className="mt-1 text-xs text-text-muted">一键更换整套背景、卡片和按钮氛围。</p>
            </div>
            <button
              onClick={() => onChange(getRandomTheme(theme))}
              className="rounded-full border border-white/70 bg-white/72 px-3 py-1.5 text-xs font-medium text-text-main shadow-[0_10px_20px_rgba(199,186,228,0.18)] transition-all hover:bg-primary-light/70"
            >
              随机
            </button>
          </div>
          <div className="space-y-2">
            {THEME_OPTIONS.map((option) => {
              const active = option.id === theme
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id)
                    setOpen(false)
                  }}
                  className={[
                    'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-150',
                    active
                      ? 'border-primary/30 bg-primary-light/70 shadow-[0_14px_28px_rgba(190,176,234,0.2)]'
                      : 'border-white/65 bg-white/60 hover:bg-white/82',
                  ].join(' ')}
                >
                  <span
                    className="h-10 w-10 rounded-2xl border border-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                    style={{ background: option.preview }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text-main">{option.name}</span>
                    <span className="mt-1 block text-xs text-text-muted">{option.description}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/70 bg-white/82 px-4 py-3 text-sm font-medium text-text-main shadow-[0_18px_36px_rgba(189,177,225,0.24)] backdrop-blur-xl transition-all hover:translate-y-[-1px]"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-primary">
          ✦
        </span>
        主题
      </button>
    </div>
  )
}
