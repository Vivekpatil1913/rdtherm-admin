"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { RichTextEditor } from "@/components/form/RichTextEditor";
import { ImageUpload } from "@/components/form/ImageUpload";
import { IMAGE_PRESETS } from "@/lib/image";
import { useForm } from "@/hooks/useForm";
import { useCrud } from "@/hooks/useCrud";
import { blogService } from "@/services";
import { rules, type Rule } from "@/lib/validation";
import { slugify, readingTime } from "@/lib/format";
import type { BlogPost } from "@/types";

/** Rich-text required check that ignores empty markup like `<p></p>`. */
const requiredHtml =
  (message: string): Rule =>
  (value) => {
    const text = typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim() : "";
    return text ? null : message;
  };

const CATEGORIES = ["Manufacturing", "Automation", "Engineering", "Codes & Standards", "Case Study", "Materials"];

interface BlogEditorProps {
  post?: BlogPost;
  /** Read-only mode — disables all inputs and hides save (used by the View action). */
  readOnly?: boolean;
}

type FormValues = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  cover: string;
  cardImage: string;
  content: string;
  date: string;
}

export function BlogEditor({ post, readOnly = false }: BlogEditorProps) {
  const router = useRouter();
  const crud = useCrud(blogService, "Article");

  const form = useForm<FormValues>({
    initialValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      category: post?.category ?? "Manufacturing",
      author: post?.author ?? "R&D Therm Editorial",
      cover: post?.cover ?? "",
      cardImage: post?.cardImage ?? "",
      content: post?.content ?? "",
      date: post?.date ?? new Date().toISOString().slice(0, 10),
    },
    schema: {
      title: [rules.required("Please enter the title"), rules.minLength(6), rules.maxLength(50)],
      excerpt: [rules.required("Please enter the excerpt"), rules.maxLength(150)],
      content: [requiredHtml("Please enter the content")],
      author: [rules.required("Please enter the author"), rules.maxLength(35)],
      cover: [rules.required("Please upload a cover image")],
      cardImage: [rules.required("Please upload a card image")],
    },
    onSubmit: async (values) => {
      const payload = {
        ...values,
        slug: values.slug || slugify(values.title),
        readTime: readingTime(values.content),
        views: post?.views ?? 0,
        isActive: post?.isActive ?? true,
        order: post?.order ?? 0,
        createdAt: post?.createdAt ?? "",
        updatedAt: "",
      };
      try {
        if (post) {
          await crud.update(post.id, payload as Partial<BlogPost>);
        } else {
          await crud.create(payload as Omit<BlogPost, "id">);
        }
        router.push("/blogs");
      } catch {
        /* error toast already shown by useCrud — stay on the editor */
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" href="/blogs">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-content)]">
              {post ? (readOnly ? "View article" : "Edit article") : "New article"}
            </h1>
            <p className="text-[13px] text-[var(--color-muted)]">
              {post
                ? readOnly
                  ? `Viewing “${post.title}”`
                  : `Editing “${post.title}”`
                : "Draft a new blog post or case study."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main column — min-w-0 lets it shrink so long content wraps instead of widening the grid. */}
        <div className="flex min-w-0 flex-col gap-5">
          <Card padded className="flex flex-col gap-4">
            <Field label="Title" error={form.touched.title ? form.errors.title : ""} required count={form.values.title.length} max={50}>
              <Input
                value={form.values.title}
                onChange={(e) => form.setValue("title", e.target.value)}
                onBlur={() => form.handleBlur("title")}
                invalid={!!form.errors.title}
                maxLength={50}
                disabled={readOnly}
                placeholder="How automation is shaping the future of manufacturing"
              />
            </Field>
            <Field label="Excerpt" error={form.touched.excerpt ? form.errors.excerpt : ""} hint="Shown on cards and meta description." required count={form.values.excerpt.length} max={150}>
              <Textarea
                value={form.values.excerpt}
                onChange={(e) => form.setValue("excerpt", e.target.value)}
                onBlur={() => form.handleBlur("excerpt")}
                invalid={!!form.errors.excerpt}
                rows={2}
                maxLength={150}
                disabled={readOnly}
              />
            </Field>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Content <span className="text-[var(--color-danger)]">*</span>
              </CardTitle>
              <span className="text-[12px] text-[var(--color-muted)]">{readingTime(form.values.content)}</span>
            </CardHeader>
            <CardBody>
              <RichTextEditor
                value={form.values.content}
                onChange={(html) => form.setValue("content", html)}
                editable={!readOnly}
                placeholder="Start writing your article…"
              />
              {form.touched.content && form.errors.content ? (
                <p className="mt-2 text-xs text-[var(--color-danger)]">{form.errors.content}</p>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Cover image <span className="text-[var(--color-danger)]">*</span>
              </CardTitle>
              <span className="text-[12px] text-[var(--color-muted)]">Wide 21:9 · article banner</span>
            </CardHeader>
            <CardBody>
              <ImageUpload value={form.values.cover} onChange={(url) => form.setValue("cover", url)} aspect="wide" preset={IMAGE_PRESETS.blogCover} readOnly={readOnly} />
              {form.touched.cover && form.errors.cover ? (
                <p className="mt-2 text-xs text-[var(--color-danger)]">{form.errors.cover}</p>
              ) : null}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <Field label="Author" error={form.touched.author ? form.errors.author : ""} required count={form.values.author.length} max={35}>
                <Input value={form.values.author} onChange={(e) => form.setValue("author", e.target.value)} onBlur={() => form.handleBlur("author")} invalid={!!form.errors.author} maxLength={35} disabled={readOnly} />
              </Field>
              <Field label="Category">
                <Select value={form.values.category} onChange={(e) => form.setValue("category", e.target.value)} options={CATEGORIES.map((c) => ({ value: c, label: c }))} disabled={readOnly} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Card image <span className="text-[var(--color-danger)]">*</span>
              </CardTitle>
              <span className="text-[12px] text-[var(--color-muted)]">Square · blog grid</span>
            </CardHeader>
            <CardBody>
              <ImageUpload value={form.values.cardImage} onChange={(url) => form.setValue("cardImage", url)} aspect="square" preset={IMAGE_PRESETS.blogCard} readOnly={readOnly} />
              {form.touched.cardImage && form.errors.cardImage ? (
                <p className="mt-2 text-xs text-[var(--color-danger)]">{form.errors.cardImage}</p>
              ) : null}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        {readOnly ? (
          <Button variant="outline" href="/blogs">
            Back to articles
          </Button>
        ) : (
          <>
            <Button variant="outline" type="button" leftIcon={<Eye className="size-4" />}>
              Preview
            </Button>
            <Button type="submit" loading={form.isSubmitting} leftIcon={<Save className="size-4" />}>
              {post ? "Save changes" : "Publish article"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
