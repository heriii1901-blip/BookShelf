import { Trash2, FileText } from 'lucide-react'
import Header from '../components/Header'
import { fmtTime, groupByDay } from '../utils'
import { useState } from 'react'

export default function HistoryPage({ books, history, onRead, onRemove, onClear }) {
  const [q, setQ] = useState('')
  const byId = Object.fromEntries(books.map((b) => [b.id, b]))
  const rows = history.filter(
    (h) => byId[h.book_id] && byId[h.book_id].title.toLowerCase().includes(q.toLowerCase())
  )
  const groups = groupByDay(rows, (h) => h.read_at)

  return (
    <>
      <Header title="History" onQuery={setQ}>
        <button className="icon" onClick={onClear}>
          <Trash2 size={22} />
        </button>
      </Header>
      <div className="page">
        {!groups.length && <div className="empty">Belum ada riwayat baca.</div>}
        {groups.map(([label, items]) => (
          <div key={label}>
            <div className="gh">{label}</div>
            {items.map((h) => {
              const b = byId[h.book_id]
              return (
                <div className="row" key={h.book_id}>
                  <button className="rowmain" onClick={() => onRead(b, h.last_page)}>
                    {b.cover ? <img src={b.cover} alt="" /> : <div className="nocover" />}
                    <div className="meta">
                      <div className="rt">{b.title}</div>
                      <div className="rs">{fmtTime(h.read_at)}</div>
                      <div className="rs">
                        {h.last_page} <FileText size={13} /> - {b.total_pages}
                      </div>
                    </div>
                  </button>
                  <button className="icon" onClick={() => onRemove(b.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
