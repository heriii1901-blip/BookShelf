import { useEffect } from 'react'
import { pushBack, fmtDate } from '../utils'

export default function BookSheet({ book, progress, onClose, onRead, onFav, onDelete }) {
  useEffect(() => pushBack(onClose), [])
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-top">
          {book.cover ? <img src={book.cover} alt="" /> : <div className="nocover" />}
          <div>
            <h2>{book.title}</h2>
            <div className="rs">{book.total_pages} halaman</div>
            <div className="rs">Diunggah {fmtDate(book.created_at)}</div>
            {progress && <div className="rs">Terakhir dibaca hal. {progress.last_page}</div>}
          </div>
        </div>
        <button className="btn pri" onClick={onRead}>
          {progress ? `Lanjutkan (hal. ${progress.last_page})` : 'Baca'}
        </button>
        <button className="btn" onClick={onFav}>
          {book.is_favorite ? 'Hapus dari Pustaka' : 'Simpan ke Pustaka'}
        </button>
        <button className="btn danger" onClick={onDelete}>
          Hapus buku
        </button>
      </div>
    </div>
  )
}
