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
-- Sample Projects (for development)
-- ============================================================
insert into public.projects (name, description, address, status) values
  ('Skyline Apartments',
   'New construction — 12-story luxury apartment complex with rooftop amenities and underground parking. Phase 2 of 3 currently in progress.',
   '123 Urban Ave, Downtown',
   'active'),
  ('Westside Medical Center',
   'Major renovation of the radiology wing including new MRI suite, patient rooms, and nurse stations. Structural reinforcement required for equipment.',
   '45 Health Blvd, West District',
   'active'),
  ('The Grand Library',
   'Historic building restoration and modernization. Adding new reading halls, digital archives, and accessible entrances while preserving original facade.',
   'Civic Plaza 1, North Side',
   'planning'),
  ('Riverside Office Tower',
   'Completed 8-story commercial office building with LEED Gold certification. Final punch list items resolved.',
   '900 River Rd, East Bank',
   'completed');
