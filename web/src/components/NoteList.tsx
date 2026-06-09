import type { Note } from '../types'
import NoteCard from './NoteCard'

interface NoteListProps {
  notes: Note[]
  domainNames: Record<string, string>
  domainColors: Record<string, string>
  onEdit: (note: Note) => void
}

export default function NoteList({ notes, domainNames, domainColors, onEdit }: NoteListProps) {
  if (notes.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          domainName={domainNames[note.domain_id]}
          domainColor={domainColors[note.domain_id]}
          onClick={() => onEdit(note)}
        />
      ))}
    </div>
  )
}
