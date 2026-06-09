"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { uploadImage } from "@/services";
import { useToast } from "@/providers/ToastProvider";
import { errorMessage } from "@/services/apiError";
import { validateImageFile, GALLERY_RULES, IMAGE_PRESETS, presetHint } from "@/lib/image";
import { Input } from "@/components/ui/Input";
import type { ProductImage } from "@/types";

interface GalleryUploadProps {
  value: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

/**
 * Multi-image gallery uploader for products.
 * Enforces a max of {GALLERY_RULES.maxImages} images and {GALLERY_RULES.maxMb}MB per image
 * (validated client-side and again on the server).
 */
export function GalleryUpload({ value, onChange }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const { maxImages, maxBytes, maxMb } = GALLERY_RULES;
  const remaining = maxImages - value.length;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    if (files.length > remaining) {
      toast.error(
        "Too many images",
        `You can add ${remaining} more image${remaining === 1 ? "" : "s"} (max ${maxImages} total).`,
      );
      return;
    }

    setUploading(true);
    const added: ProductImage[] = [];
    try {
      for (const file of files) {
        const invalid = await validateImageFile(file, { maxBytes, maxMb, preset: IMAGE_PRESETS.productGallery });
        if (invalid) {
          toast.error(`Skipped “${file.name}”`, invalid);
          continue;
        }
        try {
          const url = await uploadImage(file, { maxKb: Math.round(maxBytes / 1024) });
          added.push({ url, alt: "", label: undefined });
        } catch (err) {
          toast.error(`Upload failed: ${file.name}`, errorMessage(err));
        }
      }
      if (added.length) onChange([...value, ...added].slice(0, maxImages));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const setAlt = (i: number, alt: string) =>
    onChange(value.map((img, idx) => (idx === i ? { ...img, alt } : img)));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {value.map((img, i) => (
          <div key={`${img.url}-${i}`} className="flex flex-col gap-1.5">
            <div className="group relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]">
              <img src={img.url} alt={img.alt || "Gallery image"} className="size-full object-cover" />
              <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-md bg-[var(--color-danger)] text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <Input
              value={img.alt}
              onChange={(e) => setAlt(i, e.target.value)}
              placeholder="Image name (shown on hover)"
              className="text-[12px]"
            />
          </div>
        ))}

        {remaining > 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed border-[var(--color-border-strong)] px-3 text-center transition-colors hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {uploading ? (
              <Loader2 className="size-6 animate-spin text-[var(--color-brand-strong)]" />
            ) : (
              <ImagePlus className="size-6 text-[var(--color-muted)]" />
            )}
            <span className="text-[12px] font-medium text-[var(--color-content)]">
              {uploading ? "Uploading…" : "Add images"}
            </span>
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-[12px] text-[var(--color-muted)]">
        <span>{`Up to ${maxImages} images · ${presetHint(IMAGE_PRESETS.productGallery)}`}</span>
        <span className="tabular-nums">
          {value.length} / {maxImages}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
