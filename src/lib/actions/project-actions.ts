"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { ProjectStatus } from "@/types/database";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

const VALID_STATUSES: ProjectStatus[] = [
  "planning",
  "active",
  "completed",
  "archived",
];

export async function createProject(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const address = (formData.get("address") as string) || null;
  const status = (formData.get("status") as string) || "planning";

  if (!name?.trim()) {
    return { success: false, error: "Project name is required." };
  }

  if (!VALID_STATUSES.includes(status as ProjectStatus)) {
    return { success: false, error: "Invalid status." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: name.trim(),
      description,
      address,
      status: status as ProjectStatus,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/projects");
  return { success: true, data: { id: data.id } };
}

export async function updateProject(
  projectId: string,
  formData: FormData
): Promise<ActionResult<void>> {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const address = (formData.get("address") as string) || null;
  const status = (formData.get("status") as string) || "planning";

  if (!name?.trim()) {
    return { success: false, error: "Project name is required." };
  }

  if (!VALID_STATUSES.includes(status as ProjectStatus)) {
    return { success: false, error: "Invalid status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name: name.trim(),
      description,
      address,
      status: status as ProjectStatus,
    })
    .eq("id", projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: undefined };
}

export async function deleteProject(
  projectId: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  // Get all blueprint file paths to clean up storage
  const { data: blueprints } = await supabase
    .from("blueprints")
    .select("file_path")
    .eq("project_id", projectId);

  if (blueprints && blueprints.length > 0) {
    const paths = blueprints.map((b) => b.file_path);
    await supabase.storage.from(STORAGE_BUCKETS.BLUEPRINTS).remove(paths);
  }

  // Delete project — cascades to blueprints, pins, documents
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/projects");
  return { success: true, data: undefined };
}

export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<ActionResult<void>> {
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "Invalid status." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true, data: undefined };
}
