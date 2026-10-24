import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
export { pdfjsLib }

// ---- tombol back Android: handler paling baru dijalankan duluan
const stack = []
export function pushBack(fn) {
  stack.push(fn)
  return () => {
    const i = stack.indexOf(fn)
    if (i >= 0) stack.splice(i, 1)
  }
}
export function runBack() {
  const fn = stack[stack.length - 1]
  if (fn) {
    fn()
    return true
  }
  return false
}

// ---- format waktu
const pad = (n) => String(n).padStart(2, '0')
export const fmtTime = (d) => {
  const x = new Date(d)
  return `${pad(x.getHours())}.${pad(x.getMinutes())}`
}
export const fmtDate = (d) => {
  const x = new Date(d)
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`
}
export function dayLabel(d) {
  const now = new Date()
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const x = new Date(d)
  const b = new Date(x.getFullYear(), x.getMonth(), x.getDate())
  const diff = Math.round((a - b) / 86400000)
  if (diff <= 0) return 'Hari ini'
  if (diff <= 6) return `${diff} hari yang lalu`
  return fmtDate(b)
}
export function groupByDay(items, getDate) {
  const out = []
  for (const it of items) {
    const label = dayLabel(getDate(it))
    const last = out[out.length - 1]
    if (last && last[0] === label) last[1].push(it)
    else out.push([label, [it]])
  }
  return out
}

// ---- cover dari halaman PDF
export async function makeCover(file, pageNum = 1) {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  const n = Math.min(Math.max(1, pageNum || 1), pdf.numPages)
  const page = await pdf.getPage(n)
  const base = page.getViewport({ scale: 1 })
  const vp = page.getViewport({ scale: 420 / base.width })
  const canvas = document.createElement('canvas')
  canvas.width = vp.width
  canvas.height = vp.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.82))
  const total = pdf.numPages
  pdf.destroy()
  return { blob, total }
}
