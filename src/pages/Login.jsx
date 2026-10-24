import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { data, error } =
      mode === 'in'
        ? await supabase.auth.signInWithPassword({ email, password: pw })
        : await supabase.auth.signUp({ email, password: pw })
    if (error) setMsg(error.message)
    else if (mode === 'up' && !data.session) setMsg('Akun dibuat. Cek email untuk konfirmasi, lalu masuk.')
    setBusy(false)
  }

  return (
    <form className="login" onSubmit={submit}>
      <h1>BookShelf</h1>
      <p>{mode === 'in' ? 'Masuk ke akunmu' : 'Buat akun baru'}</p>
      <label className="field">
        Email
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="field">
        Password
        <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} />
      </label>
      {msg && <div className="msg">{msg}</div>}
      <button className="btn pri" disabled={busy}>
        {mode === 'in' ? 'Masuk' : 'Daftar'}
      </button>
      <button type="button" className="btn" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
        {mode === 'in' ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
      </button>
    </form>
  )
}
