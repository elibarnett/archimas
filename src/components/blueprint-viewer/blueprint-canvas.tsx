"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { useCanvasStore } from "@/stores/canvas-store";
import type Konva from "konva";

interface BlueprintCanvasProps {
  imageUrl: string;
  width: number | null;
  height: number | null;
}

export function BlueprintCanvas({
  imageUrl,
  width: imgWidth,
  height: imgHeight,
}: BlueprintCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [initialScale, setInitialScale] = useState(1);

  const { zoom, panX, panY, setZoom, setPan, setInitialViewport } =
    useCanvasStore();

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  // Observe container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Fit image to viewport on load
  useEffect(() => {
    if (!image || containerSize.width === 0) return;

    const iw = imgWidth ?? image.naturalWidth;
    const ih = imgHeight ?? image.naturalHeight;
    if (!iw || !ih) return;

    const scaleX = containerSize.width / iw;
    const scaleY = containerSize.height / ih;
    const fitScale = Math.min(scaleX, scaleY) * 0.95; // 95% to add padding

    const fitPanX = (containerSize.width - iw * fitScale) / 2;
    const fitPanY = (containerSize.height - ih * fitScale) / 2;

    setInitialScale(fitScale);
    setInitialViewport(fitScale, fitPanX, fitPanY);
    setZoom(fitScale);
    setPan(fitPanX, fitPanY);
  }, [image, containerSize, imgWidth, imgHeight, setZoom, setPan, setInitialViewport]);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const scaleBy = 1.08;
      const oldZoom = zoom;
      const newZoom =
        e.evt.deltaY < 0 ? oldZoom * scaleBy : oldZoom / scaleBy;

      // Zoom toward pointer position
      const mousePointTo = {
        x: (pointer.x - panX) / oldZoom,
        y: (pointer.y - panY) / oldZoom,
      };

      setZoom(newZoom);
      setPan(
        pointer.x - mousePointTo.x * newZoom,
        pointer.y - mousePointTo.y * newZoom
      );
    },
    [zoom, panX, panY, setZoom, setPan]
  );

  // Drag end
  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      setPan(e.target.x(), e.target.y());
    },
    [setPan]
  );

  const iw = imgWidth ?? image?.naturalWidth ?? 0;
  const ih = imgHeight ?? image?.naturalHeight ?? 0;

  return (
    <div ref={containerRef} className="h-full w-full">
      {containerSize.width > 0 && (
        <Stage
          ref={stageRef}
          width={containerSize.width}
          height={containerSize.height}
          scaleX={zoom}
          scaleY={zoom}
          x={panX}
          y={panY}
          draggable
          onWheel={handleWheel}
          onDragEnd={handleDragEnd}
          className="cursor-grab active:cursor-grabbing"
        >
          <Layer>
            {image && <KonvaImage image={image} width={iw} height={ih} />}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
