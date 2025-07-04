import { Skeleton } from "@/components/ui/skeleton";

export function CalendarSkeleton() {
  return (
    <div className="w-full rounded-md border p-4">
      {/* Calendar header */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 w-8" />
        ))}

        {/* Calendar days */}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`day-${i}`} className="h-8 w-8" />
        ))}
      </div>
    </div>
  );
}
