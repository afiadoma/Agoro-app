-- Run this in the Supabase SQL editor for an existing project that predates
-- photos on threads. Safe to re-run (idempotent).

alter table threads add column if not exists photos text[] default '{}';
