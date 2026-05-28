-- crear_tablas.sql
-- Ejecuta este script en el SQL editor de Supabase.
-- Si te pregunta sobre RLS, selecciona "Run and enable RLS".

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  correo text NOT NULL UNIQUE,
  hashed_password text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.songs (
  id bigserial PRIMARY KEY,
  titulo text NOT NULL,
  artista text NOT NULL,
  bpm integer NOT NULL,
  tono text,
  genero text,
  energia text,
  album text
);

CREATE TABLE IF NOT EXISTS public.sets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  bpm_rango text,
  fecha text,
  created_at timestamptz DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.set_songs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  set_id bigint REFERENCES public.sets(id) ON DELETE CASCADE,
  song_id bigint REFERENCES public.songs(id) ON DELETE RESTRICT,
  orden integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_songs_genero ON public.songs(genero);
CREATE INDEX IF NOT EXISTS idx_sets_userid ON public.sets(user_id);

-- Policies publicas/seguras
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_songs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users: self access" ON public.users;
CREATE POLICY "Users: self access" ON public.users
  FOR SELECT, UPDATE, DELETE
  USING (auth.uid()::uuid = id);

DROP POLICY IF EXISTS "Songs: allow select" ON public.songs;
CREATE POLICY "Songs: allow select" ON public.songs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Sets: owner full access" ON public.sets;
CREATE POLICY "Sets: owner full access" ON public.sets
  FOR ALL
  USING (auth.uid()::uuid = user_id)
  WITH CHECK (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "SetSongs: owner access" ON public.set_songs;
CREATE POLICY "SetSongs: owner access" ON public.set_songs
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.sets s WHERE s.id = set_songs.set_id AND auth.uid()::uuid = s.user_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sets s WHERE s.id = set_songs.set_id AND auth.uid()::uuid = s.user_id
  ));
