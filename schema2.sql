-- =====================================================================
-- Devize Service Auto: schema bazei de date (Supabase / PostgreSQL)
-- Se rulează O SINGURĂ DATĂ: Supabase > SQL Editor > New query > lipești tot > Run
-- =====================================================================

-- ---------- Tabele ----------

-- Un rând pe servis (clientul tău). Datele de pe antetul documentelor sunt aici.
create table if not exists public.services (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default 'Serviciul meu',
  address       text not null default '',
  phone         text not null default '',
  email         text not null default '',
  fiscal        text not null default '',          -- CUI
  reg           text not null default '',          -- Nr. Reg. Comertului
  logo          text not null default '',
  currency      text not null default 'lei',
  vat_mode      text not null default 'excl' check (vat_mode in ('none', 'excl', 'incl')),
  vat_rate      text not null default '21',
  note_estimate text not null default 'Deviz estimativ. Prețul final poate varia dacă apar defecțiuni suplimentare; acestea se execută doar cu acordul clientului.',
  note_work     text not null default '',
  warranty      text not null default '',
  next_no       integer not null default 1,
  created_at    timestamptz not null default now()
);

-- Cine are acces la ce servis (un cont = un servis; mai târziu poți adăuga angajați).
create table if not exists public.members (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  role       text not null default 'owner',
  created_at timestamptz not null default now()
);

-- Returnează servisul utilizatorului conectat. Folosită de regulile de securitate.
create or replace function public.my_service_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select service_id from public.members where user_id = auth.uid() limit 1
$$;

create table if not exists public.orders (
  id         uuid primary key,
  service_id uuid not null default public.my_service_id() references public.services (id) on delete cascade,
  no         integer not null,
  date       date not null default current_date,
  status     text not null default 'open' check (status in ('open', 'closed')),
  plate      text not null default '',
  make       text not null default '',
  model      text not null default '',
  year       text not null default '',
  vin        text not null default '',
  km         text not null default '',
  client     text not null default '',
  phone      text not null default '',
  client_address text not null default '',
  complaint  text not null default '',
  findings   text not null default '',
  notes      text not null default '',
  discount   text not null default '',
  vat_mode   text not null default 'none' check (vat_mode in ('none', 'excl', 'incl')),
  vat_rate   text not null default '21',
  lines      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (service_id, no)
);
create index if not exists orders_service_date_idx  on public.orders (service_id, date desc);
create index if not exists orders_service_plate_idx on public.orders (service_id, plate);

-- Piese și manopere folosite des (completează prețul automat).
create table if not exists public.catalog (
  service_id uuid not null default public.my_service_id() references public.services (id) on delete cascade,
  key        text not null,
  name       text not null,
  type       text not null default 'piesa',
  price      text not null default '',
  primary key (service_id, key)
);

-- Pachete de lucrări salvate.
create table if not exists public.packages (
  id         uuid primary key default gen_random_uuid(),
  service_id uuid not null default public.my_service_id() references public.services (id) on delete cascade,
  name       text not null,
  lines      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Securitate: fiecare servis vede doar datele lui ----------

alter table public.services enable row level security;
alter table public.members  enable row level security;
alter table public.orders   enable row level security;
alter table public.catalog  enable row level security;
alter table public.packages enable row level security;

drop policy if exists services_select on public.services;
drop policy if exists services_update on public.services;
create policy services_select on public.services for select to authenticated
  using (id = public.my_service_id());
create policy services_update on public.services for update to authenticated
  using (id = public.my_service_id()) with check (id = public.my_service_id());

drop policy if exists members_select on public.members;
create policy members_select on public.members for select to authenticated
  using (user_id = auth.uid());

drop policy if exists orders_all on public.orders;
create policy orders_all on public.orders for all to authenticated
  using (service_id = public.my_service_id()) with check (service_id = public.my_service_id());

drop policy if exists catalog_all on public.catalog;
create policy catalog_all on public.catalog for all to authenticated
  using (service_id = public.my_service_id()) with check (service_id = public.my_service_id());

drop policy if exists packages_all on public.packages;
create policy packages_all on public.packages for all to authenticated
  using (service_id = public.my_service_id()) with check (service_id = public.my_service_id());

-- Utilizatorii neconectați nu au acces la nimic.
revoke all on public.services, public.members, public.orders, public.catalog, public.packages from anon;

-- Un servis poate modifica doar datele de antet, nu contorul de numere sau data creării.
revoke update on public.services from authenticated;
grant update (name, address, phone, email, fiscal, reg, logo, currency, vat_mode, vat_rate, note_estimate, note_work, warranty)
  on public.services to authenticated;
-- Contul nu se creează și nu se șterge din aplicație.
revoke insert, delete on public.services from authenticated;
revoke insert, update, delete on public.members from authenticated;

-- ---------- Funcții ----------

-- La crearea unui cont nou se creează automat și servisul lui.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sid uuid;
begin
  insert into public.services (name, email)
  values (coalesce(nullif(trim(new.raw_user_meta_data ->> 'service_name'), ''), 'Serviciul meu'), coalesce(new.email, ''))
  returning id into sid;
  insert into public.members (user_id, service_id, role) values (new.id, sid, 'owner');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Numărul următorului deviz, fără dubluri chiar dacă se lucrează de pe 2 dispozitive.
create or replace function public.next_order_no()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.services
     set next_no = next_no + 1
   where id = public.my_service_id()
  returning next_no - 1 into n;
  if n is null then
    raise exception 'Contul nu are un servis asociat';
  end if;
  return n;
end;
$$;

-- Folosită la importul din fișierul vechi: ridică contorul peste cel mai mare număr importat.
create or replace function public.bump_next_no(n integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.services set next_no = greatest(next_no, n) where id = public.my_service_id();
end;
$$;

revoke all on function public.my_service_id()    from public, anon;
revoke all on function public.next_order_no()    from public, anon;
revoke all on function public.bump_next_no(integer) from public, anon;
revoke all on function public.handle_new_user()  from public, anon, authenticated;
grant execute on function public.my_service_id()    to authenticated;
grant execute on function public.next_order_no()    to authenticated;
grant execute on function public.bump_next_no(integer) to authenticated;
