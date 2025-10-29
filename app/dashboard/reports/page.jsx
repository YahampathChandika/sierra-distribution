import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries/auth";
import { getUserProfile } from "@/lib/queries/users";
import {
  getSalesReport,
  getPurchasesReport,
  getProfitLossReport,
} from "@/lib/queries/reports";
import { ReportsContent } from "@/components/reports/reports-content";
import { ReportsSkeleton } from "@/components/reports/reports-skeleton";

export default async function ReportsPage({ searchParams }) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile(supabase, user.id);

  // Only admins can access reports
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Get date range from search params
  const dateFrom = searchParams?.dateFrom || "";
  const dateTo = searchParams?.dateTo || "";

  // Fetch all report data
  const [sales, purchases, profitLoss] = await Promise.all([
    getSalesReport(supabase, dateFrom, dateTo),
    getPurchasesReport(supabase, dateFrom, dateTo),
    getProfitLossReport(supabase, dateFrom, dateTo),
  ]);

  const reportData = {
    sales,
    purchases,
    profitLoss,
  };

  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsContent initialData={reportData} />
    </Suspense>
  );
}
