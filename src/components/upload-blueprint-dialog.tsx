"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createBlueprintRecord } from "@/lib/actions/blueprint-actions";
import { FILE_SIZE_LIMITS, SUPPORTED_FORMATS, STORAGE_BUCKETS } from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";

interface UploadBlueprintDialogProps {
  projectId: string;
  children: React.ReactNode;
}

export function UploadBlueprintDialog({
  projectId,
  children,
}: UploadBlueprintDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setUploading(false);
  }, []);

  function handleFileSelect(selectedFile: File) {
    // Validate type
    if (
      !SUPPORTED_FORMATS.BLUEPRINT.includes(
        selectedFile.type as (typeof SUPPORTED_FORMATS.BLUEPRINT)[number]
      )
    ) {
      toast.error("Unsupported file type. Use PNG, JPEG, or PDF.");
      return;
    }

    // Validate size
    if (selectedFile.size > FILE_SIZE_LIMITS.BLUEPRINT) {
      toast.error(`File too large. Maximum size is ${formatFileSize(FILE_SIZE_LIMITS.BLUEPRINT)}.`);
      return;
    }

    setFile(selectedFile);

    // Generate preview for images
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelect(selectedFile);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim() || file.name.replace(/\.[^.]+$/, "");
    const floor = (formData.get("floor") as string)?.trim() || null;

    setUploading(true);
    setProgress(0);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "png";
      const storagePath = `${projectId}/${crypto.randomUUID()}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.BLUEPRINTS)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      // Simulate progress since supabase-js doesn't have onUploadProgress
      setProgress(70);

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      setProgress(85);

      // Get image dimensions for raster images
      let width: number | null = null;
      let height: number | null = null;
      if (file.type.startsWith("image/") && preview) {
        const dimensions = await getImageDimensions(preview);
        width = dimensions.width;
        height = dimensions.height;
      }

      // Create database record via server action
      startTransition(async () => {
        const result = await createBlueprintRecord(projectId, {
          name,
          file_path: storagePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          width,
          height,
          floor,
        });

        setProgress(100);

        if (result.success) {
          toast.success("Blueprint uploaded");
          setOpen(false);
          resetState();
        } else {
          toast.error(result.error);
        }
        setUploading(false);
      });
    } catch {
      toast.error("Upload failed. Please try again.");
      setUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Blueprint</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Drop zone */}
            {!file ? (
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag & drop or click to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPEG, or PDF up to {formatFileSize(FILE_SIZE_LIMITS.BLUEPRINT)}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-lg border p-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted"
                  onClick={() => { resetState(); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                >
                  <X className="h-3 w-3" />
                </Button>
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <FileText className="h-10 w-10 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress bar */}
            {uploading && (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="bp-name">Blueprint Name</Label>
              <Input
                id="bp-name"
                name="name"
                defaultValue={file?.name.replace(/\.[^.]+$/, "") ?? ""}
                placeholder="e.g. Floor 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp-floor">Floor / Level</Label>
              <Input
                id="bp-floor"
                name="floor"
                placeholder="e.g. Floor 1, Basement, Roof"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || uploading || isPending}>
              {uploading || isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });
}
