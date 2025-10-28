"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/queries/auth";
import { Button } from "@/components/ui/button";

export default function DashboardHeader() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await signOut(supabase);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="border-b bg-white dark:bg-zinc-900 dark:border-zinc-800">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-xl font-bold">Sierra Distribution</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
