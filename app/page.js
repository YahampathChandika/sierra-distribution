import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/queries/auth";

export default async function HomePage() {
  const supabase = await createClient();
  const session = await getSession(supabase);

  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
