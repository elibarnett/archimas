import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectSettingsForm } from "@/components/project-settings-form";
import { DeleteProjectButton } from "@/components/delete-project-button";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Project Settings",
};

export default async function ProjectSettingsPage({
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
      <PageHeader title="Project Settings" />
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectSettingsForm project={project} />
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Permanently delete this project and all associated data including
                blueprints, pins, and documents.
              </p>
              <DeleteProjectButton
                projectId={projectId}
                projectName={project.name}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
