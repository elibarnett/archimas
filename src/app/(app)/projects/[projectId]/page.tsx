import { notFound } from "next/navigation";
import Link from "next/link";
import { Map, FileImage, Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

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
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) {
    notFound();
  }

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
      <div className="flex flex-1 flex-col p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href={`/projects/${projectId}/blueprints`}
            className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <Map className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-medium">Blueprints</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload and manage project blueprints
            </p>
          </Link>

          <Link
            href={`/projects/${projectId}/documents`}
            className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
          >
            <FileImage className="h-8 w-8 text-primary" />
            <h3 className="mt-3 font-medium">Documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse all photos and videos
            </p>
          </Link>
        </div>

        {project.description && (
          <div className="mt-6 rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
