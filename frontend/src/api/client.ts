const BASE = '/api'

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

// === Types ===
export type Task = {
  id: number
  date: string
  title: string
  status: 'pending' | 'done'
  category: string
  sort_order: number
}

export type DayEntry = {
  date: string
  diary: string
  mood: string
  tasks: Task[]
}

export type Summary = {
  id: number
  type: string
  period_start: string
  period_end: string
  content: string
  generated_by: string
  created_at: string
}

export type Encouragement = {
  message: string
  source: string
}

export type Settings = {
  llm_provider: string
  api_key: string
  llm_model: string
}

export type MonthDates = {
  dates: string[]
  diary_dates: string[]
  task_dates: string[]
}

// === Entries ===
export const getEntry = (date: string) =>
  req<DayEntry>(`/entries/${date}`)

export const upsertDiary = (date: string, diary: string, mood = '') =>
  req<DayEntry>(`/entries/${date}`, {
    method: 'PUT',
    body: JSON.stringify({ diary, mood }),
  })

export const getMonthDates = (yearMonth: string) =>
  req<MonthDates>(`/entries/month/${yearMonth}`)

// === Tasks ===
export const createTask = (date: string, title: string) =>
  req<Task>(`/tasks`, {
    method: 'POST',
    body: JSON.stringify({ date, title, status: 'pending', sort_order: 0 }),
  })

export const updateTask = (id: number, patch: Partial<Task>) =>
  req<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })

export const deleteTask = (id: number) =>
  req<void>(`/tasks/${id}`, { method: 'DELETE' })

// === Summaries ===
export const generateWeekSummary = (date: string) =>
  req<Summary>(`/summaries/week`, {
    method: 'POST',
    body: JSON.stringify({ date }),
  })

export const generateMonthSummary = (yearMonth: string) =>
  req<Summary>(`/summaries/month`, {
    method: 'POST',
    body: JSON.stringify({ date: yearMonth }),
  })

export const getWeekSummary = (date: string) =>
  req<Summary | null>(`/summaries/week/${date}`)

export const getMonthSummary = (yearMonth: string) =>
  req<Summary | null>(`/summaries/month/${yearMonth}`)

// === Encouragement ===
export const getEncouragement = (date: string) =>
  req<Encouragement>(`/encouragement/${date}`)

// === Settings ===
export const getSettings = () => req<Settings>(`/settings`)
export const updateSettings = (s: Settings) =>
  req<Settings>(`/settings`, {
    method: 'PUT',
    body: JSON.stringify(s),
  })
