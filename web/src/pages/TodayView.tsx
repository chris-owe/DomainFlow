import { useState } from 'react'
import { useDomains } from '../hooks/useDomains'
import { useTasks } from '../hooks/useTasks'
import TaskList from '../components/TaskList'
import TaskDialog from '../components/TaskDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Task } from '../types'
import type { TaskInput } from '../hooks/useTasks'

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

function isToday(dateStr: string) {
  return dateStr === getTodayStr()
}

export default function TodayView() {
  const { domains } = useDomains()
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTask } = useTasks()
  const [showCreate, setShowCreate] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const domainNames: Record<string, string> = {}
  const domainColors: Record<string, string> = {}
  domains.forEach(d => {
    domainNames[d.id] = d.name
    domainColors[d.id] = d.color
  })

  // Filter logic:
  // 1. Tasks with due_date = today (any priority)
  // 2. Tasks with no due_date but priority P0 or P1
  // 3. Exclude completed tasks
  const todayTasks = tasks.filter(t => {
    if (t.status === 'done') return false
    if (t.due_date && isToday(t.due_date)) return true
    if (!t.due_date && (t.priority === 'P0' || t.priority === 'P1')) return true
    return false
  })

  // Sort: P0 first, then P1, then today's P2+ tasks
  const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 }
  todayTasks.sort((a, b) => {
    // Due today + higher priority first
    const aIsDueToday = a.due_date ? isToday(a.due_date) : false
    const bIsDueToday = b.due_date ? isToday(b.due_date) : false
    if (aIsDueToday && !bIsDueToday) return -1
    if (!aIsDueToday && bIsDueToday) return 1
    return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
  })

  // Group by domain for display
  const grouped = todayTasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (!acc[t.domain_id]) acc[t.domain_id] = []
    acc[t.domain_id].push(t)
    return acc
  }, {})

  const todayCount = todayTasks.length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>✅ 今日待办</h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {todayCount > 0 && `  · ${todayCount} 项`}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} style={createBtnStyle}>
          ＋ 新建任务
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#64748B', padding: '40px 0', textAlign: 'center' }}>加载中...</div>
      ) : todayTasks.length === 0 ? (
        <div style={{
          color: '#64748B', padding: '40px 0', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '40px' }}>🌊</span>
          <span>今天没有待办事项，享受平静的一天</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(grouped).map(([domainId, domainTasks]) => {
            const domain = domains.find(d => d.id === domainId)
            const overdueTasks = domainTasks.filter(t => t.due_date && new Date(t.due_date) < new Date(new Date().toDateString()))
            const normalTasks = domainTasks.filter(t => !overdueTasks.includes(t))

            return (
              <div key={domainId}>
                {/* Domain header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 12px', marginBottom: '8px',
                  background: '#1E293B', borderRadius: '8px',
                  borderLeft: `3px solid ${domain?.color ?? '#64748B'}`,
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: domain?.color ?? '#64748B' }}>
                    {domain?.icon} {domain?.name ?? '未知领域'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    {domainTasks.length} 项
                  </span>
                </div>

                {/* Overdue tasks first */}
                {overdueTasks.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#EF4444', marginBottom: '6px', paddingLeft: '4px' }}>
                      ⚠ 已逾期
                    </div>
                    <TaskList
                      tasks={overdueTasks}
                      domainNames={domainNames}
                      domainColors={domainColors}
                      onToggle={toggleTask}
                      onEdit={setEditingTask}
                    />
                  </div>
                )}

                {/* Normal tasks */}
                {normalTasks.length > 0 && (
                  <TaskList
                    tasks={normalTasks}
                    domainNames={domainNames}
                    domainColors={domainColors}
                    onToggle={toggleTask}
                    onEdit={setEditingTask}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <TaskDialog
          mode="create"
          domains={domains}
          onClose={() => setShowCreate(false)}
          onConfirm={async (data: TaskInput) => {
            const ok = await createTask(data)
            if (ok) setShowCreate(false)
            return ok
          }}
        />
      )}

      {editingTask && (
        <TaskDialog
          mode="edit"
          domains={domains}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onConfirm={async (data: TaskInput) => {
            const ok = await updateTask(editingTask.id, data)
            if (ok) setEditingTask(null)
            return ok
          }}
          onDelete={() => setDeletingTask(editingTask)}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="删除任务"
          message={`确定要删除「${deletingTask.title}」吗？此操作不可撤销。`}
          confirmLabel="删除"
          onClose={() => setDeletingTask(null)}
          onConfirm={async () => {
            const ok = await deleteTask(deletingTask.id)
            if (ok) setDeletingTask(null)
            return ok
          }}
        />
      )}
    </div>
  )
}

const createBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: '6px',
  border: 'none',
  background: '#06B6D4',
  color: '#fff',
  fontSize: '13px',
  cursor: 'pointer',
  fontWeight: 500,
}
