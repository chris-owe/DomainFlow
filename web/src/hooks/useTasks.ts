import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Task, TaskStatus, TaskPriority } from '../types'

export interface TaskInput {
  domain_id: string
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string | null
  is_recurring?: boolean
  recurring_days?: number[] | null
}

function getNextRecurringDate(recurringDays: number[]): string | null {
  if (!recurringDays.length) return null
  const today = new Date()
  // Normalize to date only
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  for (let offset = 1; offset <= 7; offset++) {
    const next = new Date(todayDate)
    next.setDate(todayDate.getDate() + offset)
    if (recurringDays.includes(next.getDay())) {
      return next.toISOString().split('T')[0]
    }
  }
  return null
}

export function useTasks(domainId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('priority', { ascending: true })
      .order('due_date', { ascending: true })

    if (domainId) {
      query = query.eq('domain_id', domainId)
    }

    const { data, error } = await query
    if (error) {
      console.error('Failed to fetch tasks:', error)
      return
    }
    setTasks(data ?? [])
    setLoading(false)
  }, [domainId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = async (input: TaskInput) => {
    const { error } = await supabase.from('tasks').insert({
      domain_id: input.domain_id,
      title: input.title,
      description: input.description ?? '',
      priority: input.priority ?? 'P2',
      due_date: input.due_date ?? null,
      is_recurring: input.is_recurring ?? false,
      recurring_days: input.is_recurring ? (input.recurring_days ?? []) : null,
    })

    if (error) {
      console.error('Failed to create task:', error)
      return false
    }
    await fetchTasks()
    return true
  }

  const updateTask = async (id: string, updates: Partial<TaskInput & { status: TaskStatus }>) => {
    const payload: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }
    const { error } = await supabase.from('tasks').update(payload).eq('id', id)

    if (error) {
      console.error('Failed to update task:', error)
      return false
    }
    await fetchTasks()
    return true
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete task:', error)
      return false
    }
    await fetchTasks()
    return true
  }

  const toggleTask = async (task: Task) => {
    if (task.status === 'done') {
      // Reopen: just set back to pending
      return updateTask(task.id, { status: 'pending' })
    }

    // Mark as done
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done', updated_at: new Date().toISOString() })
      .eq('id', task.id)

    if (error) {
      console.error('Failed to complete task:', error)
      return false
    }

    // If recurring, create next occurrence
    if (task.is_recurring && task.recurring_days && task.recurring_days.length > 0) {
      const nextDate = getNextRecurringDate(task.recurring_days)
      if (nextDate) {
        await supabase.from('tasks').insert({
          domain_id: task.domain_id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          due_date: nextDate,
          is_recurring: true,
          recurring_days: task.recurring_days,
        })
      }
    }

    await fetchTasks()
    return true
  }

  return { tasks, loading, createTask, updateTask, deleteTask, toggleTask }
}
