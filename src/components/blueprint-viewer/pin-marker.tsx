"use client";

import { useRef } from "react";
import { Circle, Group } from "react-konva";
import { PIN_TYPE_CONFIG } from "@/lib/constants";
import { useCanvasStore } from "@/stores/canvas-store";
import { updatePinPosition } from "@/lib/actions/pin-actions";
import type { PinWithTags } from "@/types/database";
import type Konva from "konva";

interface PinMarkerProps {
  pin: PinWithTags;
  imageWidth: number;
  imageHeight: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function PinMarker({
  pin,
  imageWidth,
  imageHeight,
  isSelected,
  onSelect,
}: PinMarkerProps) {
  const zoom = useCanvasStore((s) => s.zoom);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const groupRef = useRef<Konva.Group>(null);

  const x = pin.x * imageWidth;
  const y = pin.y * imageHeight;
  const color =
    pin.color ?? PIN_TYPE_CONFIG[pin.pin_type]?.color ?? "#3b82f6";

  // Scale inversely with zoom so markers stay a consistent visual size
  const scale = 1 / zoom;

  const isDraggable = activeTool === "select";

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const node = e.target;
    const newX = node.x();
    const newY = node.y();

    // Normalize and clamp
    const normalizedX = Math.max(0, Math.min(1, newX / imageWidth));
    const normalizedY = Math.max(0, Math.min(1, newY / imageHeight));

    // Snap to clamped position
    node.x(normalizedX * imageWidth);
    node.y(normalizedY * imageHeight);

    // Persist
    updatePinPosition(pin.id, normalizedX, normalizedY);
  }

  function handleClick() {
    if (activeTool !== "pin") {
      onSelect(pin.id);
    }
  }

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      scaleX={scale}
      scaleY={scale}
      draggable={isDraggable}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Selection glow ring */}
      {isSelected && (
        <Circle
          radius={20}
          fill={color}
          opacity={0.25}
        />
      )}

      {/* Outer colored ring */}
      <Circle
        radius={14}
        fill={color}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={4}
        shadowOffsetY={2}
      />

      {/* Inner white dot */}
      <Circle radius={6} fill="#ffffff" />
    </Group>
  );
}
