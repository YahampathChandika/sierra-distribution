import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSales, getSalesStats } from "@/lib/queries/sales";
import { getActiveCustomers } from "@/lib/queries/customers";
import { SalesContent } from "@/components/sales/sales-content";
import { SalesSkeleton } from "@/components/sales/sales-skeleton";

export default async function SalesPage({ searchParams }) {
  const supabase = await createClient();

  // Get filters from search params
  const filters = {
    search: searchParams?.search || "",
    customerId:
      searchParams?.customer && searchParams.customer !== "all"
        ? searchParams.customer
        : undefined,
    paymentStatus:
      searchParams?.status && searchParams.status !== "all"
        ? searchParams.status
        : undefined,
  };

  const [sales, customers, stats] = await Promise.all([
    getSales(supabase, filters),
    getActiveCustomers(supabase),
    getSalesStats(supabase, {}),
  ]);

  return (
    <Suspense fallback={<SalesSkeleton />}>
      <SalesContent sales={sales} customers={customers} stats={stats} />
    </Suspense>
  );
}
