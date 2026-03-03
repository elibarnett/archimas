/**
 * Client-side image processing utilities.
 * Uses browser Canvas API — no external dependencies.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/** Compress/resize an image. Returns JPEG blob. */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const { maxWidth = 2048, maxHeight = 2048, quality = 0.8 } = options;

  // Skip if already small enough
  if (file.size < 500 * 1024) return file;

  const img = await loadImage(file);
  const { width, height } = fitDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
      "image/jpeg",
      quality
    );
  });
}

/** Generate a small thumbnail. Returns JPEG blob. */
export async function generateThumbnail(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const { maxWidth = 400, maxHeight = 400, quality = 0.7 } = options;

  const img = await loadImage(file);
  const { width, height } = fitDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Thumbnail generation failed")),
      "image/jpeg",
      quality
    );
  });
}

/** Capture a frame from a video at ~1 second. Returns JPEG blob. */
export async function generateVideoThumbnail(file: File): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadeddata = () => {
      // Seek to 1s or 0 if video is shorter
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(video.videoWidth, 400);
      canvas.height = Math.min(
        video.videoHeight,
        Math.round((400 / video.videoWidth) * video.videoHeight)
      );

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context unavailable"));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Video thumbnail generation failed")),
        "image/jpeg",
        0.7
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video"));
    };
  });
}

/**
 * Extract EXIF DateTimeOriginal from a JPEG file.
 * Lightweight parser — reads APP1 marker for the DateTimeOriginal tag (0x9003).
 * Returns null for non-JPEG or missing EXIF data.
 */
export async function extractExifDate(file: File): Promise<Date | null> {
  if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
    return fallbackDate(file);
  }

  try {
    const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const view = new DataView(buffer);

    // Check JPEG SOI marker
    if (view.getUint16(0) !== 0xffd8) return fallbackDate(file);

    let offset = 2;
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset);

      // APP1 marker (EXIF)
      if (marker === 0xffe1) {
        const length = view.getUint16(offset + 2);
        const exifStart = offset + 4;

        // Verify "Exif\0\0"
        const exifHeader = String.fromCharCode(
          view.getUint8(exifStart),
          view.getUint8(exifStart + 1),
          view.getUint8(exifStart + 2),
          view.getUint8(exifStart + 3)
        );
        if (exifHeader !== "Exif") return fallbackDate(file);

        const tiffStart = exifStart + 6;
        const littleEndian = view.getUint16(tiffStart) === 0x4949;

        const ifdOffset =
          tiffStart + view.getUint32(tiffStart + 4, littleEndian);

        const date = findDateInIfd(view, tiffStart, ifdOffset, littleEndian);
        if (date) return date;

        // If not in IFD0, try to find ExifIFD pointer (tag 0x8769)
        const exifIfdPointer = findTagValue(
          view,
          tiffStart,
          ifdOffset,
          littleEndian,
          0x8769
        );
        if (exifIfdPointer !== null) {
          const exifIfdOffset = tiffStart + exifIfdPointer;
          const dateFromExif = findDateInIfd(
            view,
            tiffStart,
            exifIfdOffset,
            littleEndian
          );
          if (dateFromExif) return dateFromExif;
        }

        return fallbackDate(file);
      }

      // Skip non-APP1 markers
      if ((marker & 0xff00) === 0xff00) {
        offset += 2 + view.getUint16(offset + 2);
      } else {
        break;
      }
    }
  } catch {
    // EXIF parsing failed, fall back
  }

  return fallbackDate(file);
}

// ---- Internal helpers ----

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function fitDimensions(
  w: number,
  h: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  if (w <= maxW && h <= maxH) return { width: w, height: h };
  const ratio = Math.min(maxW / w, maxH / h);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function fallbackDate(file: File): Date | null {
  return file.lastModified ? new Date(file.lastModified) : null;
}

function findDateInIfd(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  littleEndian: boolean
): Date | null {
  // DateTimeOriginal = 0x9003, DateTime = 0x0132
  for (const tagId of [0x9003, 0x0132]) {
    const val = findTagString(view, tiffStart, ifdOffset, littleEndian, tagId);
    if (val) {
      // Format: "YYYY:MM:DD HH:MM:SS"
      const parsed = val.replace(
        /^(\d{4}):(\d{2}):(\d{2})/,
        "$1-$2-$3"
      );
      const date = new Date(parsed);
      if (!isNaN(date.getTime())) return date;
    }
  }
  return null;
}

function findTagValue(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  littleEndian: boolean,
  targetTag: number
): number | null {
  if (ifdOffset + 2 > view.byteLength) return null;
  const count = view.getUint16(ifdOffset, littleEndian);
  for (let i = 0; i < count; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, littleEndian);
    if (tag === targetTag) {
      return view.getUint32(entryOffset + 8, littleEndian);
    }
  }
  return null;
}

function findTagString(
  view: DataView,
  tiffStart: number,
  ifdOffset: number,
  littleEndian: boolean,
  targetTag: number
): string | null {
  if (ifdOffset + 2 > view.byteLength) return null;
  const count = view.getUint16(ifdOffset, littleEndian);
  for (let i = 0; i < count; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, littleEndian);
    if (tag === targetTag) {
      const type = view.getUint16(entryOffset + 2, littleEndian);
      const numValues = view.getUint32(entryOffset + 4, littleEndian);
      if (type !== 2) continue; // ASCII type

      const valueOffset =
        numValues <= 4
          ? entryOffset + 8
          : tiffStart + view.getUint32(entryOffset + 8, littleEndian);

      if (valueOffset + numValues > view.byteLength) return null;

      let str = "";
      for (let j = 0; j < numValues - 1; j++) {
        str += String.fromCharCode(view.getUint8(valueOffset + j));
      }
      return str;
    }
  }
  return null;
}
