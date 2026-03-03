"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { PinType, PinUpdate } from "@/types/database";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createPin(
  blueprintId: string,
  data: {
    x: number;
    y: number;
    pin_type: PinType;
    label?: string | null;
    description?: string | null;
  }
): Promise<ActionResult<{ id: string }>> {
  if (data.x < 0 || data.x > 1 || data.y < 0 || data.y > 1) {
    return { success: false, error: "Pin position must be within the blueprint." };
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

  const { data: pin, error } = await supabase
    .from("pins")
    .insert({
      blueprint_id: blueprintId,
      x: data.x,
      y: data.y,
      pin_type: data.pin_type,
      label: data.label?.trim() || null,
      description: data.description?.trim() || null,
      status: "open",
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/projects/${blueprint.project_id}/blueprints/${blueprintId}`);
  return { success: true, data: { id: pin.id } };
}

export async function updatePin(
  pinId: string,
  updates: PinUpdate
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { data: pin } = await supabase
    .from("pins")
    .select("blueprint_id, blueprints!inner(project_id)")
    .eq("id", pinId)
    .single();

  if (!pin) {
    return { success: false, error: "Pin not found." };
  }

  const { error } = await supabase
    .from("pins")
    .update(updates)
    .eq("id", pinId);

  if (error) {
    return { success: false, error: error.message };
  }

  const project = Array.isArray(pin.blueprints) ? pin.blueprints[0] : pin.blueprints;
  revalidatePath(`/projects/${project.project_id}/blueprints/${pin.blueprint_id}`);
  return { success: true, data: undefined };
}

export async function updatePinPosition(
  pinId: string,
  x: number,
  y: number
): Promise<ActionResult<void>> {
  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return { success: false, error: "Pin position must be within the blueprint." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("pins")
    .update({ x, y })
    .eq("id", pinId);

  if (error) {
    return { success: false, error: error.message };
  }

  // No revalidation needed for position-only updates (client already shows the change)
  return { success: true, data: undefined };
}

export async function deletePin(
  pinId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  // Get pin with blueprint info for revalidation
  const { data: pin } = await supabase
    .from("pins")
    .select("blueprint_id, blueprints!inner(project_id)")
    .eq("id", pinId)
    .single();

  if (!pin) {
    return { success: false, error: "Pin not found." };
  }

  // Delete associated document files from storage
  const { data: docs } = await supabase
    .from("documents")
    .select("file_path, thumbnail_path")
    .eq("pin_id", pinId);

  if (docs && docs.length > 0) {
    const paths = docs.flatMap((d) => [
      d.file_path,
      ...(d.thumbnail_path ? [d.thumbnail_path] : []),
    ]);
    await supabase.storage.from(STORAGE_BUCKETS.DOCUMENTS).remove(paths);
  }

  // Delete pin (cascade handles documents and pin_tags in DB)
  const { error } = await supabase
    .from("pins")
    .delete()
    .eq("id", pinId);

  if (error) {
    return { success: false, error: error.message };
  }

  const project = Array.isArray(pin.blueprints) ? pin.blueprints[0] : pin.blueprints;
  revalidatePath(`/projects/${project.project_id}/blueprints/${pin.blueprint_id}`);
  return { success: true, data: undefined };
}
