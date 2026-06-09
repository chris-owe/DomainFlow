import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Domain } from '../types'

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDomains = useCallback(async () => {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Failed to fetch domains:', error)
      return
    }
    setDomains(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const createDomain = async (domain: {
    name: string
    description: string
    color: string
    icon: string
  }) => {
    const maxOrder = domains.reduce((max, d) => Math.max(max, d.sort_order), 0)
    const { error } = await supabase.from('domains').insert({
      ...domain,
      sort_order: maxOrder + 1,
    })

    if (error) {
      console.error('Failed to create domain:', error)
      return false
    }
    await fetchDomains()
    return true
  }

  const updateDomain = async (
    id: string,
    updates: { name?: string; description?: string; color?: string; icon?: string }
  ) => {
    const { error } = await supabase
      .from('domains')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Failed to update domain:', error)
      return false
    }
    await fetchDomains()
    return true
  }

  const deleteDomain = async (id: string) => {
    const { error } = await supabase.from('domains').delete().eq('id', id)

    if (error) {
      console.error('Failed to delete domain:', error)
      return false
    }
    await fetchDomains()
    return true
  }

  return { domains, loading, createDomain, updateDomain, deleteDomain }
}
