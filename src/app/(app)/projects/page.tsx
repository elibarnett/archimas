import { Search, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ProjectTabs } from "@/components/project-tabs";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, blueprints(file_path, mime_type)")
    .order("updated_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col min-h-[100dvh]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="-ml-1 hidden md:flex" />
          <span className="text-base font-semibold">Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
          <CreateProjectDialog>
            <Button size="icon" className="h-9 w-9 rounded-full">
              <Plus className="h-4 w-4" />
            </Button>
          </CreateProjectDialog>
        </div>
      </header>

      {/* Tabs + Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        <ProjectTabs projects={projects ?? []} />
      </div>
    </div>
  );
}
