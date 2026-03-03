"use client";

import { Map, ClipboardList, Layers, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

function NavItem({
  icon: Icon,
  label,
  active,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium",
        active ? "text-primary" : "text-muted-foreground",
        disabled && "opacity-40 pointer-events-none"
      )}
      disabled={disabled}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

export function BlueprintBottomNav() {
  return (
    <nav className="flex h-16 shrink-0 items-center justify-around border-t bg-card px-2">
      <NavItem icon={Map} label="BLUEPRINT" active />
      <NavItem icon={ClipboardList} label="TASKS" disabled />

      {/* FAB Center Button */}
      <div className="relative -mt-6">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          disabled
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <NavItem icon={Layers} label="LAYERS" disabled />
      <NavItem icon={MoreHorizontal} label="MORE" disabled />
    </nav>
  );
}
