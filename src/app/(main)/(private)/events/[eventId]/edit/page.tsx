import EditEventForm from "@/components/forms/edit-event-form";
import EditEventSkeleton from "@/components/skeletons/edit-event-skeleton";
import { getEvent } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

interface Props {
  params: Promise<{
    eventId: string;
  }>;
}

async function EditEventPage({ params }: Props) {
  const { eventId } = await params;
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  // Create the promise for the event data
  const eventPromise = getEvent(userId, eventId);

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<EditEventSkeleton />}>
        <EditEventForm eventPromise={eventPromise} eventId={eventId} />
      </Suspense>
    </div>
  );
}
export default EditEventPage;
