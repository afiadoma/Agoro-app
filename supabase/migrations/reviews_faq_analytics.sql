-- Run this in the Supabase SQL editor for an existing project that predates
-- the reviews/FAQ/analytics features. Safe to re-run (idempotent).

alter table listings add column if not exists faq text;
alter table listings add column if not exists contact_click_count int not null default 0;
alter table tools add column if not exists faq text;
alter table tools add column if not exists contact_click_count int not null default 0;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null, -- id of the reviewed item; can point to either listings.id or tools.id, not FK-constrained on purpose (same pattern as reports)
  kind text not null check (kind in ('listing','tool')),
  reviewer text not null,
  rating int not null check (rating between 1 and 5),
  text text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

alter table reviews enable row level security;

drop policy if exists "public read reviews" on reviews;
create policy "public read reviews" on reviews for select using (true);

drop policy if exists "public insert reviews" on reviews;
create policy "public insert reviews" on reviews for insert with check (true);

grant select, insert on reviews to anon, authenticated;
grant update (contact_click_count) on listings to anon, authenticated;
grant update (contact_click_count) on tools to anon, authenticated;

create or replace function increment_contact_click(p_table text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_table = 'listings' then
    update listings set contact_click_count = contact_click_count + 1 where id = p_id;
  elsif p_table = 'tools' then
    update tools set contact_click_count = contact_click_count + 1 where id = p_id;
  end if;
end;
$$;

grant execute on function increment_contact_click(text, uuid) to anon, authenticated;
