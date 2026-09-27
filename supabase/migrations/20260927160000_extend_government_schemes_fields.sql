-- ============================================================
-- KISAN: Government Welfare Schemes Extension
-- Migration: 20260927160000_extend_government_schemes_fields.sql
-- ============================================================

-- Extend public.government_schemes with authoritative tracking, application, and freshness fields
alter table public.government_schemes
  add column if not exists official_apply_url text,
  add column if not exists application_method text,
  add column if not exists application_deadline date,
  add column if not exists source_updated_at timestamptz,
  add column if not exists verification_status text not null default 'unverified';

-- Add check constraint for verification_status to ensure valid status transitions
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'government_schemes_verification_status_check'
  ) then
    alter table public.government_schemes
      add constraint government_schemes_verification_status_check
      check (verification_status in ('unverified', 'verified', 'stale'));
  end if;
end $$;

-- Index for verification status and source freshness
create index if not exists government_schemes_verification_idx
  on public.government_schemes(verification_status, source_checked_at);
