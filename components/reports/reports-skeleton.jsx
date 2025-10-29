import { Skeleton } from "@/components/ui/skeleton";

export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <Skeleton className="h-6 w-[150px]" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>

      <Skeleton className="h-10 w-full" />

      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-8 w-[120px]" />
          </div>
        ))}
      </div>

      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
