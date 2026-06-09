import { useState } from 'react'
import type { Task, TaskPriority, Domain } from '../types'
import type { TaskInput } from '../hooks/useTasks'

const PRIORITIES: { label: string; value: TaskPriority; color: string }[] = [
  { label: 'P0 紧急', value: 'P0', color: '#EF4444' },
  { label: 'P1 重要', value: 'P1', color: '#F59E0B' },
  { label: 'P2 一般', value: 'P2', color: '#64748B' },
  { label: 'P3 低优', value: 'P3', color: '#475569' },
]

const WEEKDAYS = [
  { label: '日', value: 0 },
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
]

interface TaskDialogProps {
  mode: 'create' | 'edit'
  domains: Domain[]
  task?: Task
  onClose: () => void
  onConfirm: (data: TaskInput) => Promise<boolean>
  onDelete?: () => void
}

export default function TaskDialog({ mode, domains, task, onClose, onConfirm, onDelete }: TaskDialogProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [domainId, setDomainId] = useState(task?.domain_id ?? (domains[0]?.id ?? ''))
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'P2')
  const [dueDate, setDueDate] = useState(task?.due_date ?? '')
  const [isRecurring, setIsRecurring] = useState(task?.is_recurring ?? false)
  const [recurringDays, setRecurringDays] = useState<number[]>(task?.recurring_days ?? [])
  const [description, setDescription] = useState(task?.description ?? '')
  const [submitting, setSubmitting] = useState(false)

  const toggleDay = (day: number) => {
    setRecurringDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !domainId) return
    setSubmitting(true)
    const ok = await onConfirm({
      domain_id: domainId,
      title: title.trim(),
      description,
      priority,
      due_date: dueDate || null,
      is_recurring: isRecurring,
      recurring_days: isRecurring ? recurringDays : null,
    })
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
          {mode === 'create' ? '新建任务' : '编辑任务'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* 标题 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>任务标题 *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="输入任务标题"
              autoFocus
              style={inputStyle}
            />
          </div>

          {/* 领域 + 优先级 */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>所属领域</label>
              <select value={domainId} onChange={e => setDomainId(e.target.value)} style={selectStyle}>
                {domains.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>优先级</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} style={selectStyle}>
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 截止日期 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>截止日期（选填）</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* 重复任务 */}
          <div style={{ marginBottom: '16px', padding: '12px', background: '#0F172A', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: isRecurring ? '12px' : '0' }}>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '14px', color: '#F1F5F9' }}>重复任务</span>
            </label>

            {isRecurring && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {WEEKDAYS.map(w => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => toggleDay(w.value)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                      background: recurringDays.includes(w.value) ? '#06B6D4' : '#334155',
                      color: recurringDays.includes(w.value) ? '#fff' : '#94A3B8',
                      fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 描述 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>描述（选填）</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="添加备注或描述"
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* 按钮 */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: mode === 'edit' ? 'space-between' : 'flex-end' }}>
            {mode === 'edit' && (
              <button type="button" onClick={onDelete} style={btnDangerStyle}>
                删除
              </button>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} style={btnSecondaryStyle}>取消</button>
              <button type="submit" disabled={!title.trim() || !domainId || submitting} style={btnPrimaryStyle}>
                {submitting ? '保存中...' : mode === 'create' ? '创建' : '保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
}

const dialogStyle: React.CSSProperties = {
  background: '#1E293B', borderRadius: '12px', padding: '24px',
  width: '480px', maxWidth: '90vw', color: '#F1F5F9', maxHeight: '85vh', overflow: 'auto',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155',
  background: '#0F172A', color: '#F1F5F9', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, cursor: 'pointer',
}

const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155',
  background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '14px',
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: 'none',
  background: '#06B6D4', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
}

const btnDangerStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: 'none',
  background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
}
