import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { DocumentBrowserShell } from "@/components/documents/document-browser-shell";
import { parseFiltersFromSearchParams, fetchFilteredDocuments } from "@/lib/filters";
import type { DocumentWithTags, Tag } from "@/types/database";

export const metadata = {
  title: "Documents",
};

export default async function DocumentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { projectId } = await params;
  const rawParams = await searchParams;
  const filters = parseFiltersFromSearchParams(rawParams);

  const supabase = await createClient();

  const [rawDocs, tagsRes, blueprintsRes] = await Promise.all([
    fetchFilteredDocuments(supabase, projectId, filters),
    supabase.from("tags").select("*").order("name"),
    supabase
      .from("blueprints")
      .select("id, name, floor")
      .eq("project_id", projectId)
      .order("sort_order"),
  ]);

  // Flatten document_tags(tags(*)) join
  const documents: DocumentWithTags[] = rawDocs.map(
    (doc: Record<string, unknown>) => {
      const docTags =
        (doc.document_tags as { tags: Tag }[] | undefined) ?? [];
      const { document_tags: _, ...docData } = doc;
      return {
        ...docData,
        tags: docTags.map((dt) => dt.tags),
      } as DocumentWithTags;
    }
  );

  return (
    <>
      <PageHeader title="Documents" />
      <Suspense>
        <DocumentBrowserShell
          documents={documents}
          tags={tagsRes.data ?? []}
          blueprints={blueprintsRes.data ?? []}
          projectId={projectId}
          initialFilters={filters}
        />
      </Suspense>
    </>
  );
}
