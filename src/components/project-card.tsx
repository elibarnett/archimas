import Link from "next/link";
import { MapPin, Pin, Clock } from "lucide-react";
import { PROJECT_STATUS_CONFIG } from "@/lib/constants";
import type { ProjectStatus } from "@/types/database";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  status: ProjectStatus;
  cover_url: string | null;
  updated_at: string;
  pinCount?: number;
  pinSubLabel?: string;
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ProjectCard({
  id,
  name,
  address,
  status,
  cover_url,
  updated_at,
  pinCount = 0,
  pinSubLabel,
}: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[status] ?? PROJECT_STATUS_CONFIG.active;

  return (
    <Link
      href={`/projects/${id}`}
      className="group block overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/50 transition-shadow hover:shadow-md"
    >
      {/* Cover image */}
      <div className="aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {cover_url ? (
          <img
            src={cover_url}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 via-slate-100 to-primary/10">
            <svg
              className="h-16 w-16 text-primary/15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4M5 21V10.87M19 21V10.87" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight text-foreground">
            {name}
          </h3>
          <span
            className="shrink-0 rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
            style={{
              color: statusConfig.color,
              backgroundColor: statusConfig.bg,
            }}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Address */}
        {address && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{address}</span>
          </div>
        )}

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4 border-t pt-3">
          <div className="flex items-center gap-1.5">
            <Pin className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">
              {pinCount} PINS
            </span>
            {pinSubLabel && (
              <span className="text-[11px] text-muted-foreground">
                {pinSubLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">UPDATED</span>
            <span className="text-[11px] text-muted-foreground">
              {getRelativeTime(updated_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
