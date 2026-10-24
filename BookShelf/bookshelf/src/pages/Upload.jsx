import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import { supabase } from '../supabase'
import { fmtDate, groupByDay, makeCover, pushBack } from '../utils'

function UploadSheet({ uid, onClose, onDone }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [cp, setCp] = useState(1)
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const cover = useRef(null)

  useEffect(() => pushBack(onClose), [])

  const gen = async (f, p) => {
    try {
      setMsg('Membuat cover…')
      const r = await makeCover(f, p)
      cover.current = r
      setPreview((old) => {
        if (old) URL.revokeObjectURL(old)
        return URL.createObjectURL(r.blob)
      })
      setMsg('')
    } catch (e) {
      cover.current = null
      setMsg('PDF tidak bisa dibaca: ' + e.message)
    }
  }

  const pick = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ''))
    gen(f, cp)
  }

  const submit = async () => {
    if (!file || !cover.current || !title.trim()) return
    setBusy(true)
    setMsg('Mengunggah… jangan tutup aplikasi')
    try {
      const id = crypto.randomUUID()
      const pdfPath = `${uid}/${id}.pdf`
      const coverPath = `${uid}/${id}.jpg`
      let r = await supabase.storage.from('pdfs').upload(pdfPath, file, { contentType: 'application/pdf' })
      if (r.error) throw r.error
      r = await supabase.storage.from('covers').upload(coverPath, cover.current.blob, { contentType: 'image/jpeg' })
      if (r.error) throw r.error
      r = await supabase.from('books').insert({
        id,
        title: title.trim(),
        pdf_path: pdfPath,
        cover_path: coverPath,
        total_pages: cover.current.total,
      })
      if (r.error) throw r.error
      onDone()
    } catch (e) {
      setMsg('Gagal: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <div className="overlay" onClick={busy ? undefined : onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Upload buku</h2>
        <label className="field">
          File PDF
          <input type="file" accept="application/pdf,.pdf" onChange={pick} />
        </label>
        <label className="field">
          Judul
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="field">
          Halaman untuk cover
          <input
            type="number"
            min={1}
            value={cp}
            onChange={(e) => setCp(+e.target.value || 1)}
            onBlur={() => file && gen(file, cp)}
          />
        </label>
        {preview && <img className="prev" src={preview} alt="cover" />}
        {msg && <div className="msg">{msg}</div>}
        <button className="btn pri" disabled={busy || !file || !cover.current} onClick={submit}>
          {busy ? 'Mengunggah…' : 'Upload'}
        </button>
      </div>
    </div>
  )
}

export default function Upload({ uid, books, onOpen, onDelete, onUploaded }) {
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const rows = books.filter((b) => b.title.toLowerCase().includes(q.toLowerCase()))
  const groups = groupByDay(rows, (b) => b.created_at)

  return (
    <>
      <Header title="Upload" onQuery={setQ} />
      <div className="page">
        {!groups.length && <div className="empty">Belum ada buku. Tekan + untuk upload PDF.</div>}
        {groups.map(([label, items]) => (
          <div key={label}>
            <div className="gh">{label}</div>
            {items.map((b) => (
              <div className="row" key={b.id}>
                <button className="rowmain" onClick={() => onOpen(b)}>
                  {b.cover ? <img src={b.cover} alt="" /> : <div className="nocover" />}
                  <div className="meta">
                    <div className="rt">{b.title}</div>
                    <div className="rs">{fmtDate(b.created_at)}</div>
                    <div className="rs">{b.total_pages} halaman</div>
                  </div>
                </button>
                <button className="icon" onClick={() => onDelete(b)}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="fab" onClick={() => setAdding(true)}>
        <Plus size={28} />
      </button>
      {adding && (
        <UploadSheet
          uid={uid}
          onClose={() => setAdding(false)}
          onDone={() => {
            setAdding(false)
            onUploaded()
          }}
        />
      )}
    </>
  )
}
