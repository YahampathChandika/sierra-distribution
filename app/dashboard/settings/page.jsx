import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries/auth";
import { getUserProfile, getAllUsers } from "@/lib/queries/users";
import { getSettings } from "@/lib/queries/settings";
import { SettingsContent } from "@/components/settings/settings-content";
import { SettingsSkeleton } from "@/components/settings/settings-skeleton";

export default async function SettingsPage({ searchParams }) {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile(supabase, user.id);

  // Get settings and users
  const [settings, users] = await Promise.all([
    getSettings(supabase),
    profile?.role === "admin" ? getAllUsers(supabase) : Promise.resolve([]),
  ]);

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent
        user={user}
        profile={profile}
        users={users}
        settings={settings}
      />
    </Suspense>
  );
}
