"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileQuestion } from "lucide-react";
import { BlogEditor } from "@/components/cms/BlogEditor";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { blogService } from "@/services";
import type { BlogPost } from "@/types";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService.get(params.id).then((p) => {
      setPost(p ?? null);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
          <Card className="h-96" />
          <Card className="h-72" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <Card>
        <EmptyState
          icon={FileQuestion}
          title="Article not found"
          description="This article may have been deleted."
          action={<Button href="/blogs">Back to articles</Button>}
        />
      </Card>
    );
  }

  return <BlogEditor post={post} />;
}
