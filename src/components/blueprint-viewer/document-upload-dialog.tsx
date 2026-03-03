"use client";

import { useState, useRef } from "react";
import { Camera, Video, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagMultiSelect } from "./tag-multi-select";
import { createClient } from "@/lib/supabase/client";
import { createDocument, assignDocumentTags } from "@/lib/actions/document-actions";
import {
  compressImage,
  generateThumbnail,
  generateVideoThumbnail,
  extractExifDate,
} from "@/lib/image-utils";
import {
  FILE_SIZE_LIMITS,
  SUPPORTED_FORMATS,
  STORAGE_BUCKETS,
} from "@/lib/constants";
import { formatFileSize } from "@/lib/utils";
import type { Tag } from "@/types/database";

interface DocumentUploadDialogProps {
  pinId: string;
  projectId: string;
  tags: Tag[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

export function DocumentUploadDialog({
  pinId,
  projectId,
  tags,
  open,
  onOpenChange,
  onUploaded,
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capturedAt, setCapturedAt] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isImage = file?.type.startsWith("image/");
  const isVideo = file?.type.startsWith("video/");

  function reset() {
    setFile(null);
    setPreview(null);
    setName("");
    setDescription("");
    setCapturedAt("");
    setSelectedTags([]);
    setProgress(0);
  }

  async function handleFileSelect(selectedFile: File) {
    // Validate type
    const allSupported = [
      ...SUPPORTED_FORMATS.PHOTO,
      ...SUPPORTED_FORMATS.VIDEO,
    ];
    if (!allSupported.includes(selectedFile.type as (typeof allSupported)[number])) {
      toast.error("Unsupported file type");
      return;
    }

    // Validate size
    const limit = selectedFile.type.startsWith("video/")
      ? FILE_SIZE_LIMITS.VIDEO
      : FILE_SIZE_LIMITS.PHOTO;
    if (selectedFile.size > limit) {
      toast.error(`File too large. Max ${formatFileSize(limit)}`);
      return;
    }

    setFile(selectedFile);
    setName(selectedFile.name.replace(/\.[^.]+$/, ""));

    // Generate preview
    if (selectedFile.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selectedFile));
    } else if (selectedFile.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(selectedFile));
    }

    // Extract EXIF date
    const exifDate = await extractExifDate(selectedFile);
    if (exifDate) {
      // Format for datetime-local input
      const local = new Date(exifDate.getTime() - exifDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setCapturedAt(local);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
    e.target.value = "";
  }

  async function handleSubmit() {
    if (!file) return;

    setUploading(true);
    setProgress(10);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const uuid = crypto.randomUUID();
      const storagePath = `${projectId}/${pinId}/${uuid}.${ext}`;

      let uploadFile: File | Blob = file;
      let thumbnailBlob: Blob | null = null;

      // Compress & generate thumbnail
      if (isImage) {
        setProgress(20);
        uploadFile = await compressImage(file);
        setProgress(35);
        thumbnailBlob = await generateThumbnail(file);
        setProgress(45);
      } else if (isVideo) {
        setProgress(20);
        try {
          thumbnailBlob = await generateVideoThumbnail(file);
        } catch {
          // Video thumbnail generation is best-effort
        }
        setProgress(35);
      }

      // Upload main file
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .upload(storagePath, uploadFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;
      setProgress(70);

      // Upload thumbnail
      let thumbnailPath: string | null = null;
      if (thumbnailBlob) {
        thumbnailPath = `${projectId}/${pinId}/thumbs/${uuid}.jpg`;
        await supabase.storage
          .from(STORAGE_BUCKETS.DOCUMENTS)
          .upload(thumbnailPath, thumbnailBlob, {
            cacheControl: "3600",
            upsert: false,
            contentType: "image/jpeg",
          });
      }
      setProgress(85);

      // Create DB record
      const result = await createDocument(pinId, projectId, {
        name: name.trim() || file.name,
        description: description.trim() || null,
        file_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        thumbnail_path: thumbnailPath,
        captured_at: capturedAt ? new Date(capturedAt).toISOString() : null,
      });

      if (!result.success) throw new Error(result.error);

      // Assign tags
      if (selectedTags.length > 0) {
        await assignDocumentTags(result.data.id, selectedTags);
      }

      setProgress(100);
      toast.success("Document uploaded");
      reset();
      onUploaded();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!uploading) { onOpenChange(o); if (!o) reset(); } }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* File selection */}
          {!file ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 flex-col gap-1 py-6"
                onClick={() => photoRef.current?.click()}
              >
                <Camera className="h-5 w-5" />
                <span className="text-xs">Photo</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex-col gap-1 py-6"
                onClick={() => videoRef.current?.click()}
              >
                <Video className="h-5 w-5" />
                <span className="text-xs">Video</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 flex-col gap-1 py-6"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">File</span>
              </Button>

              {/* Hidden inputs */}
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleInputChange}
              />
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleInputChange}
              />
              <input
                ref={fileRef}
                type="file"
                accept={[...SUPPORTED_FORMATS.PHOTO, ...SUPPORTED_FORMATS.VIDEO].join(",")}
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          ) : (
            /* Preview */
            <div className="relative">
              {isImage && preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 w-full rounded-lg object-contain bg-muted"
                />
              )}
              {isVideo && preview && (
                <video
                  src={preview}
                  controls
                  className="max-h-48 w-full rounded-lg bg-muted"
                />
              )}
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{file.name}</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 rounded-full bg-background/80"
                onClick={reset}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Form fields (only when file selected) */}
          {file && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="doc-name">Name</Label>
                <Input
                  id="doc-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-desc">Description</Label>
                <Textarea
                  id="doc-desc"
                  placeholder="Add notes..."
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-date">Date / Time</Label>
                <Input
                  id="doc-date"
                  type="datetime-local"
                  value={capturedAt}
                  onChange={(e) => setCapturedAt(e.target.value)}
                />
              </div>

              {tags.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Tags</Label>
                  <TagMultiSelect
                    tags={tags}
                    selected={selectedTags}
                    onChange={setSelectedTags}
                  />
                </div>
              )}

              {/* Progress */}
              {uploading && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => { onOpenChange(false); reset(); }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
