-- ============================================================
-- Archimas: Construction Documentation Platform
-- Initial Schema Migration
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================================
-- PROJECTS
-- ============================================================
create table public.projects (
  id            uuid primary key default extensions.uuid_generate_v4(),
  name          text not null,
  description   text,
  address       text,
  status        text not null default 'active'
                  check (status in ('active', 'archived', 'completed')),
  cover_url     text,
  -- Future auth:
  -- owner_id   uuid references auth.users(id) on delete set null,
  -- org_id     uuid references public.organizations(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- BLUEPRINTS
-- ============================================================
create table public.blueprints (
  id            uuid primary key default extensions.uuid_generate_v4(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  name          text not null,
  description   text,
  file_path     text not null,
  file_name     text not null,
  file_size     bigint,
  mime_type     text,
  width         integer,
  height        integer,
  floor         text,
  sort_order    integer not null default 0,
  -- Future auth:
  -- uploaded_by uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_blueprints_project_id on public.blueprints(project_id);

-- ============================================================
-- PINS
-- ============================================================
create table public.pins (
  id            uuid primary key default extensions.uuid_generate_v4(),
  blueprint_id  uuid not null references public.blueprints(id) on delete cascade,
  label         text,
  description   text,
  x             double precision not null,
  y             double precision not null,
  pin_type      text not null default 'note'
                  check (pin_type in ('note', 'issue', 'photo', 'measurement', 'safety')),
  status        text not null default 'open'
                  check (status in ('open', 'in_progress', 'resolved', 'closed')),
  color         text,
  -- Future auth:
  -- created_by uuid references auth.users(id),
  -- assigned_to uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_pins_blueprint_id on public.pins(blueprint_id);

-- ============================================================
-- DOCUMENTS (photos, videos, files attached to pins)
-- ============================================================
create table public.documents (
  id            uuid primary key default extensions.uuid_generate_v4(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  pin_id        uuid references public.pins(id) on delete set null,
  name          text not null,
  description   text,
  file_path     text not null,
  file_name     text not null,
  file_size     bigint,
  mime_type     text,
  -- Future auth:
  -- uploaded_by uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_documents_project_id on public.documents(project_id);
create index idx_documents_pin_id on public.documents(pin_id);

-- ============================================================
-- TAGS
-- ============================================================
create table public.tags (
  id            uuid primary key default extensions.uuid_generate_v4(),
  name          text not null unique,
  color         text,
  is_system     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- DOCUMENT_TAGS (many-to-many)
-- ============================================================
create table public.document_tags (
  document_id   uuid not null references public.documents(id) on delete cascade,
  tag_id        uuid not null references public.tags(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (document_id, tag_id)
);

create index idx_document_tags_tag_id on public.document_tags(tag_id);

-- ============================================================
-- PIN_TAGS (many-to-many)
-- ============================================================
create table public.pin_tags (
  pin_id        uuid not null references public.pins(id) on delete cascade,
  tag_id        uuid not null references public.tags(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (pin_id, tag_id)
);

create index idx_pin_tags_tag_id on public.pin_tags(tag_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.blueprints
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.pins
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.documents
  for each row execute function public.handle_updated_at();

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('blueprints', 'blueprints', true),
  ('documents', 'documents', true);

-- Permissive storage policies (no auth for now)
create policy "Allow all uploads to blueprints"
  on storage.objects for insert
  with check (bucket_id = 'blueprints');

create policy "Allow all reads from blueprints"
  on storage.objects for select
  using (bucket_id = 'blueprints');

create policy "Allow all deletes from blueprints"
  on storage.objects for delete
  using (bucket_id = 'blueprints');

create policy "Allow all updates to blueprints"
  on storage.objects for update
  using (bucket_id = 'blueprints');

create policy "Allow all uploads to documents"
  on storage.objects for insert
  with check (bucket_id = 'documents');

create policy "Allow all reads from documents"
  on storage.objects for select
  using (bucket_id = 'documents');

create policy "Allow all deletes from documents"
  on storage.objects for delete
  using (bucket_id = 'documents');

create policy "Allow all updates to documents"
  on storage.objects for update
  using (bucket_id = 'documents');
