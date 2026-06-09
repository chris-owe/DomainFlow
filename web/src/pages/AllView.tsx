import { useState } from 'react'
import { useDomains } from '../hooks/useDomains'
import { useTasks } from '../hooks/useTasks'
import { useNotes } from '../hooks/useNotes'
import TaskList from '../components/TaskList'
import TaskDialog from '../components/TaskDialog'
import NoteList from '../components/NoteList'
import NoteDialog from '../components/NoteDialog'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Task, Note } from '../types'
import type { TaskInput } from '../hooks/useTasks'
import type { NoteInput } from '../hooks/useNotes'

type Tab = 'all' | 'notes' | 'tasks'

export default function AllView() {
  const { domains } = useDomains()
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask, toggleTask } = useTasks()
  const { notes, loading: notesLoading, createNote, updateNote, deleteNote } = useNotes()

  const [tab, setTab] = useState<Tab>('tasks')
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateNote, setShowCreateNote] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [deletingNote, setDeletingNote] = useState<Note | null>(null)

  const domainNames: Record<string, string> = {}
  const domainColors: Record<string, string> = {}
  domains.forEach(d => { domainNames[d.id] = d.name; domainColors[d.id] = d.color })

  const activeTasks = tasks.filter(t => t.status !== 'done')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>📥 所有内容</h1>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #334155' }}>
        <Tab label="全部" active={tab === 'all'} onClick={() => setTab('all')} />
        <Tab label="笔记" active={tab === 'notes'} onClick={() => setTab('notes')} />
        <Tab label="任务" active={tab === 'tasks'} onClick={() => setTab('tasks')} />
        <div style={{ flex: 1 }} />
        {tab === 'tasks' && (
          <button onClick={() => setShowCreateTask(true)} style={createBtnStyle}>＋ 新建任务</button>
        )}
        {tab === 'notes' && (
          <button onClick={() => setShowCreateNote(true)} style={createBtnStyle}>＋ 新建笔记</button>
        )}
      </div>

      {/* === 全部 Tab === */}
      {tab === 'all' && (
        <>
          {tasksLoading || notesLoading ? (
            <div style={{ color: '#64748B', padding: '40px 0', textAlign: 'center' }}>加载中...</div>
          ) : tasks.length === 0 && notes.length === 0 ? (
            <div style={{ color: '#64748B', padding: '40px 0', textAlign: 'center' }}>还没有内容</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeTasks.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>待办任务（{activeTasks.length}）</div>
                  <TaskList tasks={activeTasks} domainNames={domainNames} domainColors={domainColors} onToggle={toggleTask} onEdit={setEditingTask} />
                </div>
              )}
              {notes.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>笔记（{notes.length}）</div>
                  <NoteList notes={notes} domainNames={domainNames} domainColors={domainColors} onEdit={setEditingNote} />
                </div>
              )}
              {doneTasks.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>已完成任务（{doneTasks.length}）</div>
                  <TaskList tasks={doneTasks} domainNames={domainNames} domainColors={domainColors} onToggle={toggleTask} onEdit={setEditingTask} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* === 笔记 Tab === */}
      {tab === 'notes' && (
        <>
          {notesLoading ? (
            <div style={{ color: '#64748B', padding: '40px 0', textAlign: 'center' }}>加载中...</div>
          ) : notes.length === 0 ? (
            <div style={{ color: '#64748B', padding: '40px 0', textAlign: 'center' }}>还没有笔记，开始记录你的想法吧</div>
          ) : (
            <NoteList notes={notes} domainNames={domainNames} domainColors={domainColors} onEdit={setEditingNote} />
          )}
        </>
      )}

      {/* === 任务 Tab === */}
      {tab === 'tasks' && (
        <>
          {tasksLoading ? (
            <div style={{ color: '#64748B', padding: '40px 0', textAlign: 'center' }}>加载中...</div>
          ) : tasks.length === 0 ? (
            <div style={{ color: '#64748B', padding: '40px 0', textAlign: 'center' }}>还没有任务</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeTasks.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>进行中（{activeTasks.length}）</div>
                  <TaskList tasks={activeTasks} domainNames={domainNames} domainColors={domainColors} onToggle={toggleTask} onEdit={setEditingTask} />
                </div>
              )}
              {doneTasks.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', marginTop: '16px' }}>已完成（{doneTasks.length}）</div>
                  <TaskList tasks={doneTasks} domainNames={domainNames} domainColors={domainColors} onToggle={toggleTask} onEdit={setEditingTask} />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Task dialogs */}
      {showCreateTask && (
        <TaskDialog mode="create" domains={domains} onClose={() => setShowCreateTask(false)}
          onConfirm={async (data: TaskInput) => { const ok = await createTask(data); if (ok) setShowCreateTask(false); return ok }} />
      )}
      {editingTask && (
        <TaskDialog mode="edit" domains={domains} task={editingTask} onClose={() => setEditingTask(null)}
          onConfirm={async (data: TaskInput) => { const ok = await updateTask(editingTask.id, data); if (ok) setEditingTask(null); return ok }}
          onDelete={() => setDeletingTask(editingTask)} />
      )}
      {deletingTask && (
        <ConfirmDialog title="删除任务" message={`确定要删除「${deletingTask.title}」吗？`} onClose={() => setDeletingTask(null)}
          onConfirm={async () => { const ok = await deleteTask(deletingTask.id); if (ok) setDeletingTask(null); return ok }} />
      )}

      {/* Note dialogs */}
      {showCreateNote && (
        <NoteDialog mode="create" domains={domains} onClose={() => setShowCreateNote(false)}
          onConfirm={async (data: NoteInput) => { const ok = await createNote(data); if (ok) setShowCreateNote(false); return ok }} />
      )}
      {editingNote && (
        <NoteDialog mode="edit" domains={domains} note={editingNote} onClose={() => setEditingNote(null)}
          onConfirm={async (data: NoteInput) => { const ok = await updateNote(editingNote.id, data); if (ok) setEditingNote(null); return ok }}
          onDelete={() => setDeletingNote(editingNote)} />
      )}
      {deletingNote && (
        <ConfirmDialog title="删除笔记" message={`确定要删除「${deletingNote.title || '无标题笔记'}」吗？`} onClose={() => setDeletingNote(null)}
          onConfirm={async () => { const ok = await deleteNote(deletingNote.id); if (ok) setDeletingNote(null); return ok }} />
      )}
    </div>
  )
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 16px', fontSize: '14px', color: active ? '#06B6D4' : '#64748B',
      borderBottom: active ? '2px solid #06B6D4' : '2px solid transparent',
      background: 'none', border: 'none', cursor: 'pointer', marginBottom: '-1px',
    }}>
      {label}
    </button>
  )
}

const createBtnStyle: React.CSSProperties = {
  padding: '6px 14px', borderRadius: '6px', border: 'none',
  background: '#06B6D4', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
}
