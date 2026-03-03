// ============================================================
// Archimas Database Types
// Mirror the Supabase schema. Will be replaced by auto-generated
// types from `supabase gen types typescript` once schema stabilizes.
// ============================================================

export type ProjectStatus = "planning" | "active" | "completed" | "archived";
export type PinType = "note" | "issue" | "photo" | "measurement" | "safety";
export type PinStatus = "open" | "in_progress" | "resolved" | "closed";

// ----- Core Entities -----

export interface Project {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  status: ProjectStatus;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Blueprint {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  floor: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Pin {
  id: string;
  blueprint_id: string;
  label: string | null;
  description: string | null;
  x: number; // 0.0 - 1.0 normalized
  y: number; // 0.0 - 1.0 normalized
  pin_type: PinType;
  status: PinStatus;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  pin_id: string | null;
  name: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
  is_system: boolean;
  created_at: string;
}

export interface DocumentTag {
  document_id: string;
  tag_id: string;
  created_at: string;
}

export interface PinTag {
  pin_id: string;
  tag_id: string;
  created_at: string;
}

// ----- Insert Types (omit server-generated fields) -----

export type ProjectInsert = Omit<Project, "id" | "created_at" | "updated_at">;
export type ProjectUpdate = Partial<ProjectInsert>;

export type BlueprintInsert = Omit<
  Blueprint,
  "id" | "created_at" | "updated_at"
>;
export type BlueprintUpdate = Partial<Omit<BlueprintInsert, "project_id">>;

export type PinInsert = Omit<Pin, "id" | "created_at" | "updated_at">;
export type PinUpdate = Partial<Omit<PinInsert, "blueprint_id">>;

export type DocumentInsert = Omit<
  Document,
  "id" | "created_at" | "updated_at"
>;
export type DocumentUpdate = Partial<Omit<DocumentInsert, "project_id">>;

export type TagInsert = Omit<Tag, "id" | "created_at">;
export type TagUpdate = Partial<Omit<TagInsert, "is_system">>;

// ----- Joined / Enriched Types -----

export interface PinWithTags extends Pin {
  tags: Tag[];
}

export interface DocumentWithTags extends Document {
  tags: Tag[];
}

export interface BlueprintWithPins extends Blueprint {
  pins: Pin[];
}

export interface ProjectWithCounts extends Project {
  blueprint_count: number;
  document_count: number;
}
