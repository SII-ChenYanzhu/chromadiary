export type ThemeId =
  | 'dreamy'
  | 'garden'
  | 'berry'
  | 'ocean'
  | 'cosmos'
  | 'starlit'
  | 'nebula'

export type ThemeOption = {
  id: ThemeId
  name: string
  description: string
  preview: string
}

export const THEME_STORAGE_KEY = 'journal-theme'

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dreamy',
    name: '梦幻渐变',
    description: '粉蓝奶油金，像漂浮的糖霜云团。',
    preview: 'linear-gradient(135deg, #ffc4e2 0%, #bde2ff 55%, #ffe4a8 100%)',
  },
  {
    id: 'garden',
    name: '晨雾花园',
    description: '薄荷绿、奶白和花瓣粉，清新柔软。',
    preview: 'linear-gradient(135deg, #c7f0df 0%, #fdf7ef 52%, #ffd8df 100%)',
  },
  {
    id: 'berry',
    name: '莓果暮光',
    description: '莓果紫、蜜桃粉和一点暮色蓝。',
    preview: 'linear-gradient(135deg, #d8c3ff 0%, #ffcad8 52%, #b8d4ff 100%)',
  },
  {
    id: 'ocean',
    name: '海盐星云',
    description: '海盐蓝、月光白和珊瑚橘的轻盈组合。',
    preview: 'linear-gradient(135deg, #c8ecff 0%, #f9fcff 55%, #ffd8c4 100%)',
  },
  {
    id: 'cosmos',
    name: '宇宙深空',
    description: '深夜蓝、极光紫和冷银光，偏酷一点。',
    preview: 'linear-gradient(135deg, #0f1636 0%, #5c48d8 52%, #8de6ff 100%)',
  },
  {
    id: 'starlit',
    name: '星烬霓虹',
    description: '电光蓝、荧光玫红和一点赛博夜色。',
    preview: 'linear-gradient(135deg, #121a3f 0%, #00c6ff 42%, #ff4fb8 100%)',
  },
  {
    id: 'nebula',
    name: '星云幻境',
    description: '紫红星尘、银河蓝和微微金色流光。',
    preview: 'linear-gradient(135deg, #26104c 0%, #7d41ff 45%, #ff7fb1 78%, #ffd978 100%)',
  },
]

export function getRandomTheme(current?: ThemeId): ThemeId {
  const candidates = THEME_OPTIONS.map((option) => option.id).filter((id) => id !== current)
  const pool = candidates.length > 0 ? candidates : THEME_OPTIONS.map((option) => option.id)
  return pool[Math.floor(Math.random() * pool.length)]
}
