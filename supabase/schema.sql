-- Run this in the Supabase SQL editor for your new project (one time setup)
--
-- If your project already exists and predates the `edit_pin` / `whatsapp`
-- columns below, run this migration instead of the full script:
--   alter table listings add column if not exists whatsapp text;
--   alter table listings add column if not exists edit_pin text;
--   alter table tools add column if not exists whatsapp text;
--   alter table tools add column if not exists edit_pin text;
--
-- If your project predates `faq` / `contact_click_count` / the `reviews`
-- table, see migrations/reviews_faq_analytics.sql for the migration to run
-- instead of the full script.
--
-- If your project predates the `push_subscriptions` table (browser push
-- notifications for thread replies), see
-- migrations/push_notifications.sql for the migration to run instead of
-- the full script.
--
-- If your project predates `photos` on threads, see
-- migrations/thread_photos.sql for the migration to run instead of the
-- full script.
--
-- If your project predates `photos` on replies, see
-- migrations/reply_photos.sql for the migration to run instead of the
-- full script.

create table listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('baker','caterer','supplier')),
  area text not null,
  price text not null,
  whatsapp text,
  overflow boolean default false,
  verified boolean default true,
  featured boolean default false,
  blurb text not null,
  photos text[] default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  edit_pin text,
  faq text,
  contact_click_count int not null default 0,
  created_at timestamptz default now()
);

-- Single-row table controlling the ad banner at the top of the app.
-- Edit the one row directly in Table Editor to change/remove the ad.
create table ad_banner (
  id int primary key default 1,
  image text,
  link text,
  label text,
  constraint single_row check (id = 1)
);
insert into ad_banner (id, image, link, label) values (1, null, null, null);

