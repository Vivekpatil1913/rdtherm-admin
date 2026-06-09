/**
 * Client-side image validation — mirrors the backend rules so users get instant
 * feedback before a file is ever uploaded.
 */

export const IMAGE_RULES = {
  maxBytes: 1 * 1024 * 1024, // 1 MB
  maxMb: 1,
  minDim: 100,
  maxDim: 4000,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
};

/** Product gallery images: stricter 1 MB cap, max 5 images. */
export const GALLERY_RULES = {
  maxImages: 5,
  maxBytes: 1 * 1024 * 1024, // 1 MB
  maxMb: 1,
};

/** Human-readable hint shown under upload fields. */
export const IMAGE_HINT = `PNG, JPG or WEBP up to ${IMAGE_RULES.maxMb}MB`;

/** Hint for product gallery slots. */
export const GALLERY_HINT = `Up to ${GALLERY_RULES.maxImages} images · PNG, JPG or WEBP · max ${GALLERY_RULES.maxMb}MB each`;

/**
 * Per-field image requirement. `ratio` is the required aspect ratio (w:h) the
 * image must match (within a small tolerance) so it renders on the website
 * without distortion or awkward cropping. `recW`/`recH` are the recommended
 * exact dimensions shown to the user. `minW`/`minH` guard against blurry uploads.
 */
export type ImagePreset = {
  ratio: { w: number; h: number };
  recW: number;
  recH: number;
  minW: number;
  minH: number;
};

/** Allowed deviation from the exact aspect ratio (3%). */
const RATIO_TOLERANCE = 0.03;

/**
 * Required dimensions for each image upload field, derived from how the website
 * actually displays the image (so a correctly-sized image always looks right).
 */
export const IMAGE_PRESETS = {
  /** Product cover — shown as 16:9 cards across the site. */
  productCover: { ratio: { w: 16, h: 9 }, recW: 1600, recH: 900, minW: 800, minH: 450 },
  /** Product gallery — landscape 4:3 lightbox tiles. */
  productGallery: { ratio: { w: 4, h: 3 }, recW: 1200, recH: 900, minW: 800, minH: 600 },
  /** Blog cover — 16:9 article hero. */
  blogCover: { ratio: { w: 16, h: 9 }, recW: 1600, recH: 900, minW: 800, minH: 450 },
  /** Industry cover — 5:4 section image. */
  industryCover: { ratio: { w: 5, h: 4 }, recW: 1000, recH: 800, minW: 600, minH: 480 },
  /** Team / director photo — 4:5 portrait. */
  teamPhoto: { ratio: { w: 4, h: 5 }, recW: 800, recH: 1000, minW: 480, minH: 600 },
  /** Square avatar — testimonials, profile photo. */
  avatar: { ratio: { w: 1, h: 1 }, recW: 600, recH: 600, minW: 300, minH: 300 },
} as const satisfies Record<string, ImagePreset>;

/** "16:9 · recommended 1600×900px" — used in field hints. */
export function presetHint(p: ImagePreset): string {
  return `${p.ratio.w}:${p.ratio.h} · recommended ${p.recW}×${p.recH}px · max ${IMAGE_RULES.maxMb}MB`;
}

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image."));
    };
    img.src = url;
  });
}

/** Returns an error message if the file is invalid, otherwise null. */
export async function validateImageFile(
  file: File,
  opts: { maxBytes?: number; maxMb?: number; preset?: ImagePreset } = {},
): Promise<string | null> {
  const maxBytes = opts.maxBytes ?? IMAGE_RULES.maxBytes;
  const maxMb = opts.maxMb ?? IMAGE_RULES.maxMb;
  if (!IMAGE_RULES.allowedTypes.includes(file.type)) {
    return "Unsupported file type. Use JPG, PNG, WEBP, GIF or SVG.";
  }
  if (file.size > maxBytes) {
    return `Image is too large. Maximum size is ${maxMb}MB.`;
  }
  // SVG is vector — no pixel dimensions to check.
  if (file.type === "image/svg+xml") return null;

  let width = 0;
  let height = 0;
  try {
    ({ width, height } = await readDimensions(file));
  } catch {
    return "Could not read the image. Please choose a valid image file.";
  }

  const { minDim, maxDim } = IMAGE_RULES;
  if (width < minDim || height < minDim || width > maxDim || height > maxDim) {
    return `Image must be between ${minDim}×${minDim}px and ${maxDim}×${maxDim}px (this one is ${width}×${height}px).`;
  }

  // Per-field aspect-ratio + minimum-size requirement.
  const p = opts.preset;
  if (p) {
    if (width < p.minW || height < p.minH) {
      return `Image is too small. Use at least ${p.minW}×${p.minH}px — recommended ${p.recW}×${p.recH}px (${p.ratio.w}:${p.ratio.h}). This image is ${width}×${height}px.`;
    }
    const target = p.ratio.w / p.ratio.h;
    const actual = width / height;
    if (Math.abs(actual - target) / target > RATIO_TOLERANCE) {
      return `Image must be a ${p.ratio.w}:${p.ratio.h} ratio (recommended ${p.recW}×${p.recH}px). This image is ${width}×${height}px — please crop or resize it.`;
    }
  }

  return null;
}
