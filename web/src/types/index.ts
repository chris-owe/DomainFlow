export interface Domain {
  id: string
  name: string
  description: string
  color: string
  icon: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'done'
export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3'

export interface Task {
  id: string
  domain_id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  is_recurring: boolean
  recurring_days: number[] | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  domain_id: string
  title: string
  content: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type InboxItemType = 'task' | 'note'

export interface InboxItem {
  id: string
  content: string
  item_type: InboxItemType
  processed: boolean
  deadline: string
  created_at: string
}
