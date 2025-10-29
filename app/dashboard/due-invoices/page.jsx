import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  getAllDueInvoices,
  getDueInvoicesStats,
} from "@/lib/queries/due-invoices";
import { DueInvoicesContent } from "@/components/due-invoices/due-invoices-content";
import { DueInvoicesSkeleton } from "@/components/due-invoices/due-invoices-skeleton";

export default async function DueInvoicesPage({ searchParams }) {
  const supabase = await createClient();

  // Get filters from search params
  const filters = {
    search: searchParams?.search || "",
    type:
      searchParams?.type && searchParams.type !== "all"
        ? searchParams.type
        : undefined,
    aging:
      searchParams?.aging && searchParams.aging !== "all"
        ? searchParams.aging
        : undefined,
  };

  const [invoices, stats] = await Promise.all([
    getAllDueInvoices(supabase, filters),
    getDueInvoicesStats(supabase),
  ]);

  return (
    <Suspense fallback={<DueInvoicesSkeleton />}>
      <DueInvoicesContent invoices={invoices} stats={stats} />
    </Suspense>
  );
}
