import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <>
      <PageHeader title="Projects">
        <Button size="sm">New Project</Button>
      </PageHeader>
      <div className="flex flex-1 flex-col p-4">
        {projects && projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <h3 className="font-medium group-hover:text-primary">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {project.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start documenting your construction sites."
          >
            <Button>Create Project</Button>
          </EmptyState>
        )}
      </div>
    </>
  );
}
