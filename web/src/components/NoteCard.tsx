import type { Note } from '../types'

interface NoteCardProps {
  note: Note
  domainName?: string
  domainColor?: string
  onClick: () => void
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN')
}

export default function NoteCard({ note, domainName, domainColor, onClick }: NoteCardProps) {
  // Extract first few lines as preview
  const preview = note.content
    .split('\n')
    .filter(l => l.trim())
    .slice(0, 2)
    .join(' | ')
    .slice(0, 120)

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        background: '#1E293B',
        borderRadius: '8px',
        border: '1px solid #334155',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#F1F5F9', marginBottom: '6px' }}>
            {note.title || '无标题笔记'}
          </div>
          {preview && (
            <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {preview}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '12px', color: '#475569' }}>{formatDate(note.updated_at)}</div>
        </div>
      </div>
      {(domainName || note.content.length > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          {domainName && (
            <span style={{ fontSize: '12px', color: domainColor ?? '#64748B' }}>{domainName}</span>
          )}
          {note.content.length > 0 && (
            <span style={{ fontSize: '11px', color: '#475569' }}>
              {note.content.length} 字
            </span>
          )}
        </div>
      )}
    </div>
  )
}
