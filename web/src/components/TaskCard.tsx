import type { Task } from '../types'

const PRIORITY_COLORS: Record<string, string> = {
  P0: '#EF4444',
  P1: '#F59E0B',
  P2: '#64748B',
  P3: '#475569',
}

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

interface TaskCardProps {
  task: Task
  domainName?: string
  domainColor?: string
  onToggle: () => void
  onClick: () => void
}

export default function TaskCard({ task, domainName, domainColor, onToggle, onClick }: TaskCardProps) {
  const isDone = task.status === 'done'
  const isOverdue = !isDone && task.due_date && new Date(task.due_date) < new Date(new Date().toDateString())

  const dueLabel = (() => {
    if (!task.due_date) return null
    const due = new Date(task.due_date)
    const today = new Date(new Date().toDateString())
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diff < 0) return `已逾期 ${Math.abs(diff)} 天`
    if (diff === 0) return '今天截止'
    if (diff === 1) return '明天截止'
    return `剩余 ${diff} 天`
  })()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        background: '#1E293B',
        borderRadius: '8px',
        border: '1px solid #334155',
        opacity: isDone ? 0.6 : 1,
        transition: 'opacity 0.15s',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); onToggle() }}
        style={{
          width: '20px',
          height: '20px',
          minWidth: '20px',
          borderRadius: '50%',
          border: `2px solid ${isDone ? '#10B981' : '#475569'}`,
          background: isDone ? '#10B981' : 'transparent',
          cursor: 'pointer',
          marginTop: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '12px',
        }}
      >
        {isDone ? '✓' : ''}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Title */}
          <span style={{
            fontSize: '15px',
            color: isDone ? '#64748B' : '#F1F5F9',
            textDecoration: isDone ? 'line-through' : 'none',
            fontWeight: 500,
          }}>
            {task.title}
          </span>

          {/* Priority badge */}
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '4px',
            background: PRIORITY_COLORS[task.priority] + '20',
            color: PRIORITY_COLORS[task.priority],
          }}>
            {task.priority}
          </span>

          {/* Recurring badge */}
          {task.is_recurring && task.recurring_days && (
            <span style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: '#06B6D420',
              color: '#06B6D4',
            }}>
              ↻ {task.recurring_days.map(d => WEEKDAY_LABELS[d]).join('')}
            </span>
          )}
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '12px' }}>
          {dueLabel && (
            <span style={{ color: isOverdue ? '#EF4444' : '#64748B' }}>
              {isOverdue ? '⚠ ' : ''}{dueLabel}
            </span>
          )}
          {domainName && (
            <span style={{ color: domainColor ?? '#64748B' }}>
              {domainName}
            </span>
          )}
          {task.description && (
            <span style={{ color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
              {task.description}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
