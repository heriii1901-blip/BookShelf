import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { loadAll } from './data'
import { pushBack } from './utils'
import BottomNav from './components/BottomNav'
import BookSheet from './components/BookSheet'
import Reader from './components/Reader'
import Pustaka from './pages/Pustaka'
import HistoryPage from './pages/History'
import Book from './pages/Book'
import Upload from './pages/Upload'
import Akun from './pages/Akun'
import Login from './pages/Login'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="center">Memuat…</div>
  if (!session) return <Login />
  return <Main session={session} />
}

function Main({ session }) {
  const uid = session.user.id
  const [tab, setTab] = useState('pustaka')
  const [books, setBooks] = useState([])
  const [history, setHistory] = useState([])
  const [err, setErr] = useState('')
  const [sheetId, setSheetId] = useState(null)
  const [reading, setReading] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const d = await loadAll()
      setBooks(d.books)
      setHistory(d.history)
      setErr('')
    } catch (e) {
      setErr(e.message)
    }
  }, [])
  useEffect(() => {
    refresh()
  }, [refresh])

  // tombol back Android: tab lain -> balik ke Pustaka
  useEffect(() => {
    if (tab === 'pustaka') return
    return pushBack(() => setTab('pustaka'))
  }, [tab])

  const progressOf = (id) => history.find((h) => h.book_id === id)
  const read = (book, page) => {
    setSheetId(null)
    setReading({ book, page: page || progressOf(book.id)?.last_page || 1 })
  }

  const saveProgress = async (bookId, page) => {
    const row = { user_id: uid, book_id: bookId, last_page: page, read_at: new Date().toISOString() }
    setHistory((h) => [row, ...h.filter((x) => x.book_id !== bookId)])
    await supabase.from('history').upsert(row, { onConflict: 'user_id,book_id' })
  }

  const toggleFav = async (b) => {
    setBooks((x) => x.map((y) => (y.id === b.id ? { ...y, is_favorite: !y.is_favorite } : y)))
    await supabase.from('books').update({ is_favorite: !b.is_favorite }).eq('id', b.id)
  }

  const removeBook = async (b) => {
    if (!confirm(`Hapus "${b.title}" secara permanen?`)) return
    await supabase.storage.from('pdfs').remove([b.pdf_path])
    if (b.cover_path) await supabase.storage.from('covers').remove([b.cover_path])
    await supabase.from('books').delete().eq('id', b.id)
    setSheetId(null)
    refresh()
  }

  const removeHistory = async (bookId) => {
    setHistory((h) => h.filter((x) => x.book_id !== bookId))
    await supabase.from('history').delete().eq('book_id', bookId)
  }

  const clearHistory = async () => {
    if (!history.length || !confirm('Hapus semua riwayat baca?')) return
    setHistory([])
    await supabase.from('history').delete().eq('user_id', uid)
  }

  const sheetBook = books.find((b) => b.id === sheetId)

  return (
    <div className="app">
      {err && <div className="err">Gagal memuat data: {err}</div>}
      {tab === 'pustaka' && <Pustaka books={books} history={history} onOpen={(b) => setSheetId(b.id)} />}
      {tab === 'history' && (
        <HistoryPage
          books={books}
          history={history}
          onRead={read}
          onRemove={removeHistory}
          onClear={clearHistory}
        />
      )}
      {tab === 'book' && <Book books={books} onOpen={(b) => setSheetId(b.id)} />}
      {tab === 'upload' && (
        <Upload
          uid={uid}
          books={books}
          onOpen={(b) => setSheetId(b.id)}
          onDelete={removeBook}
          onUploaded={refresh}
        />
      )}
      {tab === 'akun' && <Akun email={session.user.email} books={books} history={history} />}

      <BottomNav tab={tab} setTab={setTab} />

      {sheetBook && (
        <BookSheet
          book={sheetBook}
          progress={progressOf(sheetBook.id)}
          onClose={() => setSheetId(null)}
          onRead={() => read(sheetBook)}
          onFav={() => toggleFav(sheetBook)}
          onDelete={() => removeBook(sheetBook)}
        />
      )}
      {reading && (
        <Reader
          book={reading.book}
          startPage={reading.page}
          onProgress={(p) => saveProgress(reading.book.id, p)}
          onClose={() => setReading(null)}
        />
      )}
    </div>
  )
}
