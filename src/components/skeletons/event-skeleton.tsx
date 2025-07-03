import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EventSkeleton() {
  const skeletonCards = Array.from({ length: 6 }, (_, i) => {
    // Randomize background colors for visual variety
    const bgColors = [
      "bg-blue-50 border-blue-200",
      "bg-green-50 border-green-200",
      "bg-purple-50 border-purple-200",
      "bg-orange-50 border-orange-200",
      "bg-pink-50 border-pink-200",
    ];
    const barColors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
    ];
    const randomColor = i % 5;

    return (
      <Card
        key={i}
        className={`relative overflow-hidden transition-all duration-200 ${bgColors[randomColor]} border`}
      >
        {/* Color indicator bar */}
        <div
          className={`absolute top-0 left-0 h-full w-1 ${barColors[randomColor]}`}
        />

        <CardContent className="p-6 pl-8">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              {/* Title and badge skeleton */}
              <div className="mb-2 flex items-center gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              {/* Date and duration skeleton */}
              <div className="mb-3 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>

              {/* Description skeleton */}
              <div className="mb-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>

              {/* Location skeleton */}
              <div className="mb-4 flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Menu button skeleton */}
            <Skeleton className="h-8 w-8" />
          </div>

          {/* Bottom section with participants and event type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="flex -space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="ml-1 h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  });

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {skeletonCards}
    </div>
  );
}

export default EventSkeleton;
