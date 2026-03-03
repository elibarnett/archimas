"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { formatDateRange } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
}

const PRESETS: { label: string; getValue: () => { from: string; to: string } }[] = [
  {
    label: "Today",
    getValue: () => {
      const d = new Date().toISOString().split("T")[0];
      return { from: d, to: d };
    },
  },
  {
    label: "This Week",
    getValue: () => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      return {
        from: start.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "This Month",
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: start.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Last 30 Days",
    getValue: () => {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return {
        from: start.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      };
    },
  },
];

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const hasRange = from || to;
  const displayText = hasRange ? formatDateRange(from, to) : "Dates";

  const selected: DateRange | undefined =
    from || to
      ? { from: from ? new Date(from + "T00:00:00") : undefined, to: to ? new Date(to + "T00:00:00") : undefined }
      : undefined;

  function handleSelect(range: DateRange | undefined) {
    const f = range?.from ? range.from.toISOString().split("T")[0] : null;
    const t = range?.to ? range.to.toISOString().split("T")[0] : null;
    onChange(f, t);
  }

  function handlePreset(preset: (typeof PRESETS)[number]) {
    const { from: f, to: t } = preset.getValue();
    onChange(f, t);
    setOpen(false);
  }

  function handleClear() {
    onChange(null, null);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasRange ? "default" : "outline"}
          size="sm"
          className="shrink-0 gap-1.5 rounded-full text-xs"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-wrap gap-1.5 p-3">
          {PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handlePreset(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Separator />
        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={1}
        />
        {hasRange && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={handleClear}
              >
                Clear dates
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
