"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileQuestion } from "lucide-react";
import { ProductEditor } from "@/components/cms/ProductEditor";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { productService } from "@/services";
import type { Product } from "@/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.get(params.id).then((p) => {
      setProduct(p ?? null);
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

  if (!product) {
    return (
      <Card>
        <EmptyState
          icon={FileQuestion}
          title="Product not found"
          description="This product may have been deleted."
          action={<Button href="/products">Back to products</Button>}
        />
      </Card>
    );
  }

  return <ProductEditor product={product} />;
}
