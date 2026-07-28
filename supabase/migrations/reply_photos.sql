-- Run this in the Supabase SQL editor for an existing project that predates
-- photos on replies. Safe to re-run (idempotent).

alter table replies add column if not exists photos text[] default '{}';
