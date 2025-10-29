import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSuppliers, getSupplierCities } from "@/lib/queries/suppliers";
import { SuppliersContent } from "@/components/suppliers/suppliers-content";
import { SuppliersSkeleton } from "@/components/suppliers/suppliers-skeleton";

export default async function SuppliersPage({ searchParams }) {
  const supabase = await createClient();

  // Get filters from search params
  const filters = {
    search: searchParams?.search || "",
    city:
      searchParams?.city && searchParams.city !== "all"
        ? searchParams.city
        : undefined,
    isActive:
      searchParams?.status === "active"
        ? true
        : searchParams?.status === "inactive"
        ? false
        : undefined,
  };

  const [suppliers, cities] = await Promise.all([
    getSuppliers(supabase, filters),
    getSupplierCities(supabase),
  ]);

  return (
    <Suspense fallback={<SuppliersSkeleton />}>
      <SuppliersContent suppliers={suppliers} cities={cities} />
    </Suspense>
  );
}
