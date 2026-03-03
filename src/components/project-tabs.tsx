"use client";

import { useState } from "react";
import { FolderKanban } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { EmptyState } from "@/components/empty-state";
import { getSupabaseFileUrl } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { ProjectStatus } from "@/types/database";

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  status: ProjectStatus;
  cover_url: string | null;
  updated_at: string;
  blueprints?: { file_path: string; mime_type: string | null }[];
}

interface ProjectTabsProps {
  projects: ProjectData[];
}

const TABS = [
  { key: "active", label: "Active Projects", statuses: ["active"] },
  { key: "drafts", label: "Drafts", statuses: ["planning"] },
  { key: "archived", label: "Archived", statuses: ["archived", "completed"] },
] as const;

export function ProjectTabs({ projects }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("active");

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const filtered = projects.filter((p) =>
    (currentTab.statuses as readonly string[]).includes(p.status)
  );
  const activeCount = projects.filter((p) => p.status === "active").length;

  return (
    <>
      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Section heading */}
      <div className="px-4 pt-5 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Project Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You have {activeCount} active construction site
          {activeCount !== 1 ? "s" : ""} today.
        </p>
      </div>

      {/* Project list */}
      <div className="grid gap-4 px-4 pb-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.length > 0 ? (
          filtered.map((project) => {
            const firstImageBp = project.blueprints?.find((bp) =>
              bp.mime_type?.startsWith("image/")
            );
            const effectiveCoverUrl =
              project.cover_url ??
              (firstImageBp
                ? getSupabaseFileUrl(
                    STORAGE_BUCKETS.BLUEPRINTS,
                    firstImageBp.file_path
                  )
                : null);

            return (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                address={project.address}
                status={project.status as ProjectStatus}
                cover_url={effectiveCoverUrl}
                updated_at={project.updated_at}
                pinCount={0}
              />
            );
          })
        ) : (
          <EmptyState
            icon={FolderKanban}
            title={`No ${currentTab.label.toLowerCase()}`}
            description={
              activeTab === "active"
                ? "Create your first project to start documenting construction sites."
                : activeTab === "drafts"
                  ? "Projects in planning stage will appear here."
                  : "Archived and completed projects will appear here."
            }
          />
        )}
      </div>
    </>
  );
}
