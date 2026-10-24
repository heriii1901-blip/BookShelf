import { supabase } from './supabase'

export const coverUrl = (p) =>
  p ? supabase.storage.from('covers').getPublicUrl(p).data.publicUrl : null

export async function loadAll() {
  const [b, h] = await Promise.all([
    supabase.from('books').select('*').order('created_at', { ascending: false }),
    supabase.from('history').select('*').order('read_at', { ascending: false }),
  ])
  if (b.error) throw b.error
  if (h.error) throw h.error
  return {
    books: b.data.map((x) => ({ ...x, cover: coverUrl(x.cover_path) })),
    history: h.data,
  }
}
