import { Heart } from 'lucide-react'

export default function BookGrid({ books, onOpen, showFav, empty }) {
  if (!books.length) return <div className="empty">{empty || 'Belum ada buku'}</div>
  return (
    <div className="grid">
      {books.map((b) => (
        <button key={b.id} className="card" onClick={() => onOpen(b)}>
          {b.cover ? <img src={b.cover} alt="" loading="lazy" /> : <div className="nocover" />}
          {showFav && b.is_favorite && (
            <span className="badge">
              <Heart size={12} fill="currentColor" />
            </span>
          )}
          <span className="ctitle">{b.title}</span>
        </button>
      ))}
    </div>
  )
}
