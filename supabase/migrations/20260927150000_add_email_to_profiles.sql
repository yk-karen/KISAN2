-- ============================================================
-- KISAN: Add email column to profiles and update handle_new_user
-- Migration: 20260927150000_add_email_to_profiles.sql
-- ============================================================

alter table public.profiles
add column if not exists email text;

create index if not exists profiles_email_idx on public.profiles(email);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    selected_role text;
    user_email text;
begin
    selected_role := coalesce(
        new.raw_user_meta_data->>'role',
        'farmer'
    );

    if selected_role not in (
        'farmer',
        'tool_lender',
        'job_seeker',
        'storage_owner'
    ) then
        selected_role := 'farmer';
    end if;

    user_email := coalesce(
        new.email,
        new.raw_user_meta_data->>'email'
    );

    insert into public.profiles (
        id,
        full_name,
        email,
        phone,
        role,
        language,
        metadata
    )
    values (
        new.id,
        coalesce(
            nullif(new.raw_user_meta_data->>'full_name', ''),
            nullif(split_part(coalesce(user_email, ''), '@', 1), ''),
            nullif(new.phone, ''),
            'User'
        ),
        user_email,
        coalesce(
            nullif(new.phone, ''),
            new.raw_user_meta_data->>'phone'
        ),
        selected_role,
        coalesce(
            nullif(new.raw_user_meta_data->>'language', ''),
            'en'
        ),
        coalesce(
            new.raw_user_meta_data,
            '{}'::jsonb
        )
    )
    on conflict (id) do update set
        full_name = excluded.full_name,
        email = coalesce(excluded.email, public.profiles.email),
        phone = coalesce(excluded.phone, public.profiles.phone),
        metadata = public.profiles.metadata || excluded.metadata;

    return new;
end;
$$;
