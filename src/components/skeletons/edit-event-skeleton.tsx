import { Skeleton } from "@/components/ui/skeleton";

function EditEventSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-3 w-full max-w-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-full max-w-xs" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full max-w-sm" />
            </div>
            <Skeleton className="h-6 w-11" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-3 w-full max-w-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-full max-w-sm" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-full max-w-md" />
          </div>
        </div>
        <div className="flex items-center p-6 pt-0">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-28" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEventSkeleton;
