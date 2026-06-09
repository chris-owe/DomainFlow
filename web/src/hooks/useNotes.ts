import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Note } from '../types'

export interface NoteInput {
  domain_id: string
  title: string
  content: string
}

export function useNotes(domainId?: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    let query = supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })

    if (domainId) {
      query = query.eq('domain_id', domainId)
    }

    const { data, error } = await query
    if (error) {
      console.error('Failed to fetch notes:', error)
      return
    }
    setNotes(data ?? [])
    setLoading(false)
  }, [domainId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const createNote = async (input: NoteInput) => {
    const { error } = await supabase.from('notes').insert({
      domain_id: input.domain_id,
      title: input.title,
      content: input.content,
    })

    if (error) {
      console.error('Failed to create note:', error)
      return false
    }
    await fetchNotes()
    return true
  }

  const updateNote = async (id: string, updates: { title?: string; content?: string }) => {
    const { error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Failed to update note:', error)
      return false
    }
    await fetchNotes()
    return true
  }

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete note:', error)
      return false
    }
    await fetchNotes()
    return true
  }

  return { notes, loading, createNote, updateNote, deleteNote }
}
