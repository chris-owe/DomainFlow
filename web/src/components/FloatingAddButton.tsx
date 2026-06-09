import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FloatingAddButton() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const handleQuickCapture = (type: 'task' | 'note') => {
    setExpanded(false)
    navigate('/inbox?quick=' + type)
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <MiniButton icon="📝" label="记笔记" onClick={() => handleQuickCapture('note')} />
          <MiniButton icon="✅" label="记待办" onClick={() => handleQuickCapture('task')} />
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '48px', height: '48px', borderRadius: '50%', border: 'none',
          background: '#06B6D4', color: '#fff', cursor: 'pointer', fontSize: '24px',
          boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        +
      </button>
    </div>
  )
}

function MiniButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 14px', borderRadius: '8px', border: 'none',
      background: '#1E293B', color: '#F1F5F9', cursor: 'pointer', fontSize: '13px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap',
    }}>
      <span>{icon}</span> {label}
    </button>
  )
}
