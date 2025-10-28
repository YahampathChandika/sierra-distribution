import DashboardHeader from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader />
      {children}
    </div>
  );
}
