"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Users, Map, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavTab {
  icon: LucideIcon;
  label: string;
  href: string;
  matchPrefix: string;
  disabled?: boolean;
}

const TABS: NavTab[] = [
  { icon: FolderKanban, label: "PROJECTS", href: "/projects", matchPrefix: "/projects" },
  { icon: Users, label: "TEAM", href: "/team", matchPrefix: "/team", disabled: true },
  { icon: Map, label: "DRAWINGS", href: "/drawings", matchPrefix: "/drawings", disabled: true },
  { icon: Settings, label: "SETTINGS", href: "/settings", matchPrefix: "/settings" },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center border-t bg-card safe-bottom md:hidden">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.matchPrefix);

        if (tab.disabled) {
          return (
            <div
              key={tab.label}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground opacity-40"
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </div>
          );
        }

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
