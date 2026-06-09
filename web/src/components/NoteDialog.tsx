import { useState } from 'react'
import type { Note, Domain } from '../types'
import type { NoteInput } from '../hooks/useNotes'

interface NoteDialogProps {
  mode: 'create' | 'edit'
  domains: Domain[]
  note?: Note
  onClose: () => void
  onConfirm: (data: NoteInput) => Promise<boolean>
  onDelete?: () => void
}

export default function NoteDialog({ mode, domains, note, onClose, onConfirm, onDelete }: NoteDialogProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [domainId, setDomainId] = useState(note?.domain_id ?? (domains[0]?.id ?? ''))
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !domainId) return
    setSubmitting(true)
    const ok = await onConfirm({ domain_id: domainId, title: title.trim(), content })
    setSubmitting(false)
    if (ok) onClose()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
          {mode === 'create' ? '新建笔记' : '编辑笔记'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="笔记标题"
              autoFocus
              style={{ ...inputStyle, fontSize: '16px', fontWeight: 600 }}
            />
          </div>

          {/* Domain */}
          {mode === 'create' && (
            <div style={{ marginBottom: '12px' }}>
              <select value={domainId} onChange={e => setDomainId(e.target.value)} style={selectStyle}>
                {domains.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Markdown editor */}
          <div style={{ marginBottom: '12px', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', background: '#0F172A', borderBottom: '1px solid #334155' }}>
              <button type="button" onClick={() => setPreview(false)} style={tabBtnStyle(!preview)}>编辑</button>
              <button type="button" onClick={() => setPreview(true)} style={tabBtnStyle(preview)}>预览</button>
            </div>
            {preview ? (
              <div style={{ padding: '12px', minHeight: '200px', fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#F1F5F9' }}>
                {content || '暂无内容'}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="支持 Markdown 格式&#10;&#10;输入文字，开始记录..."
                rows={12}
                style={{
                  ...inputStyle, border: 'none', borderRadius: 0, resize: 'vertical',
                  fontFamily: 'ui-monospace, monospace', fontSize: '14px', lineHeight: 1.6,
                }}
              />
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: mode === 'edit' ? 'space-between' : 'flex-end' }}>
            {mode === 'edit' && onDelete && (
              <button type="button" onClick={onDelete} style={btnDangerStyle}>删除</button>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={onClose} style={btnSecondaryStyle}>取消</button>
              <button type="submit" disabled={!title.trim() || submitting} style={btnPrimaryStyle}>
                {submitting ? '保存中...' : mode === 'create' ? '创建' : '保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function tabBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '4px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: 500,
    background: active ? '#334155' : 'transparent',
    color: active ? '#F1F5F9' : '#64748B',
  }
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
}

const dialogStyle: React.CSSProperties = {
  background: '#1E293B', borderRadius: '12px', padding: '24px',
  width: '560px', maxWidth: '90vw', color: '#F1F5F9', maxHeight: '85vh', overflow: 'auto',
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
