import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPayments, getPaymentStats } from "@/lib/queries/payments";
import { PaymentsContent } from "@/components/payments/payments-content";
import { PaymentsSkeleton } from "@/components/payments/payments-skeleton";

export default async function PaymentsPage({ searchParams }) {
  const supabase = await createClient();

  // Get filters from search params
  const filters = {
    search: searchParams?.search || "",
    paymentType:
      searchParams?.type && searchParams.type !== "all"
        ? searchParams.type
        : undefined,
    paymentMethod:
      searchParams?.method && searchParams.method !== "all"
        ? searchParams.method
        : undefined,
  };

  const [payments, stats] = await Promise.all([
    getPayments(supabase, filters),
    getPaymentStats(supabase, {}),
  ]);

  return (
    <Suspense fallback={<PaymentsSkeleton />}>
      <PaymentsContent payments={payments} stats={stats} />
    </Suspense>
  );
}
