import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProducts, getProductCategories } from "@/lib/queries/products";
import { ProductsContent } from "@/components/products/products-content";
import { ProductsSkeleton } from "@/components/products/products-skeleton";

export default async function ProductsPage({ searchParams }) {
  const supabase = await createClient();

  // Get filters from search params
  const filters = {
    search: searchParams?.search || "",
    category:
      searchParams?.category && searchParams.category !== "all"
        ? searchParams.category
        : undefined,
    isActive:
      searchParams?.status === "active"
        ? true
        : searchParams?.status === "inactive"
        ? false
        : undefined,
    lowStock: searchParams?.status === "low-stock" ? true : undefined,
  };

  const [products, categories] = await Promise.all([
    getProducts(supabase, filters),
    getProductCategories(supabase),
  ]);

  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent products={products} categories={categories} />
    </Suspense>
  );
}
