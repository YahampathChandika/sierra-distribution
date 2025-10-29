import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries/auth";
import DashboardContent from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect("/login");
  }

  return <DashboardContent />;
}
