import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../supabase'
import { pdfjsLib, pushBack } from '../utils'

export default function Reader({ book, startPage, onProgress, onClose }) {
  const [pdf, setPdf] = useState(null)
  const [page, setPage] = useState(startPage)
  const [bars, setBars] = useState(true)
  const [err, setErr] = useState('')
  const wrap = useRef(null)
  const canvas = useRef(null)
  const task = useRef(null)
  const pageRef = useRef(startPage)
  const timer = useRef(null)

  // buka PDF lewat signed URL
  useEffect(() => {
    let dead = false
    let doc = null
    const run = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('pdfs')
          .createSignedUrl(book.pdf_path, 3600)
        if (error) throw error
        doc = await pdfjsLib.getDocument(data.signedUrl).promise
        if (dead) {
          doc.destroy()
          return
        }
        const p = Math.min(Math.max(1, startPage), doc.numPages)
        pageRef.current = p
        setPage(p)
        setPdf(doc)
        onProgress(p)
      } catch (e) {
        setErr('Gagal membuka buku: ' + e.message)
      }
    }
    run()
    return () => {
      dead = true
      doc?.destroy()
    }
  }, [])

  // render halaman
  useEffect(() => {
    if (!pdf) return
    let dead = false
    const run = async () => {
      const pg = await pdf.getPage(page)
      if (dead) return
      const prev = task.current
      if (prev) {
        prev.cancel()
        try {
          await prev.promise
        } catch {}
      }
      if (dead) return
      const w = wrap.current.clientWidth
      const base = pg.getViewport({ scale: 1 })
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      const vp = pg.getViewport({ scale: (w / base.width) * dpr })
      const c = canvas.current
      c.width = vp.width
      c.height = vp.height
      c.style.width = w + 'px'
      c.style.height = vp.height / dpr + 'px'
      const t = pg.render({ canvasContext: c.getContext('2d'), viewport: vp })
      task.current = t
      try {
        await t.promise
      } catch {}
      wrap.current.scrollTop = 0
    }
    run()
    return () => {
      dead = true
    }
  }, [pdf, page])

  const go = (n) => {
    if (!pdf) return
    const p = Math.max(1, Math.min(pdf.numPages, n))
    setPage(p)
    pageRef.current = p
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onProgress(p), 500)
  }

  const close = () => {
    clearTimeout(timer.current)
    if (pdf) onProgress(pageRef.current)
    onClose()
  }
  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => pushBack(() => closeRef.current()), [])

  const tap = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    if (x < 0.28) go(page - 1)
    else if (x > 0.72) go(page + 1)
    else setBars((b) => !b)
  }

  return (
    <div className="reader">
      {bars && (
        <div className="bar top">
          <button className="icon" onClick={close}>
            <ArrowLeft size={22} />
          </button>
          <div className="t">{book.title}</div>
        </div>
      )}
      <div className="reader-scroll" ref={wrap} onClick={tap}>
        {err ? <div className="err">{err}</div> : <canvas ref={canvas} />}
        {!pdf && !err && <div className="center">Memuat…</div>}
      </div>
      {bars && pdf && (
        <div className="bar bot">
          <button className="icon" onClick={() => go(page - 1)}>
            <ChevronLeft size={22} />
          </button>
          <input
            type="range"
            min={1}
            max={pdf.numPages}
            value={page}
            onChange={(e) => go(+e.target.value)}
          />
          <span className="n">
            {page} / {pdf.numPages}
          </span>
          <button className="icon" onClick={() => go(page + 1)}>
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </div>
  )
}
