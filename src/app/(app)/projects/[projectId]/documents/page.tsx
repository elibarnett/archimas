import { FileImage } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export const metadata = {
  title: "Documents",
};

export default function DocumentsPage() {
  return (
    <>
      <PageHeader title="Documents" />
      <div className="flex flex-1 flex-col p-4">
        <EmptyState
          icon={FileImage}
          title="No documents yet"
          description="Documents will appear here once you start adding photos and videos to pins on your blueprints."
        />
      </div>
    </>
  );
}
