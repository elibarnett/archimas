"use client";

import { useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  parseFiltersFromSearchParams,
  serializeFiltersToSearchParams,
  DEFAULT_FILTERS,
  type DocumentFilters,
} from "@/lib/filters";

export function useFilterSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const raw: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      raw[key] = value;
    });
    return parseFiltersFromSearchParams(raw);
  }, [searchParams]);

  const setFilters = useCallback(
    (update: Partial<DocumentFilters>) => {
      const merged = { ...filters, ...update };
      const params = serializeFiltersToSearchParams(merged);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router]
  );

  const resetFilters = useCallback(() => {
    const params = serializeFiltersToSearchParams({
      ...DEFAULT_FILTERS,
      view: filters.view, // Preserve current view when resetting
    });
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters.view, pathname, router]);

  return { filters, setFilters, resetFilters };
}
