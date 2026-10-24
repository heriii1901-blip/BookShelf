import { useState } from 'react'
import Header from '../components/Header'
import BookGrid from '../components/BookGrid'

export default function Book({ books, onOpen }) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('new')
  const [onlyLib, setOnlyLib] = useState(false)

  let list = books.filter((b) => b.title.toLowerCase().includes(q.toLowerCase()))
  if (onlyLib) list = list.filter((b) => b.is_favorite)
  if (sort === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title))

  return (
    <>
      <Header title="Book" onQuery={setQ} />
      <div className="page">
        <div className="pills">
          <button className={'pill' + (sort === 'new' ? ' on' : '')} onClick={() => setSort('new')}>
            Terbaru
          </button>
          <button className={'pill' + (sort === 'az' ? ' on' : '')} onClick={() => setSort('az')}>
            Judul A-Z
          </button>
          <button className={'pill' + (onlyLib ? ' on' : '')} onClick={() => setOnlyLib(!onlyLib)}>
            Di Pustaka
          </button>
        </div>
        <BookGrid
          books={list}
          onOpen={onOpen}
          showFav
          empty="Belum ada buku. Upload dulu lewat tab Upload."
        />
      </div>
    </>
  )
}
