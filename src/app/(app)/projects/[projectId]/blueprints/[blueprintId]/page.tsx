import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Blueprint Viewer",
};

export default function BlueprintViewerPage() {
  return (
    <>
      <PageHeader title="Blueprint Viewer" />
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Blueprint viewer will be implemented in Phase 3.
        </p>
      </div>
    </>
  );
}
