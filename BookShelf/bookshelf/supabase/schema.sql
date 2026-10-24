-- Jalankan sekali di Supabase: SQL Editor -> New query -> paste -> Run

create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  pdf_path text not null,
  cover_path text,
  total_pages int not null default 0,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.history (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  last_page int not null default 1,
  read_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

alter table public.books enable row level security;
alter table public.history enable row level security;

create policy "books_own" on public.books for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "history_own" on public.history for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Storage: pdfs = privat, covers = publik (dibaca lewat URL)
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false), ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "storage_own_files" on storage.objects for all to authenticated
  using (bucket_id in ('pdfs', 'covers') and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id in ('pdfs', 'covers') and (storage.foldername(name))[1] = auth.uid()::text);
