import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex h-[100dvh] flex-col">
      <Skeleton className="h-14 shrink-0" />
      <Skeleton className="h-10 shrink-0" />
      <Skeleton className="flex-1" />
      <Skeleton className="h-16 shrink-0" />
    </div>
  );
}
