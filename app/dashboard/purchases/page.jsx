import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPurchases, getPurchaseStats } from "@/lib/queries/purchases";
import { getActiveSuppliers } from "@/lib/queries/suppliers";
import { PurchasesContent } from "@/components/purchases/purchases-content";
import { PurchasesSkeleton } from "@/components/purchases/purchases-skeleton";

export default async function PurchasesPage({ searchParams }) {
  const supabase = await createClient();

  // Get filters from search params
  const filters = {
    search: searchParams?.search || "",
    supplierId:
      searchParams?.supplier && searchParams.supplier !== "all"
        ? searchParams.supplier
        : undefined,
    paymentStatus:
      searchParams?.status && searchParams.status !== "all"
        ? searchParams.status
        : undefined,
  };

  const [purchases, suppliers, stats] = await Promise.all([
    getPurchases(supabase, filters),
    getActiveSuppliers(supabase),
    getPurchaseStats(supabase, {}),
  ]);

  return (
    <Suspense fallback={<PurchasesSkeleton />}>
      <PurchasesContent
        purchases={purchases}
        suppliers={suppliers}
        stats={stats}
      />
    </Suspense>
  );
}
