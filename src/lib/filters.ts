import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// Document filter types, URL serialization, and query builder
// ============================================================

export type SortOption = "captured_at" | "created_at" | "tag";
export type ViewOption = "grid" | "timeline" | "map";

export interface DocumentFilters {
  tags: string[];
  from: string | null; // ISO date "2025-01-01"
  to: string | null;
  blueprintId: string | null;
  pinId: string | null;
  sort: SortOption;
  view: ViewOption;
}

export const DEFAULT_FILTERS: DocumentFilters = {
  tags: [],
  from: null,
  to: null,
  blueprintId: null,
  pinId: null,
  sort: "captured_at",
  view: "grid",
};

const VALID_SORTS: SortOption[] = ["captured_at", "created_at", "tag"];
const VALID_VIEWS: ViewOption[] = ["grid", "timeline", "map"];

// ----- URL Serialization -----

export function parseFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): DocumentFilters {
  const raw = (key: string): string | undefined => {
    const val = searchParams[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const tagsRaw = raw("tags");
  const tags = tagsRaw ? tagsRaw.split(",").filter(Boolean) : [];

  const from = raw("from") ?? null;
  const to = raw("to") ?? null;
  const blueprintId = raw("blueprint") ?? null;
  const pinId = raw("pin") ?? null;

  const sortRaw = raw("sort") as SortOption | undefined;
  const sort = sortRaw && VALID_SORTS.includes(sortRaw) ? sortRaw : DEFAULT_FILTERS.sort;

  const viewRaw = raw("view") as ViewOption | undefined;
  const view = viewRaw && VALID_VIEWS.includes(viewRaw) ? viewRaw : DEFAULT_FILTERS.view;

  return { tags, from, to, blueprintId, pinId, sort, view };
}

export function serializeFiltersToSearchParams(
  filters: DocumentFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.blueprintId) params.set("blueprint", filters.blueprintId);
  if (filters.pinId) params.set("pin", filters.pinId);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.view !== DEFAULT_FILTERS.view) params.set("view", filters.view);

  return params;
}

export function hasActiveFilters(filters: DocumentFilters): boolean {
  return (
    filters.tags.length > 0 ||
    filters.from !== null ||
    filters.to !== null ||
    filters.blueprintId !== null ||
    filters.pinId !== null
  );
}

export function countActiveFilters(filters: DocumentFilters): number {
  return [
    filters.tags.length > 0,
    filters.from !== null || filters.to !== null,
    filters.blueprintId !== null,
    filters.pinId !== null,
  ].filter(Boolean).length;
}

// ----- Supabase Query Builder -----

export async function fetchFilteredDocuments(
  supabase: SupabaseClient,
  projectId: string,
  filters: DocumentFilters
) {
  // Step 1: If tag filter active, get matching document IDs
  let tagFilteredDocIds: string[] | null = null;
  if (filters.tags.length > 0) {
    const { data: docTags } = await supabase
      .from("document_tags")
      .select("document_id")
      .in("tag_id", filters.tags);

    tagFilteredDocIds = [...new Set((docTags ?? []).map((dt) => dt.document_id))];
    if (tagFilteredDocIds.length === 0) {
      return []; // No documents match the tag filter
    }
  }

  // Step 2: If blueprint filter, get pin IDs for that blueprint
  let blueprintPinIds: string[] | null = null;
  if (filters.blueprintId) {
    const { data: pins } = await supabase
      .from("pins")
      .select("id")
      .eq("blueprint_id", filters.blueprintId);

    blueprintPinIds = (pins ?? []).map((p) => p.id);
    if (blueprintPinIds.length === 0) {
      return []; // No pins on this blueprint
    }
  }

  // Step 3: Build main query
  let query = supabase
    .from("documents")
    .select("*, document_tags(tags(*))")
    .eq("project_id", projectId);

  if (tagFilteredDocIds) {
    query = query.in("id", tagFilteredDocIds);
  }

  if (filters.pinId) {
    query = query.eq("pin_id", filters.pinId);
  } else if (blueprintPinIds) {
    query = query.in("pin_id", blueprintPinIds);
  }

  // Date range filtering — use captured_at, fallback to created_at
  if (filters.from) {
    query = query.or(
      `captured_at.gte.${filters.from},and(captured_at.is.null,created_at.gte.${filters.from})`
    );
  }
  if (filters.to) {
    // Add one day to make "to" inclusive
    const toDate = new Date(filters.to);
    toDate.setDate(toDate.getDate() + 1);
    const toStr = toDate.toISOString().split("T")[0];
    query = query.or(
      `captured_at.lt.${toStr},and(captured_at.is.null,created_at.lt.${toStr})`
    );
  }

  // Sort
  const sortCol = filters.sort === "tag" ? "created_at" : filters.sort;
  query = query.order(sortCol, { ascending: false, nullsFirst: false });

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
