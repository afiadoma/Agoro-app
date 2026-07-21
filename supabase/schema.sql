-- Run this in the Supabase SQL editor for your new project (one time setup)

create table listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('baker','caterer','supplier')),
  area text not null,
  price text not null,
  overflow boolean default false,
  verified boolean default true,
  blurb text not null,
  photos text[] default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table threads (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

create table replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  author text not null,
  text text not null,
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
  photos text[] default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
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

-- Row Level Security: open read/write for now since sign-up is limited to
-- your existing group and you're manually reviewing reports. Tighten this
-- (e.g. require auth) before opening the app beyond the trusted group.
alter table listings enable row level security;
alter table threads enable row level security;
alter table replies enable row level security;
alter table tools enable row level security;
alter table prices enable row level security;
alter table reports enable row level security;

create policy "public read approved listings" on listings for select using (status = 'approved');
create policy "public insert listings" on listings for insert with check (true);
create policy "public read approved threads" on threads for select using (status = 'approved');
create policy "public insert threads" on threads for insert with check (true);
create policy "public read approved replies" on replies for select using (status = 'approved');
create policy "public insert replies" on replies for insert with check (true);
create policy "public read approved tools" on tools for select using (status = 'approved');
create policy "public insert tools" on tools for insert with check (true);
create policy "public read approved prices" on prices for select using (status = 'approved');
create policy "public insert prices" on prices for insert with check (true);
create policy "public insert reports" on reports for insert with check (true);

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
