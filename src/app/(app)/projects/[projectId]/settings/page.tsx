import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Project Settings",
};

export default function ProjectSettingsPage() {
  return (
    <>
      <PageHeader title="Project Settings" />
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          Project settings will be implemented in Phase 2.
        </p>
      </div>
    </>
  );
}
