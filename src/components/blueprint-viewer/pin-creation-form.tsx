"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  StickyNote,
  AlertTriangle,
  Camera,
  Ruler,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PIN_TYPE_CONFIG } from "@/lib/constants";
import { createPin } from "@/lib/actions/pin-actions";
import { toast } from "sonner";
import type { PinType } from "@/types/database";
import type { LucideIcon } from "lucide-react";

const PIN_TYPE_ICONS: Record<PinType, LucideIcon> = {
  note: StickyNote,
  issue: AlertTriangle,
  photo: Camera,
  measurement: Ruler,
  safety: ShieldAlert,
};

interface PinCreationFormProps {
  blueprintId: string;
  position: { x: number; y: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function PinCreationForm({
  blueprintId,
  position,
  open,
  onOpenChange,
  onCreated,
}: PinCreationFormProps) {
  const [pinType, setPinType] = useState<PinType>("note");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const result = await createPin(blueprintId, {
        x: position.x,
        y: position.y,
        pin_type: pinType,
        label: label || null,
        description: description || null,
      });

      if (result.success) {
        toast.success("Pin placed");
        setLabel("");
        setDescription("");
        setPinType("note");
        onCreated();
      } else {
        toast.error(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setLabel("");
    setDescription("");
    setPinType("note");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Place Pin</SheetTitle>
          <SheetDescription className="sr-only">
            Choose a pin type and add details
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          {/* Pin type selector */}
          <div className="flex gap-2">
            {(Object.keys(PIN_TYPE_CONFIG) as PinType[]).map((type) => {
              const Icon = PIN_TYPE_ICONS[type];
              const config = PIN_TYPE_CONFIG[type];
              const isActive = pinType === type;
              return (
                <button
                  key={type}
                  onClick={() => setPinType(type)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-lg border p-2 text-[10px] font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: isActive ? config.color : undefined }}
                  />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="pin-label">Label</Label>
            <Input
              id="pin-label"
              placeholder="e.g., Crack in wall"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="pin-desc">Description</Label>
            <Textarea
              id="pin-desc"
              placeholder="Add details..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter className="flex-row gap-2 px-4 pb-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Placing..." : "Place Pin"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
