import Header from '../components/Header'
import { supabase } from '../supabase'

export default function Akun({ email, books, history }) {
  return (
    <>
      <Header title="Akun" />
      <div className="page akun">
        <div className="email">{email}</div>
        <div className="stat">
          {books.length} buku · {books.filter((b) => b.is_favorite).length} di Pustaka · {history.length} riwayat
        </div>
        <button className="btn danger" onClick={() => supabase.auth.signOut()}>
          Keluar
        </button>
      </div>
    </>
  )
}
