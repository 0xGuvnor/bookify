import { clerkClient, User } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPublicEvents } from "@/lib/actions";
import PublicEventsList from "@/components/public-events-list";
import PublicEventsSkeleton from "@/components/skeletons/public-events-skeleton";

interface Props {
  params: Promise<{ userId: string }>;
}

async function BookPage({ params }: Props) {
  const { userId } = await params;

  const client = await clerkClient();

  let user: User;
  try {
    user = await client.users.getUser(userId);
  } catch {
    notFound();
  }

  // Get public events promise without awaiting
  const publicEventsPromise = getPublicEvents(userId);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Book with {user.firstName} {user.lastName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Schedule a meeting with {user.firstName || "this user"}
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          {user.imageUrl && (
            <img
              src={user.imageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="size-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground text-sm">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Public Events List */}
      <div className="mt-6">
        <Suspense fallback={<PublicEventsSkeleton />}>
          <PublicEventsList
            eventsPromise={publicEventsPromise}
            userName={user.firstName || "this user"}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default BookPage;
