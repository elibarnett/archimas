"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createBlueprintRecord(
  projectId: string,
  metadata: {
    name: string;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    width: number | null;
    height: number | null;
    floor: string | null;
  }
): Promise<ActionResult<{ id: string }>> {
  if (!metadata.name?.trim()) {
    return { success: false, error: "Blueprint name is required." };
  }

  const supabase = await createClient();

  // Determine sort_order (append to end)
  const { count } = await supabase
    .from("blueprints")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const { data, error } = await supabase
    .from("blueprints")
    .insert({
      project_id: projectId,
      name: metadata.name.trim(),
      file_path: metadata.file_path,
      file_name: metadata.file_name,
      file_size: metadata.file_size,
      mime_type: metadata.mime_type,
      width: metadata.width,
      height: metadata.height,
      floor: metadata.floor,
      sort_order: (count ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/blueprints`);
  return { success: true, data: { id: data.id } };
}

export async function updateBlueprint(
  blueprintId: string,
  formData: FormData
): Promise<ActionResult<void>> {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const floor = (formData.get("floor") as string) || null;

  if (!name?.trim()) {
    return { success: false, error: "Blueprint name is required." };
  }

  const supabase = await createClient();

  // Get project_id for revalidation
  const { data: blueprint } = await supabase
    .from("blueprints")
    .select("project_id")
    .eq("id", blueprintId)
    .single();

  if (!blueprint) {
    return { success: false, error: "Blueprint not found." };
  }

  const { error } = await supabase
    .from("blueprints")
    .update({ name: name.trim(), description, floor })
    .eq("id", blueprintId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/projects/${blueprint.project_id}/blueprints`);
  revalidatePath(
    `/projects/${blueprint.project_id}/blueprints/${blueprintId}`
  );
  return { success: true, data: undefined };
}

export async function deleteBlueprint(
  blueprintId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  // Fetch blueprint for file_path and project_id
  const { data: blueprint } = await supabase
    .from("blueprints")
    .select("project_id, file_path")
    .eq("id", blueprintId)
    .single();

  if (!blueprint) {
    return { success: false, error: "Blueprint not found." };
  }

  // Delete from storage
  await supabase.storage
    .from(STORAGE_BUCKETS.BLUEPRINTS)
    .remove([blueprint.file_path]);

  // Delete from database (cascades to pins)
  const { error } = await supabase
    .from("blueprints")
    .delete()
    .eq("id", blueprintId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/projects/${blueprint.project_id}`);
  revalidatePath(`/projects/${blueprint.project_id}/blueprints`);
  return { success: true, data: undefined };
}
