import { notFound } from "next/navigation";
import { BlueprintViewerShell } from "@/components/blueprint-viewer/blueprint-viewer-shell";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string; blueprintId: string }>;
}) {
  const { blueprintId } = await params;
  const supabase = await createClient();
  const { data: blueprint } = await supabase
    .from("blueprints")
    .select("name")
    .eq("id", blueprintId)
    .single();

  return { title: blueprint?.name ?? "Blueprint" };
}

export default async function BlueprintViewerPage({
  params,
}: {
  params: Promise<{ projectId: string; blueprintId: string }>;
}) {
  const { projectId, blueprintId } = await params;
  const supabase = await createClient();

  const [blueprintRes, tagsRes] = await Promise.all([
    supabase
      .from("blueprints")
      .select("id, name, file_path, width, height, floor, updated_at, projects!inner(name)")
      .eq("id", blueprintId)
      .single(),
    supabase.from("tags").select("*").order("name"),
  ]);

  const blueprint = blueprintRes.data;
  if (!blueprint) notFound();

  const project = Array.isArray(blueprint.projects)
    ? blueprint.projects[0]
    : blueprint.projects;

  return (
    <BlueprintViewerShell
      blueprint={{
        id: blueprint.id,
        name: blueprint.name,
        file_path: blueprint.file_path,
        width: blueprint.width,
        height: blueprint.height,
        floor: blueprint.floor,
        updated_at: blueprint.updated_at,
      }}
      project={{ name: project?.name ?? "Project" }}
      projectId={projectId}
      tags={tagsRes.data ?? []}
    />
  );
}
