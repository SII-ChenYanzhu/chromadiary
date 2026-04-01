import { create } from 'zustand'
import type { DayEntry, Task, Settings } from '../api/client'

type JournalState = {
  currentEntry: DayEntry | null
  setCurrentEntry: (entry: DayEntry | null) => void
  updateTask: (taskId: number, patch: Partial<Task>) => void
  addTask: (task: Task) => void
  removeTask: (taskId: number) => void
  updateDiary: (diary: string) => void

  markedDates: Set<string>
  diaryDates: Set<string>
  setMarkedDates: (dates: string[]) => void
  setDiaryDates: (dates: string[]) => void

  settings: Settings | null
  setSettings: (s: Settings) => void
}

export const useJournalStore = create<JournalState>((set) => ({
  currentEntry: null,
  setCurrentEntry: (entry) => set({ currentEntry: entry }),

  updateTask: (taskId, patch) =>
    set((state) => {
      if (!state.currentEntry) return state
      return {
        currentEntry: {
          ...state.currentEntry,
          tasks: state.currentEntry.tasks.map((t) =>
            t.id === taskId ? { ...t, ...patch } : t
          ),
        },
      }
    }),

  addTask: (task) =>
    set((state) => {
      if (!state.currentEntry) return state
      return {
        currentEntry: {
          ...state.currentEntry,
          tasks: [...state.currentEntry.tasks, task],
        },
      }
    }),

  removeTask: (taskId) =>
    set((state) => {
      if (!state.currentEntry) return state
      return {
        currentEntry: {
          ...state.currentEntry,
          tasks: state.currentEntry.tasks.filter((t) => t.id !== taskId),
        },
      }
    }),

  updateDiary: (diary) =>
    set((state) => {
      if (!state.currentEntry) return state
      return { currentEntry: { ...state.currentEntry, diary } }
    }),

  markedDates: new Set(),
  diaryDates: new Set(),
  setMarkedDates: (dates) => set({ markedDates: new Set(dates) }),
  setDiaryDates: (dates) => set({ diaryDates: new Set(dates) }),

  settings: null,
  setSettings: (s) => set({ settings: s }),
}))
