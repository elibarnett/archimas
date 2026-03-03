import { Map, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { BlueprintCard } from "@/components/blueprint-card";
import { UploadBlueprintDialog } from "@/components/upload-blueprint-dialog";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Blueprints",
};

export default async function BlueprintsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: blueprints } = await supabase
    .from("blueprints")
    .select("*, pins(count)")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  return (
    <>
      <PageHeader title="Blueprints">
        <UploadBlueprintDialog projectId={projectId}>
          <Button size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </UploadBlueprintDialog>
      </PageHeader>
      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        {blueprints && blueprints.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Map}
            title="No blueprints yet"
            description="Upload your first blueprint to start placing pins and documenting progress."
          >
            <UploadBlueprintDialog projectId={projectId}>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Blueprint
              </Button>
            </UploadBlueprintDialog>
          </EmptyState>
        )}
      </div>
    </>
  );
}
