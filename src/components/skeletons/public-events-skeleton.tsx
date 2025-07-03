import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function PublicEventsSkeleton() {
  const skeletonCards = Array.from({ length: 3 }, (_, i) => (
    <Card
      key={i}
      className="relative overflow-hidden border transition-all duration-200 hover:shadow-md"
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            {/* Title skeleton */}
            <div className="mb-2">
              <Skeleton className="h-6 w-3/4" />
            </div>

            {/* Duration skeleton */}
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Description skeleton */}
            <div className="mb-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>

            {/* Location skeleton */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>

        {/* Book button skeleton */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">{skeletonCards}</div>
    </div>
  );
}

export default PublicEventsSkeleton;
