import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function Header({ title, onQuery, children }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const change = (v) => {
    setQ(v)
    onQuery?.(v)
  }
  const close = () => {
    setOpen(false)
    change('')
  }
  return (
    <header className="header">
      {open ? (
        <>
          <input
            autoFocus
            className="search"
            placeholder="Cari judul…"
            value={q}
            onChange={(e) => change(e.target.value)}
          />
          <button className="icon" onClick={close}>
            <X size={22} />
          </button>
        </>
      ) : (
        <>
          <h1>{title}</h1>
          <div className="actions">
            {onQuery && (
              <button className="icon" onClick={() => setOpen(true)}>
                <Search size={22} />
              </button>
            )}
            {children}
          </div>
        </>
      )}
    </header>
  )
}
