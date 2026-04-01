import { useState, KeyboardEvent } from 'react'
import { useJournalStore } from '../store/useJournalStore'
import * as api from '../api/client'

type Props = {
  date: string
}

export function TaskList({ date }: Props) {
  const { currentEntry, addTask, updateTask, removeTask } = useJournalStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const tasks = currentEntry?.tasks ?? []
  const pending = tasks.filter((t) => t.status === 'pending')
  const done = tasks.filter((t) => t.status === 'done')

  const handleAdd = async () => {
    const title = input.trim()
    if (!title) return
    setLoading(true)
    try {
      const task = await api.createTask(date, title)
      addTask(task)
      setInput('')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  const toggleStatus = async (task: api.Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    updateTask(task.id, { status: newStatus })
    await api.updateTask(task.id, { status: newStatus })
  }

  const handleDelete = async (id: number) => {
    removeTask(id)
    await api.deleteTask(id)
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="添加任务，按 Enter 确认…"
          className="flex-1 rounded-2xl border border-white/80 bg-white/72 px-4 py-3
                     text-sm text-text-main placeholder-text-muted
                     shadow-[0_10px_24px_rgba(223,214,236,0.12)]
                     focus:outline-none focus:ring-2 focus:ring-primary/30
                     transition-all"
          disabled={loading}
        />
        <button
          onClick={handleAdd}
          disabled={loading || !input.trim()}
          className="btn-primary px-4 text-sm disabled:opacity-40"
        >
          添加
        </button>
      </div>

      {pending.length > 0 && (
        <div className="mb-3">
          {pending.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleStatus} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-text-muted">已完成 ({done.length})</p>
          {done.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleStatus} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-text-muted text-sm text-center py-6">
          今天还没有任务，来添加一个吧
        </p>
      )}
    </div>
  )
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: api.Task
  onToggle: (t: api.Task) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="task-item group">
      <button
        onClick={() => onToggle(task)}
        className={[
          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
          'transition-all duration-200',
          task.status === 'done'
            ? 'bg-primary border-primary text-white'
            : 'border-border hover:border-primary',
        ].join(' ')}
      >
        {task.status === 'done' && (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm ${task.status === 'done' ? 'task-done' : 'text-text-main'}`}>
        {task.title}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400
                   transition-opacity duration-150 text-xs px-1"
      >
        ✕
      </button>
    </div>
  )
}
