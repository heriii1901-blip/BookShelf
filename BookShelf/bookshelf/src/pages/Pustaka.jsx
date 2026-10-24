import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import Header from '../components/Header'
import BookGrid from '../components/BookGrid'

const SORTS = { recent: 'Terbaru ditambah', az: 'Judul A-Z', read: 'Terakhir dibaca' }

export default function Pustaka({ books, history, onOpen }) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('recent')
  const [menu, setMenu] = useState(false)
  const last = (id) => history.find((h) => h.book_id === id)?.read_at || ''

  let list = books.filter((b) => b.is_favorite && b.title.toLowerCase().includes(q.toLowerCase()))
  if (sort === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
  if (sort === 'read') list = [...list].sort((a, b) => last(b.id).localeCompare(last(a.id)))

  return (
    <>
      <Header title="Pustaka" onQuery={setQ}>
        <button className="icon" onClick={() => setMenu(!menu)}>
          <MoreVertical size={22} />
        </button>
        {menu && (
          <div className="menu">
            {Object.entries(SORTS).map(([k, v]) => (
              <button
                key={k}
                className={sort === k ? 'sel' : ''}
                onClick={() => {
                  setSort(k)
                  setMenu(false)
                }}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </Header>
      <div className="page" onClick={() => menu && setMenu(false)}>
        <BookGrid
          books={list}
          onOpen={onOpen}
          empty="Pustaka kosong. Buka tab Book lalu simpan buku ke Pustaka."
        />
      </div>
    </>
  )
}
