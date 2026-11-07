-- Foundation for a production store. Demo mode never connects to these tables.
create type public.app_role as enum ('admin','cashier');
create table public.profiles (id uuid primary key references auth.users(id), full_name text not null, role public.app_role not null default 'cashier');
create table public.products (id uuid primary key default gen_random_uuid(), name text not null, sku text unique not null, category text not null, price numeric(12,2) not null check(price>=0), stock integer not null default 0 check(stock>=0));
create table public.sales (id uuid primary key default gen_random_uuid(), cashier_id uuid not null references public.profiles(id), total numeric(12,2) not null check(total>=0), payment text not null, created_at timestamptz not null default now());
create table public.sale_items (id uuid primary key default gen_random_uuid(), sale_id uuid references public.sales(id), product_id uuid references public.products(id), quantity integer not null check(quantity>0), unit_price numeric(12,2) not null);
create table public.audit_events (id bigint generated always as identity primary key, actor_id uuid references auth.users(id), action text not null, detail jsonb not null, created_at timestamptz not null default now());
create function public.is_admin() returns boolean language sql security definer stable set search_path=public as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin'); $$;
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.audit_events enable row level security;
create policy "View own profile or admin team" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy "Admin manage profiles" on public.profiles for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Staff read products" on public.products for select to authenticated using(true);
create policy "Admin manage products" on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Read own sales or admin" on public.sales for select to authenticated using(cashier_id=auth.uid() or public.is_admin());
create policy "Read own sale items or admin" on public.sale_items for select to authenticated using(exists(select 1 from public.sales where sales.id=sale_id and (cashier_id=auth.uid() or public.is_admin())));
create policy "Admin read audit" on public.audit_events for select to authenticated using(public.is_admin());
-- Direct sale/audit writes intentionally denied. Add an authenticated transactional
-- checkout RPC that locks stock rows, calculates prices server-side and writes audit.
-- Provision the first admin through a trusted database administrator, never the client.
