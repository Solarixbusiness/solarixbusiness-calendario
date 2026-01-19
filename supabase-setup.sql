-- =============================================
-- SUPABASE SETUP - Calendario Team SolarixBusiness
-- =============================================
-- Esegui questo script nell'SQL Editor di Supabase
-- Dashboard > SQL Editor > New Query > Incolla e Run

-- 1. Tabella profiles (per nomi utenti)
-- =============================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  avatar_color varchar(7) default '#3B82F6',
  created_at timestamp with time zone default now()
);

-- RLS per profiles
alter table profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Trigger per creare profilo automaticamente alla registrazione
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_color)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case 
      when (select count(*) from profiles) % 6 = 0 then '#3B82F6'
      when (select count(*) from profiles) % 6 = 1 then '#10B981'
      when (select count(*) from profiles) % 6 = 2 then '#F59E0B'
      when (select count(*) from profiles) % 6 = 3 then '#EF4444'
      when (select count(*) from profiles) % 6 = 4 then '#8B5CF6'
      else '#EC4899'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Tabella appointments
-- =============================================
create table if not exists appointments (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  color varchar(7),
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indici per performance
create index if not exists idx_appointments_start_time on appointments(start_time);
create index if not exists idx_appointments_created_by on appointments(created_by);

-- RLS per appointments
alter table appointments enable row level security;

-- Policy: utenti autenticati possono vedere tutti gli appuntamenti
create policy "Authenticated users can view all appointments"
  on appointments for select
  to authenticated
  using (true);

-- Policy: utenti autenticati possono inserire appuntamenti
create policy "Authenticated users can insert appointments"
  on appointments for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Policy: solo il creatore può modificare
create policy "Users can update own appointments"
  on appointments for update
  to authenticated
  using (auth.uid() = created_by);

-- Policy: solo il creatore può eliminare
create policy "Users can delete own appointments"
  on appointments for delete
  to authenticated
  using (auth.uid() = created_by);

-- =============================================
-- FINE SETUP DATABASE
-- =============================================
-- Dopo aver eseguito questo script:
-- 1. Vai su Authentication > Users
-- 2. Clicca "Add user" > "Create new user"
-- 3. Crea i 3 utenti del team con email e password
-- =============================================