create table threads (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  photos text[] default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  author text not null,
  text text not null,
  photos text[] default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table tools (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price text not null,
  location text not null,
  category text not null,
  seller text not null,
  whatsapp text,
  photos text[] default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  edit_pin text,
  faq text,
  contact_click_count int not null default 0,
  created_at timestamptz default now()
);

create table prices (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  price text not null,
  store text,
  reporter text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid, -- id of the reported item; can point to either listings.id or tools.id, not FK-constrained on purpose
  created_at timestamptz default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null, -- id of the reviewed item; can point to either listings.id or tools.id, not FK-constrained on purpose (same pattern as reports)
  kind text not null check (kind in ('listing','tool')),
  reviewer text not null,
  rating int not null check (rating between 1 and 5),
  text text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- Browser push subscriptions for "notify me about replies" on a thread.
-- Deliberately no public read policy — the endpoint/keys let anyone push a
-- notification to that subscriber, so only the server (via the service
-- role key in the /api/notify-reply route) reads this table.
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  unique (thread_id, endpoint)
);

-- Row Level Security: open read/write for now since sign-up is limited to
-- your existing group and you're manually reviewing reports. Tighten this
-- (e.g. require auth) before opening the app beyond the trusted group.
alter table listings enable row level security;
alter table threads enable row level security;
alter table replies enable row level security;
alter table tools enable row level security;
alter table prices enable row level security;
alter table reports enable row level security;
alter table reviews enable row level security;
alter table push_subscriptions enable row level security;

-- Read policies are open (not just approved) so the "manage my listing" flow can
-- look up a person's own pending/rejected rows by WhatsApp number. The app itself
-- filters to status='approved' for the public directory/forum/tools views.
create policy "public read listings" on listings for select using (true);
create policy "public insert listings" on listings for insert with check (true);
create policy "public update listings" on listings for update using (true) with check (true);
create policy "public read threads" on threads for select using (true);
create policy "public insert threads" on threads for insert with check (true);
create policy "public read replies" on replies for select using (true);
create policy "public insert replies" on replies for insert with check (true);
create policy "public read tools" on tools for select using (true);
create policy "public insert tools" on tools for insert with check (true);
create policy "public update tools" on tools for update using (true) with check (true);
create policy "public read prices" on prices for select using (true);
create policy "public insert prices" on prices for insert with check (true);

alter table ad_banner enable row level security;
create policy "public read ad banner" on ad_banner for select using (true);
-- No public insert/update policy on purpose — you edit the single row yourself
-- in Table Editor, which uses your Supabase login and bypasses RLS.
create policy "public insert reports" on reports for insert with check (true);

-- Reviews follow the same open+moderated pattern as prices/threads: anyone can
-- read (so pending counts don't leak into the public average) and insert;
-- only approved reviews are shown/counted client-side.
create policy "public read reviews" on reviews for select using (true);
create policy "public insert reviews" on reviews for insert with check (true);

-- Explicit grants alongside the policies above — a policy alone isn't enough
-- if the underlying table grant is missing (see the insert/update debugging
-- history for listings/tools; don't skip this step again).
grant select, insert on reviews to anon, authenticated;
grant update (contact_click_count) on listings to anon, authenticated;
grant update (contact_click_count) on tools to anon, authenticated;

-- Insert/update (for the upsert-on-resubscribe path) but no select grant for
-- anon on purpose — see the comment on the table definition above.
create policy "public insert push subscriptions" on push_subscriptions for insert with check (true);
create policy "public update push subscriptions" on push_subscriptions for update using (true) with check (true);
grant insert, update on push_subscriptions to anon, authenticated;

-- Atomic click-counter increment, callable without needing a broad update
-- grant on the whole row — security definer bypasses RLS for just this one
-- narrow operation (increment a counter by table+id, nothing else).
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

-- Storage bucket for listing photos. Run this too, then in
-- Supabase → Storage, confirm the "listing-photos" bucket is set to Public
-- (or run the two storage policies below).
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "public read listing photos" on storage.objects for select using (bucket_id = 'listing-photos');
create policy "public upload listing photos" on storage.objects for insert with check (bucket_id = 'listing-photos');

-- Seed data so the app isn't empty on first load (marked pre-approved)
insert into listings (name, type, area, price, overflow, verified, blurb, photos, status, created_at) values
('Ama''s Buttercream Bar', 'baker', 'East Legon, Accra', 'GH₵150–800', true, true, 'Custom celebration cakes, ribbon icing, fondant work.', '{}', 'approved', '2026-06-02'),
('Osu Chop House Catering', 'caterer', 'Osu, Accra', 'GH₵40/head+', false, true, 'Full-service event catering — jollof, grilled tilapia, chin chin platters.', '{}', 'approved', '2026-06-04'),
('Kente Cake Box Co.', 'supplier', 'Dansoman, Accra', 'GH₵5–25/box', false, true, 'Cake boxes, ribbon, food coloring gel, cake boards.', '{}', 'approved', '2026-06-10'),
('Nana''s Naked Cakes', 'baker', 'Tema', 'GH₵200–600', true, false, 'Semi-naked cakes, cupcakes, small-batch orders welcome.', '{}', 'approved', '2026-07-01'),
('Golden Grain Flour Supply', 'supplier', 'Kumasi', 'Wholesale', false, true, 'Bulk flour, sugar, cocoa — deliveries across Ashanti region.', '{}', 'approved', '2026-06-20'),
('Efua''s Small Chops', 'caterer', 'Dansoman, Accra', 'GH₵25/head+', true, false, 'Spring rolls, samosas, meat pies — takes overflow orders from other vendors.', '{}', 'approved', '2026-07-08');

insert into tools (title, description, price, location, category, seller, photos, status, created_at) values
('6-Tier Cake Stand (adjustable height)', 'Barely used, adjustable turntable stand, great for wedding displays.', 'GH₵350', 'East Legon, Accra', 'Decorating Tools', 'Ama', '{}', 'approved', '2026-07-14'),
('KitchenAid Stand Mixer, 5L', 'Used for 2 years, still strong motor, comes with whisk and dough hook.', 'GH₵2,200', 'Tema', 'Mixers', 'Nana', '{}', 'approved', '2026-07-10'),
('Set of 12 Silicone Cake Pans', 'Assorted round and square sizes, non-stick, minor wear.', 'GH₵180', 'Dansoman, Accra', 'Pans & Molds', 'Efua', '{}', 'approved', '2026-07-08'),
('Gas Deck Oven (double)', 'Selling as I''m upgrading — reliable, even bake, buyer arranges pickup.', 'GH₵4,500', 'Kumasi', 'Ovens & Ranges', 'Golden Grain Bakery', '{}', 'approved', '2026-07-01');

insert into prices (item, price, store, reporter, status, created_at) values
('Walmart Jasmine Rice, 20lb', 'GH₵95', 'Palace Mall, Accra', 'Adjoa', 'approved', '2026-07-16'),
('Gel Food Coloring (Wilton set)', 'GH₵60', 'Makola Market', 'Kwame', 'approved', '2026-07-15'),
('Baking Flour, 50kg bag', 'GH₵410', 'Kaneshie Market', 'Nana', 'approved', '2026-07-13'),
('Butter, 1kg block', 'GH₵75', 'Shoprite, Accra Mall', 'Efua', 'approved', '2026-07-11');
