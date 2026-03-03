-- Add 'planning' to project status enum
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
  check (status in ('planning', 'active', 'completed', 'archived'));
