"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createDocument(
  pinId: string,
  projectId: string,
  metadata: {
    name: string;
    description: string | null;
    file_path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    thumbnail_path: string | null;
    captured_at: string | null;
  }
): Promise<ActionResult<{ id: string }>> {
  if (!metadata.name?.trim()) {
    return { success: false, error: "Document name is required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      pin_id: pinId,
      project_id: projectId,
      name: metadata.name.trim(),
      description: metadata.description,
      file_path: metadata.file_path,
      file_name: metadata.file_name,
      file_size: metadata.file_size,
      mime_type: metadata.mime_type,
      thumbnail_path: metadata.thumbnail_path,
      captured_at: metadata.captured_at,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Look up the blueprint for revalidation
  const { data: pin } = await supabase
    .from("pins")
    .select("blueprint_id")
    .eq("id", pinId)
    .single();

  if (pin) {
    revalidatePath(`/projects/${projectId}/blueprints/${pin.blueprint_id}`);
  }

  return { success: true, data: { id: data.id } };
}

export async function deleteDocument(
  documentId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path, thumbnail_path, project_id, pin_id")
    .eq("id", documentId)
    .single();

  if (!doc) {
    return { success: false, error: "Document not found." };
  }

  // Delete files from storage
  const paths = [doc.file_path];
  if (doc.thumbnail_path) paths.push(doc.thumbnail_path);
  await supabase.storage.from(STORAGE_BUCKETS.DOCUMENTS).remove(paths);

  // Delete from database
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Revalidate if attached to a pin
  if (doc.pin_id) {
    const { data: pin } = await supabase
      .from("pins")
      .select("blueprint_id")
      .eq("id", doc.pin_id)
      .single();

    if (pin) {
      revalidatePath(
        `/projects/${doc.project_id}/blueprints/${pin.blueprint_id}`
      );
    }
  }

  return { success: true, data: undefined };
}

export async function assignDocumentTags(
  documentId: string,
  tagIds: string[]
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  // Delete existing tags
  await supabase.from("document_tags").delete().eq("document_id", documentId);

  // Insert new tags
  if (tagIds.length > 0) {
    const { error } = await supabase.from("document_tags").insert(
      tagIds.map((tagId) => ({
        document_id: documentId,
        tag_id: tagId,
      }))
    );

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, data: undefined };
}
