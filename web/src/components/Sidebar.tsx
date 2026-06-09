import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useDomains } from '../hooks/useDomains'
import DomainDialog from './DomainDialog'
import ConfirmDialog from './ConfirmDialog'
import type { Domain } from '../types'

export default function Sidebar() {
  const { domains, loading, createDomain, updateDomain, deleteDomain } = useDomains()
  const [showCreate, setShowCreate] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null)

  if (loading) {
    return (
      <aside style={sidebarStyle}>
        <div style={{ padding: '0 16px 20px', fontSize: '20px', fontWeight: 700, color: '#06B6D4' }}>域流</div>
        <div style={{ padding: '16px', color: '#64748B', fontSize: '14px' }}>加载中...</div>
      </aside>
    )
  }

  return (
    <>
      <aside style={sidebarStyle}>
        {/* Logo */}
        <div style={{ padding: '0 16px 20px', fontSize: '20px', fontWeight: 700, color: '#06B6D4' }}>
          域流
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <NavItem to="/" label="✅ 今日待办" />
          <NavItem to="/all" label="📥 所有内容" />

          <div style={{ height: '8px' }} />

          <div style={{ padding: '0 16px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            领域
          </div>

          {domains.map(d => (
            <DomainNavItem
              key={d.id}
              domain={d}
              onEdit={() => setEditingDomain(d)}
              onDelete={() => setDeletingDomain(d)}
            />
          ))}

          <div style={{ padding: '0 16px', marginTop: '4px' }}>
            <button onClick={() => setShowCreate(true)} style={addBtnStyle}>
              ＋ 添加领域
            </button>
          </div>

          <div style={{ height: '8px' }} />

          <NavItem to="/inbox" label="📥 收集箱" />
        </nav>
      </aside>

      {showCreate && (
        <DomainDialog
          mode="create"
          onClose={() => setShowCreate(false)}
          onConfirm={async (data) => {
            const ok = await createDomain(data)
            if (ok) setShowCreate(false)
            return ok
          }}
        />
      )}

      {editingDomain && (
        <DomainDialog
          mode="edit"
          domain={editingDomain}
          onClose={() => setEditingDomain(null)}
          onConfirm={async (data) => {
            const ok = await updateDomain(editingDomain.id, data)
            if (ok) setEditingDomain(null)
            return ok
          }}
        />
      )}

      {deletingDomain && (
        <ConfirmDialog
          title="删除领域"
          message={`确定要删除「${deletingDomain.name}」吗？该领域下的所有任务和笔记将一并删除，此操作不可撤销。`}
          confirmLabel="删除"
          onClose={() => setDeletingDomain(null)}
          onConfirm={async () => {
            const ok = await deleteDomain(deletingDomain.id)
            if (ok) setDeletingDomain(null)
            return ok
          }}
        />
      )}
    </>
  )
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'block',
        padding: '8px 16px',
        fontSize: '14px',
        color: isActive ? '#F1F5F9' : '#64748B',
        background: isActive ? '#334155' : 'transparent',
        borderRadius: '6px',
        margin: '0 8px',
        textDecoration: 'none',
        transition: 'background 0.15s',
      })}
    >
      {label}
    </NavLink>
  )
}

function DomainNavItem({ domain, onEdit, onDelete }: { domain: Domain; onEdit: () => void; onDelete: () => void }) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      style={{ position: 'relative', margin: '0 8px' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <NavLink
        to={`/domain/${domain.id}`}
        style={({ isActive }) => ({
          display: 'block',
          padding: '8px 16px',
          paddingRight: '48px',
          fontSize: '14px',
          color: isActive ? '#F1F5F9' : '#64748B',
          background: isActive ? '#334155' : 'transparent',
          borderRadius: '6px',
          textDecoration: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        })}
      >
        <span style={{ marginRight: '4px' }}>{domain.icon}</span>
        {domain.name}
      </NavLink>

      {showActions && (
        <div style={{
          position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', gap: '2px',
        }}>
          <ActionBtn label="编辑" onClick={onEdit} />
          <ActionBtn label="删除" onClick={onDelete} danger />
        </div>
      )}
    </div>
  )
}

function ActionBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: '22px', height: '22px', borderRadius: '4px', border: 'none',
        background: danger ? 'rgba(239,68,68,0.2)' : 'rgba(100,116,139,0.2)',
        color: danger ? '#EF4444' : '#94A3B8',
        fontSize: '11px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        lineHeight: 1,
      }}
    >
      {danger ? '✕' : '✎'}
    </button>
  )
}

const sidebarStyle: React.CSSProperties = {
  width: '240px',
  minWidth: '240px',
  background: '#1E293B',
  borderRight: '1px solid #334155',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  padding: '16px 0',
}

const addBtnStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748B',
  background: 'none',
  border: '1px dashed #334155',
  borderRadius: '6px',
  padding: '6px 12px',
  width: '100%',
  cursor: 'pointer',
  textAlign: 'left',
}
