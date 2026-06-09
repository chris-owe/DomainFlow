interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => Promise<boolean>
}

export default function ConfirmDialog({ title, message, confirmLabel = '删除', onClose, onConfirm }: ConfirmDialogProps) {
  const handleConfirm = async () => {
    const ok = await onConfirm()
    if (ok) onClose()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{title}</h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={btnSecondaryStyle}>
            取消
          </button>
          <button type="button" onClick={handleConfirm} style={btnDangerStyle}>
            {confirmLabel}
          </button>
        </div>
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
  width: '380px', maxWidth: '90vw', color: '#F1F5F9',
}

const btnSecondaryStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155',
  background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '14px',
}

const btnDangerStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: 'none',
  background: '#EF4444', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
}
