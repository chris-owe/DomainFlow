import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useInbox } from '../hooks/useInbox'
import { useDomains } from '../hooks/useDomains'
import ProcessDialog from '../components/ProcessDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import type { InboxItem } from '../types'

function daysUntil(deadline: string): number {
  const now = new Date()
  const d = new Date(deadline)
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDeadline(days: number): string {
  if (days < 0) return `已超期 ${Math.abs(days)} 天`
  if (days === 0) return '今天截止'
  if (days === 1) return '明天截止'
  return `剩余 ${days} 天`
}

export default function InboxView() {
  const { items, loading, addToInbox, deleteItem, processItem } = useInbox()
  const { domains } = useDomains()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showQuickAdd, setShowQuickAdd] = useState(searchParams.has('quick'))
  const [quickText, setQuickText] = useState('')
  const [quickType, setQuickType] = useState<'task' | 'note'>(
    searchParams.get('quick') === 'note' ? 'note' : 'task'
  )

  // Auto-clear the query param after opening
  useEffect(() => {
    if (searchParams.has('quick')) {
      setSearchParams({}, { replace: true })
    }
  }, [])
  const [processingItem, setProcessingItem] = useState<InboxItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InboxItem | null>(null)

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickText.trim()) return
    const ok = await addToInbox({ content: quickText.trim(), item_type: quickType })
    if (ok) {
      setQuickText('')
      setShowQuickAdd(false)
    }
  }

  const pendingItems = items.filter(i => !i.processed)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>📥 收集箱</h1>
          {pendingItems.length > 0 && (
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              {pendingItems.length} 条待处理 · 建议每周清理一次
            </p>
          )}
        </div>
        <button onClick={() => setShowQuickAdd(true)} style={addBtnStyle}>
          ＋ 快速捕获
        </button>
      </div>

      {/* Quick add inline */}
      {showQuickAdd && (
        <div style={{ marginBottom: '20px', padding: '16px', background: '#1E293B', borderRadius: '8px', border: '1px solid #334155' }}>
          <form onSubmit={handleQuickAdd}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <button type="button" onClick={() => setQuickType('task')}
                style={toggleBtnStyle(quickType === 'task')}>✅ 任务</button>
              <button type="button" onClick={() => setQuickType('note')}
                style={toggleBtnStyle(quickType === 'note')}>📝 笔记</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={quickText}
                onChange={e => setQuickText(e.target.value)}
                placeholder={quickType === 'task' ? '快速记下一个待办...' : '快速记下一个灵感...'}
                autoFocus
                style={inputStyle}
              />
              <button type="submit" disabled={!quickText.trim()} style={submitBtnStyle}>添加</button>
              <button type="button" onClick={() => { setShowQuickAdd(false); setQuickText('') }} style={cancelBtnStyle}>取消</button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ color: '#64748B', padding: '40px 0', textAlign: 'center' }}>加载中...</div>
      ) : pendingItems.length === 0 ? (
        <div style={{ color: '#64748B', padding: '60px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📥</div>
          <div style={{ fontSize: '15px' }}>收集箱已清空，没有待归类的信息</div>
          <div style={{ fontSize: '13px', marginTop: '8px', color: '#475569' }}>
            点击「快速捕获」随时随地记录想法
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pendingItems.map(item => {
            const days = daysUntil(item.deadline)
            const isUrgent = days <= 3 && days >= 0
            const isOverdue = days < 0

            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', background: '#1E293B', borderRadius: '8px',
                border: `1px solid ${isOverdue ? '#EF4444' : isUrgent ? '#F59E0B' : '#334155'}`,
              }}>
                {/* Type icon */}
                <span style={{ fontSize: '16px', flexShrink: 0 }}>
                  {item.item_type === 'note' ? '📝' : '✅'}
                </span>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', color: '#F1F5F9', marginBottom: '4px' }}>{item.content}</div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{
                      fontSize: '11px', padding: '2px 6px', borderRadius: '4px',
                      background: item.item_type === 'note' ? '#8B5CF620' : '#06B6D420',
                      color: item.item_type === 'note' ? '#8B5CF6' : '#06B6D4',
                    }}>
                      {item.item_type === 'note' ? '笔记' : '任务'}
                    </span>
                    <span style={{
                      fontSize: '12px',
                      color: isOverdue ? '#EF4444' : isUrgent ? '#F59E0B' : '#64748B',
                      fontWeight: isOverdue || isUrgent ? 600 : 400,
                    }}>
                      {isOverdue ? '⚠ ' : ''}{formatDeadline(days)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => setProcessingItem(item)}
                    style={actionBtnStyle('#06B6D4')}>归类</button>
                  <button onClick={() => setDeletingItem(item)}
                    style={actionBtnStyle('#EF4444')}>删除</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      {processingItem && (
        <ProcessDialog
          item={processingItem}
          domains={domains}
          onClose={() => setProcessingItem(null)}
          onConfirm={async (domainId) => {
            const ok = await processItem(processingItem.id, domainId)
            if (ok) setProcessingItem(null)
            return ok
          }}
        />
      )}

      {deletingItem && (
        <ConfirmDialog
          title="删除"
          message={`确定要丢弃「${deletingItem.content.slice(0, 50)}${deletingItem.content.length > 50 ? '...' : ''}」吗？`}
          onClose={() => setDeletingItem(null)}
          onConfirm={async () => {
            const ok = await deleteItem(deletingItem.id)
            if (ok) setDeletingItem(null)
            return ok
          }}
        />
      )}
    </div>
  )
}

function toggleBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: 500,
    background: active ? '#334155' : 'transparent',
    color: active ? '#F1F5F9' : '#64748B',
  }
}

const addBtnStyle: React.CSSProperties = {
  padding: '6px 14px', borderRadius: '6px', border: 'none',
  background: '#06B6D4', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
}

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #334155',
  background: '#0F172A', color: '#F1F5F9', fontSize: '14px', outline: 'none',
}

const submitBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: 'none',
  background: '#06B6D4', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155',
  background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '14px',
}

function actionBtnStyle(color: string): React.CSSProperties {
  return {
    padding: '5px 10px', borderRadius: '4px', border: `1px solid ${color}33`,
    background: `${color}15`, color, cursor: 'pointer', fontSize: '12px',
  }
}
