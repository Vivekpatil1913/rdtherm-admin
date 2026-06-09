"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/cn";
import { uploadImage } from "@/services";
import { useToast } from "@/providers/ToastProvider";
import { errorMessage } from "@/services/apiError";
import { validateImageFile, IMAGE_HINT, IMAGE_RULES, presetHint, type ImagePreset } from "@/lib/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  aspect?: "video" | "square" | "wide";
  className?: string;
  /** Optional max file size in MB (defaults to the global 2MB rule). */
  maxMb?: number;
  /** Required dimensions (aspect ratio + recommended size) for this field. */
  preset?: ImagePreset;
}

const ASPECT = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
};

/**
 * Image upload UI — drag & drop or click to pick.
 * Selected files are read as data URLs for an instant local preview (mock).
 * A real backend would swap `readAsDataURL` for an upload + returned CDN URL.
 */
export function ImageUpload({ value, onChange, aspect = "video", className, maxMb, preset }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const effectiveMaxMb = maxMb ?? IMAGE_RULES.maxMb;
  const maxBytes = effectiveMaxMb * 1024 * 1024;
  const hint = preset
    ? presetHint(preset)
    : maxMb
      ? `PNG, JPG or WEBP up to ${maxMb}MB`
      : IMAGE_HINT;

  const readFile = async (file: File) => {
    const invalid = await validateImageFile(file, { maxBytes, maxMb: effectiveMaxMb, preset });
    if (invalid) {
      toast.error("Invalid image", invalid);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, { maxKb: Math.round(maxBytes / 1024) });
      onChange(url);
    } catch (err) {
      toast.error("Upload failed", errorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) readFile(file);
  };

  if (value) {
    return (
      <div className={cn("group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]", ASPECT[aspect], className)}>
        <img src={value} alt="Preview" className="size-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex w-full max-w-[150px] items-center justify-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-[12.5px] font-medium text-black transition-colors hover:bg-white"
          >
            <ImagePlus className="size-4 shrink-0" /> Replace
          </button>
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex w-full max-w-[150px] items-center justify-center gap-1.5 rounded-md bg-[var(--color-danger)] px-3 py-1.5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Trash2 className="size-4 shrink-0" /> Remove
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed px-6 py-10 text-center transition-colors",
        ASPECT[aspect],
        dragging
          ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]/40"
          : "border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]",
        className,
      )}
    >
      {uploading ? (
        <Loader2 className="size-6 animate-spin text-[var(--color-brand-strong)]" />
      ) : (
        <UploadCloud className="size-7 text-[var(--color-muted)]" />
      )}
      <p className="text-sm font-medium text-[var(--color-content)]">
        {uploading ? "Uploading…" : "Drop an image, or click to browse"}
      </p>
      <p className="text-xs text-[var(--color-muted)]">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
      />
    </button>
  );
}
