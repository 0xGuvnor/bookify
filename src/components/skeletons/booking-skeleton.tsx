import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";

export function BookingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <Skeleton className="mx-auto mb-2 h-8 w-64" />
          <Skeleton className="mx-auto h-4 w-80" />
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Event Information */}
              <div className="rounded-lg bg-gray-50 p-4">
                <Skeleton className="mb-3 h-5 w-16" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>

              {/* Booking Information Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-16" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-20" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>

                {/* Meeting Link */}
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-24" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="mt-0.5 h-5 w-5" />
                  <div className="flex-1">
                    <Skeleton className="mb-1 h-4 w-28" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-1 h-4 w-3/4" />
                  </div>
                </div>
              </div>

              {/* Booking ID */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="mb-1 h-4 w-20" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="mb-1 h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
}
