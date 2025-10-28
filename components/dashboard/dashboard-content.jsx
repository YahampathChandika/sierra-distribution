export default function DashboardContent({ user, profile }) {
  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-zinc-900 dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="space-y-2">
        <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            Email:
          </span>{" "}
          {user.email}
        </p>
        <p className="text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            Role:
          </span>{" "}
          <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            {profile?.role}
          </span>
        </p>
      </div>
    </div>
  );
}
