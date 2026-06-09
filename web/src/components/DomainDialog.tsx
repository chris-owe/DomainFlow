import { useState } from 'react'
import type { Domain } from '../types'

const COLORS = [
  { label: '天蓝', value: '#0EA5E9' },
  { label: '青色', value: '#06B6D4' },
  { label: '紫色', value: '#8B5CF6' },
  { label: '绿色', value: '#10B981' },
  { label: '橙色', value: '#F59E0B' },
  { label: '红色', value: '#EF4444' },
  { label: '粉色', value: '#EC4899' },
  { label: '灰色', value: '#64748B' },
]

interface DomainDialogProps {
  mode: 'create' | 'edit'
  domain?: Domain
  onClose: () => void
  onConfirm: (data: { name: string; description: string; color: string; icon: string }) => Promise<boolean>
}

export default function DomainDialog({ mode, domain, onClose, onConfirm }: DomainDialogProps) {
  const [name, setName] = useState(domain?.name ?? '')
  const [description, setDescription] = useState(domain?.description ?? '')
  const [color, setColor] = useState(domain?.color ?? '#0EA5E9')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    const ok = await onConfirm({ name: name.trim(), description, color, icon: '📁' })
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
          {mode === 'create' ? '新增领域' : '编辑领域'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>名称 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="领域名称"
              autoFocus
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="这个领域用来做什么"
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>颜色</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: c.value,
                    border: color === c.value ? '3px solid #F1F5F9' : '3px solid transparent',
                    cursor: 'pointer',
                    outline: color === c.value ? '2px solid ' + c.value : 'none',
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={btnSecondaryStyle}>
              取消
            </button>
            <button type="submit" disabled={!name.trim() || submitting} style={btnPrimaryStyle}>
              {submitting ? '保存中...' : mode === 'create' ? '创建' : '保存'}
            </button>
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
  width: '400px', maxWidth: '90vw', color: '#F1F5F9',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155',
  background: '#0F172A', color: '#F1F5F9', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box',
}

const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155',
  background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '14px',
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: 'none',
  background: '#06B6D4', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
}
