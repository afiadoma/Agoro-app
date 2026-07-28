-- Run this in the Supabase SQL editor for an existing project that predates
-- browser push notifications for thread replies. Safe to re-run (idempotent).

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique (thread_id, endpoint)
);

alter table push_subscriptions enable row level security;

drop policy if exists "public insert push subscriptions" on push_subscriptions;
create policy "public insert push subscriptions" on push_subscriptions for insert with check (true);

drop policy if exists "public update push subscriptions" on push_subscriptions;
create policy "public update push subscriptions" on push_subscriptions for update using (true) with check (true);

grant insert, update on push_subscriptions to anon, authenticated;
