import { useState } from 'react'
import type { Domain } from '../types'

interface ProcessDialogProps {
  item: { id: string; content: string; item_type: string }
  domains: Domain[]
  onClose: () => void
  onConfirm: (domainId: string) => Promise<boolean>
}

export default function ProcessDialog({ item, domains, onClose, onConfirm }: ProcessDialogProps) {
  const [domainId, setDomainId] = useState(domains[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainId) return
    setSubmitting(true)
    const ok = await onConfirm(domainId)
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>归类到领域</h2>

        <div style={{ padding: '10px 12px', background: '#0F172A', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', color: '#94A3B8' }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
            {item.item_type === 'note' ? '📝 笔记' : '✅ 任务'}
          </div>
          {item.content}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>归入领域</label>
            <select value={domainId} onChange={e => setDomainId(e.target.value)} style={selectStyle}>
              {domains.map(d => (
                <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={btnSecondaryStyle}>取消</button>
            <button type="submit" disabled={!domainId || submitting} style={btnPrimaryStyle}>
              {submitting ? '处理中...' : '确认归类'}
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
  width: '420px', maxWidth: '90vw', color: '#F1F5F9',
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155',
  background: '#0F172A', color: '#F1F5F9', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', cursor: 'pointer',
}

const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155',
  background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '14px',
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: 'none',
  background: '#06B6D4', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
}
