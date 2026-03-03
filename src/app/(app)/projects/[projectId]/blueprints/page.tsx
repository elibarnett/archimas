import { Map } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Blueprints",
};

export default function BlueprintsPage() {
  return (
    <>
      <PageHeader title="Blueprints">
        <Button size="sm">Upload Blueprint</Button>
      </PageHeader>
      <div className="flex flex-1 flex-col p-4">
        <EmptyState
          icon={Map}
          title="No blueprints yet"
          description="Upload your first blueprint to start placing pins and documenting progress."
        >
          <Button>Upload Blueprint</Button>
        </EmptyState>
      </div>
    </>
  );
}
