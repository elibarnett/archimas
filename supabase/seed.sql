-- ============================================================
-- System Tags
-- ============================================================
insert into public.tags (name, color, is_system) values
  ('Electrical',    '#3b82f6', true),   -- blue
  ('Plumbing',      '#22c55e', true),   -- green
  ('HVAC',          '#f59e0b', true),   -- amber
  ('Structural',    '#ef4444', true),   -- red
  ('Finishing',     '#a855f7', true),   -- purple
  ('Insulation',    '#ec4899', true),   -- pink
  ('Fire Safety',   '#f97316', true),   -- orange
  ('Architectural', '#06b6d4', true),   -- cyan
  ('Landscape',     '#16a34a', true),   -- green-600
  ('Interior',      '#d946ef', true),   -- fuchsia
  ('Site Work',     '#78716c', true),   -- stone
  ('Permit',        '#6366f1', true),   -- indigo
  ('Inspection',    '#0ea5e9', true),   -- sky
  ('Change Order',  '#ea580c', true),   -- orange-600
  ('General',       '#6b7280', true);   -- gray

-- ============================================================
-- Sample Project (for development)
-- ============================================================
insert into public.projects (name, description, address, status) values
  ('Harbor View Residence',
   'New construction — 3-story residential building with underground parking',
   '1234 Harbor View Dr, San Francisco, CA 94107',
   'active');
