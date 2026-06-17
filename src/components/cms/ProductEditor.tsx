"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { TagInput } from "@/components/form/TagInput";
import { RichTextEditor } from "@/components/form/RichTextEditor";
import { ImageUpload } from "@/components/form/ImageUpload";
import { GalleryUpload } from "@/components/form/GalleryUpload";
import { IMAGE_PRESETS } from "@/lib/image";
import { useForm } from "@/hooks/useForm";
import { useCrud } from "@/hooks/useCrud";
import { productService } from "@/services";
import { rules, type Rule } from "@/lib/validation";
import { slugify } from "@/lib/format";
import type { Product, ProductImage } from "@/types";

/** Rich-text required check that ignores empty markup like `<p></p>`. */
const requiredHtml =
  (message: string): Rule =>
  (value) => {
    const text = typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim() : "";
    return text ? null : message;
  };

interface ProductEditorProps {
  product?: Product;
}

type FormValues = {
  title: string;
  slug: string;
  summary: string;
  cover: string;
  images: ProductImage[];
  content: string;
  specs: string[];
  applications: string[];
  materials: string[];
  compliance: string[];
  benefits: string[];
  inclusions: string[];
  featured: boolean;
}

export function ProductEditor({ product }: ProductEditorProps) {
  const router = useRouter();
  const crud = useCrud(productService, "Product");

  const form = useForm<FormValues>({
    initialValues: {
      title: product?.title ?? "",
      slug: product?.slug ?? "",
      summary: product?.summary ?? "",
      cover: product?.cover ?? "",
      images: product?.images ?? [],
      content: product?.content ?? "",
      specs: product?.specs ?? [],
      applications: product?.applications ?? [],
      materials: product?.materials ?? [],
      compliance: product?.compliance ?? [],
      benefits: product?.benefits ?? [],
      inclusions: product?.inclusions ?? [],
      featured: product?.featured ?? false,
    },
    schema: {
      title: [rules.required("Please enter the product name"), rules.maxLength(50)],
      summary: [rules.required("Please enter the summary"), rules.minLength(20), rules.maxLength(300)],
      specs: [rules.required("Please add at least one key spec")],
      content: [requiredHtml("Please enter the detail content")],
      applications: [rules.required("Please add at least one application")],
      materials: [rules.required("Please add at least one material")],
      compliance: [rules.required("Please add at least one compliance code")],
      benefits: [rules.required("Please add at least one benefit")],
      inclusions: [rules.required("Please add at least one inclusion")],
      cover: [rules.required("Please upload a cover image")],
      images: [rules.required("Please add gallery images")],
    },
    onSubmit: async (values) => {
      const payload = {
        ...values,
        slug: values.slug || slugify(values.title),
        isActive: product?.isActive ?? true,
        order: product?.order ?? 0,
        createdAt: product?.createdAt ?? "",
        updatedAt: "",
      };
      try {
        if (product) {
          await crud.update(product.id, payload as Partial<Product>);
        } else {
          await crud.create(payload as Omit<Product, "id">);
        }
        router.push("/products");
      } catch {
        /* error toast already shown by useCrud — stay on the editor */
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" href="/products">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-content)]">
              {product ? "Edit product" : "New product"}
            </h1>
            <p className="text-[13px] text-[var(--color-muted)]">
              {product ? `Editing “${product.title}”` : "Add equipment to the product catalogue."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <Card padded className="flex flex-col gap-4">
            <Field label="Product name" error={form.touched.title ? form.errors.title : ""} required count={form.values.title.length} max={50}>
              <Input value={form.values.title} onChange={(e) => form.setValue("title", e.target.value)} onBlur={() => form.handleBlur("title")} invalid={!!form.errors.title} maxLength={50} placeholder="Distillation Columns" />
            </Field>
            <Field label="Summary" error={form.touched.summary ? form.errors.summary : ""} hint="Shown on the product card and list." required count={form.values.summary.length} max={300}>
              <Textarea value={form.values.summary} onChange={(e) => form.setValue("summary", e.target.value)} onBlur={() => form.handleBlur("summary")} invalid={!!form.errors.summary} rows={3} maxLength={300} />
            </Field>
            <Field label="Key specs" hint="3 short bullet specs shown on the card." error={form.touched.specs ? form.errors.specs : ""} required>
              <TagInput value={form.values.specs} onChange={(v) => form.setValue("specs", v)} placeholder="Shell diameter up to 4,500 mm" />
            </Field>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail content</CardTitle>
            </CardHeader>
            <CardBody>
              <RichTextEditor value={form.values.content} onChange={(html) => form.setValue("content", html)} placeholder="Describe the product in detail…" />
              {form.touched.content && form.errors.content ? (
                <p className="mt-2 text-xs text-[var(--color-danger)]">{form.errors.content}</p>
              ) : null}
            </CardBody>
          </Card>

          <Card padded className="flex flex-col gap-4">
            <Field label="Applications" error={form.touched.applications ? form.errors.applications : ""} required>
              <TagInput value={form.values.applications} onChange={(v) => form.setValue("applications", v)} placeholder="Chemical processing" />
            </Field>
            <Field label="Materials" error={form.touched.materials ? form.errors.materials : ""} required>
              <TagInput value={form.values.materials} onChange={(v) => form.setValue("materials", v)} placeholder="Stainless Steel" />
            </Field>
            <Field label="Compliance / Codes" error={form.touched.compliance ? form.errors.compliance : ""} required>
              <TagInput value={form.values.compliance} onChange={(v) => form.setValue("compliance", v)} placeholder="ASME U-Stamp" />
            </Field>
            <Field label="Benefits" error={form.touched.benefits ? form.errors.benefits : ""} required>
              <TagInput value={form.values.benefits} onChange={(v) => form.setValue("benefits", v)} placeholder="High separation efficiency" />
            </Field>
            <Field label="Always included" hint="Engineering services shipped with every unit." error={form.touched.inclusions ? form.errors.inclusions : ""} required>
              <TagInput value={form.values.inclusions} onChange={(v) => form.setValue("inclusions", v)} placeholder="Third-party inspection and code stamping." />
            </Field>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-[var(--radius-field)] border border-[var(--color-border)] px-3.5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-content)]">Featured</p>
                  <p className="text-[12px] text-[var(--color-muted)]">Show on homepage grid</p>
                </div>
                <Toggle checked={form.values.featured} onChange={(c) => form.setValue("featured", c)} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Cover image <span className="text-[var(--color-danger)]">*</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <ImageUpload value={form.values.cover} onChange={(url) => form.setValue("cover", url)} aspect="video" preset={IMAGE_PRESETS.productCover} />
              {form.touched.cover && form.errors.cover ? (
                <p className="mt-2 text-xs text-[var(--color-danger)]">{form.errors.cover}</p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>
            Gallery images <span className="text-[var(--color-danger)]">*</span>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <GalleryUpload value={form.values.images} onChange={(imgs) => form.setValue("images", imgs)} />
          {form.touched.images && form.errors.images ? (
            <p className="mt-2 text-xs text-[var(--color-danger)]">{form.errors.images}</p>
          ) : null}
        </CardBody>
      </Card>

      <div className="mt-6 flex items-center justify-end">
        <Button type="submit" loading={form.isSubmitting} leftIcon={<Save className="size-4" />}>
          {product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
