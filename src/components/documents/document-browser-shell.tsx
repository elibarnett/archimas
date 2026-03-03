"use client";

import { useState, Suspense } from "react";
import { Grid3X3, Clock, Map } from "lucide-react";
import { FilterBar } from "./filter-bar";
import { DocumentGridView } from "./document-grid-view";
import { DocumentTimelineView } from "./document-timeline-view";
import { DocumentMapView } from "./document-map-view";
import { DocumentCountBadge } from "./document-count-badge";
import { DocumentPreviewDialog } from "@/components/blueprint-viewer/document-preview-dialog";
import { useFilterSearchParams } from "@/hooks/use-filter-search-params";
import { cn } from "@/lib/utils";
import type { DocumentFilters, ViewOption } from "@/lib/filters";
import type { DocumentWithTags, Tag } from "@/types/database";

interface DocumentBrowserShellProps {
  documents: DocumentWithTags[];
  tags: Tag[];
  blueprints: { id: string; name: string; floor: string | null }[];
  projectId: string;
  initialFilters: DocumentFilters;
}

const VIEW_TABS: { value: ViewOption; label: string; icon: typeof Grid3X3 }[] = [
  { value: "grid", label: "Grid", icon: Grid3X3 },
  { value: "timeline", label: "Timeline", icon: Clock },
  { value: "map", label: "Map", icon: Map },
];

export function DocumentBrowserShell({
  documents,
  tags,
  blueprints,
  projectId,
}: DocumentBrowserShellProps) {
  const { filters, setFilters } = useFilterSearchParams();
  const [previewDoc, setPreviewDoc] = useState<DocumentWithTags | null>(null);

  return (
    <div className="flex flex-1 flex-col">
      <Suspense>
        <FilterBar tags={tags} blueprints={blueprints} />
      </Suspense>

      {/* View tabs + count */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex gap-1">
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = filters.view === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilters({ view: tab.value })}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <DocumentCountBadge count={documents.length} />
      </div>

      {/* Active view */}
      <div className="flex-1 overflow-y-auto p-4">
        {filters.view === "grid" && (
          <DocumentGridView
            documents={documents}
            sort={filters.sort}
            onDocumentTap={setPreviewDoc}
          />
        )}
        {filters.view === "timeline" && (
          <DocumentTimelineView
            documents={documents}
            onDocumentTap={setPreviewDoc}
          />
        )}
        {filters.view === "map" && (
          <DocumentMapView
            blueprints={blueprints}
            projectId={projectId}
            filters={filters}
          />
        )}
      </div>

      {/* Document preview */}
      <DocumentPreviewDialog
        document={previewDoc}
        open={!!previewDoc}
        onOpenChange={(o) => { if (!o) setPreviewDoc(null); }}
        onDeleted={() => setPreviewDoc(null)}
      />
    </div>
  );
}
