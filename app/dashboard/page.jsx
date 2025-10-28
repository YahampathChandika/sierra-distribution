import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries/auth";
import { getUserProfile } from "@/lib/queries/users";
import DashboardContent from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();

  const user = await getUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile(supabase, user.id);

  return (
    <main className="container mx-auto p-8">
      <DashboardContent user={user} profile={profile} />
    </main>
  );
}
