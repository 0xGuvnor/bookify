import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Globe } from "lucide-react";

function ScheduleFormSkeleton() {
  return (
    <div className="space-y-8">
      {/* Timezone Section Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Timezone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Availability Section Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-32" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit Button Skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-11 w-40" />
      </div>
    </div>
  );
}

export default ScheduleFormSkeleton;
