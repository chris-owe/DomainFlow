import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { InboxItem, InboxItemType } from '../types'

export interface InboxInput {
  content: string
  item_type: InboxItemType
}

function getDeadlineDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

export function useInbox() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('inbox_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch inbox items:', error)
      return
    }
    setItems(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addToInbox = async (input: InboxInput) => {
    const { error } = await supabase.from('inbox_items').insert({
      content: input.content,
      item_type: input.item_type,
      deadline: getDeadlineDate(),
    })

    if (error) {
      console.error('Failed to add inbox item:', error)
      return false
    }
    await fetchItems()
    return true
  }

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('inbox_items').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete inbox item:', error)
      return false
    }
    await fetchItems()
    return true
  }

  const processItem = async (id: string, domainId: string) => {
    // Find the item first
    const item = items.find(i => i.id === id)
    if (!item) return false

    // Create the actual content in the target domain
    if (item.item_type === 'note') {
      const { error: noteError } = await supabase.from('notes').insert({
        domain_id: domainId,
        title: item.content.slice(0, 100),
        content: item.content,
      })
      if (noteError) {
        console.error('Failed to create note from inbox:', noteError)
        return false
      }
    } else {
      const { error: taskError } = await supabase.from('tasks').insert({
        domain_id: domainId,
        title: item.content,
      })
      if (taskError) {
        console.error('Failed to create task from inbox:', taskError)
        return false
      }
    }

    // Delete the inbox item
    return deleteItem(id)
  }

  return { items, loading, addToInbox, deleteItem, processItem }
}
