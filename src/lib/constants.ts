/** Supabase Storage bucket identifiers */
export const STORAGE_BUCKETS = {
  BLUEPRINTS: "blueprints",
  DOCUMENTS: "documents",
} as const;

/** Pin type display configuration */
export const PIN_TYPE_CONFIG = {
  note: { label: "Note", icon: "StickyNote", color: "#3b82f6" },
  issue: { label: "Issue", icon: "AlertTriangle", color: "#ef4444" },
  photo: { label: "Photo", icon: "Camera", color: "#22c55e" },
  measurement: { label: "Measurement", icon: "Ruler", color: "#f59e0b" },
  safety: { label: "Safety", icon: "ShieldAlert", color: "#dc2626" },
} as const;

/** Project status display configuration */
export const PROJECT_STATUS_CONFIG = {
  active: { label: "Active", color: "#22c55e" },
  archived: { label: "Archived", color: "#78716c" },
  completed: { label: "Completed", color: "#3b82f6" },
} as const;

/** File size limits in bytes */
export const FILE_SIZE_LIMITS = {
  PHOTO: 20 * 1024 * 1024, // 20MB
  VIDEO: 200 * 1024 * 1024, // 200MB
  BLUEPRINT: 50 * 1024 * 1024, // 50MB
} as const;

/** Supported file types */
export const SUPPORTED_FORMATS = {
  BLUEPRINT: ["image/png", "image/jpeg", "application/pdf"],
  PHOTO: ["image/jpeg", "image/png", "image/heic"],
  VIDEO: ["video/mp4", "video/quicktime"],
} as const;
