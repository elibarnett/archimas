"use client";

import Link from "next/link";
import { ArrowLeft, Search, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRelativeTime } from "@/lib/utils";

interface BlueprintViewerHeaderProps {
  projectId: string;
  projectName: string;
  blueprintName: string;
  floor: string | null;
  updatedAt: string;
}

export function BlueprintViewerHeader({
  projectId,
  projectName,
  blueprintName,
  floor,
  updatedAt,
}: BlueprintViewerHeaderProps) {
  const title = floor
    ? `${projectName}: ${floor}`
    : `${projectName}: ${blueprintName}`;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      <Button variant="ghost" size="icon" className="shrink-0" asChild>
        <Link href={`/projects/${projectId}/blueprints`}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-bold">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">
          {blueprintName} &bull; Updated {getRelativeTime(updatedAt)}
        </p>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0">
        <Search className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="shrink-0">
        <Layers className="h-4 w-4" />
      </Button>
    </header>
  );
}
