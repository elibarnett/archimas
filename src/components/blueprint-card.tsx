import Link from "next/link";
import { FileText, Map } from "lucide-react";
import { formatFileSize, getSupabaseFileUrl } from "@/lib/utils";
import { STORAGE_BUCKETS } from "@/lib/constants";

interface BlueprintCardProps {
  id: string;
  projectId: string;
  name: string;
  floor: string | null;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  pinCount?: number;
  compact?: boolean;
}

export function BlueprintCard({
  id,
  projectId,
  name,
  floor,
  file_path,
  file_size,
  mime_type,
  pinCount = 0,
  compact = false,
}: BlueprintCardProps) {
  const isImage = mime_type?.startsWith("image/");
  const thumbnailUrl = isImage
    ? getSupabaseFileUrl(STORAGE_BUCKETS.BLUEPRINTS, file_path)
    : null;

  return (
    <Link
      href={`/projects/${projectId}/blueprints/${id}`}
      className="group block overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/50 transition-shadow hover:shadow-md"
    >
      <div
        className={`w-full overflow-hidden bg-slate-50 ${compact ? "aspect-[4/3]" : "aspect-[4/3]"}`}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {mime_type === "application/pdf" ? (
              <FileText className="h-12 w-12 text-muted-foreground/30" />
            ) : (
              <Map className="h-12 w-12 text-muted-foreground/30" />
            )}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium">{name}</h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {floor && (
            <>
              <span>{floor}</span>
              <span>·</span>
            </>
          )}
          <span>{pinCount} pins</span>
          {file_size && (
            <>
              <span>·</span>
              <span>{formatFileSize(file_size)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
