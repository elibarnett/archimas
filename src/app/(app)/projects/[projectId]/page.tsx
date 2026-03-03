import { notFound } from "next/navigation";
import Link from "next/link";
import { Map, Pin, FileImage, Settings, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { BlueprintCard } from "@/components/blueprint-card";
import { UploadBlueprintDialog } from "@/components/upload-blueprint-dialog";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_STATUS_CONFIG } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  return { title: project?.name ?? "Project" };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const [projectRes, blueprintsRes, pinCountRes, docCountRes] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).single(),
      supabase
        .from("blueprints")
        .select("*, pins(count)")
        .eq("project_id", projectId)
        .order("sort_order")
        .limit(6),
      supabase
        .from("pins")
        .select("*", { count: "exact", head: true })
        .in(
          "blueprint_id",
          (
            await supabase
              .from("blueprints")
              .select("id")
              .eq("project_id", projectId)
          ).data?.map((b) => b.id) ?? []
        ),
      supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId),
    ]);

  const project = projectRes.data;
  if (!project) notFound();

  const blueprints = blueprintsRes.data ?? [];
  const statusConfig =
    PROJECT_STATUS_CONFIG[project.status as keyof typeof PROJECT_STATUS_CONFIG] ?? PROJECT_STATUS_CONFIG.active;

  return (
    <>
      <PageHeader title={project.name} description={project.address ?? undefined}>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/projects/${projectId}/settings`}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </PageHeader>
      <div className="flex flex-1 flex-col overflow-y-auto p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Map} label="Blueprints" value={blueprints.length} />
          <StatCard icon={Pin} label="Pins" value={pinCountRes.count ?? 0} />
          <StatCard
            icon={FileImage}
            label="Documents"
            value={docCountRes.count ?? 0}
          />
        </div>

        {/* Status + Description */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span
                className="rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                style={{
                  color: statusConfig.color,
                  backgroundColor: statusConfig.bg,
                }}
              >
                {statusConfig.label}
              </span>
              <span className="text-xs text-muted-foreground">
                Updated {getRelativeTime(project.updated_at)}
              </span>
            </div>
            {project.description && (
              <p className="mt-3 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Blueprints Section */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Blueprints</h2>
            {blueprints.length > 0 && (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/projects/${projectId}/blueprints`}>
                  View All
                </Link>
              </Button>
            )}
          </div>
          {blueprints.length > 0 ? (
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
              {blueprints.map((bp) => (
                <BlueprintCard
                  key={bp.id}
                  id={bp.id}
                  projectId={projectId}
                  name={bp.name}
                  floor={bp.floor}
                  file_path={bp.file_path}
                  file_size={bp.file_size}
                  mime_type={bp.mime_type}
                  pinCount={
                    Array.isArray(bp.pins)
                      ? bp.pins.length
                      : (bp.pins as unknown as { count: number })?.count ?? 0
                  }
                  compact
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Map}
              title="No blueprints yet"
              description="Upload your first blueprint to get started."
            >
              <UploadBlueprintDialog projectId={projectId}>
                <Button size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Blueprint
                </Button>
              </UploadBlueprintDialog>
            </EmptyState>
          )}
        </section>
      </div>
    </>
  );
}
