import { Suspense } from "react";
import { getSchedule } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";
import ScheduleForm from "@/components/forms/schedule-form";
import ScheduleFormSkeleton from "@/components/skeletons/schedule-form-skeleton";

async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const schedulePromise = getSchedule(userId);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Schedule Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your availability to let others know when you&apos;re free
          to meet.
        </p>
      </div>
      <Suspense fallback={<ScheduleFormSkeleton />}>
        <ScheduleForm schedulePromise={schedulePromise} />
      </Suspense>
    </div>
  );
}
export default SchedulePage;
