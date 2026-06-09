import type { Task } from '../types'
import TaskCard from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  domainNames: Record<string, string>
  domainColors: Record<string, string>
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
}

export default function TaskList({ tasks, domainNames, domainColors, onToggle, onEdit }: TaskListProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          domainName={domainNames[task.domain_id]}
          domainColor={domainColors[task.domain_id]}
          onToggle={() => onToggle(task)}
          onClick={() => onEdit(task)}
        />
      ))}
    </div>
  )
}
