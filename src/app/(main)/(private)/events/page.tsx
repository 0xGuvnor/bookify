import Link from "next/link";
import { Button } from "@/components/ui/button";
import CopyLinkCard from "@/components/copy-link-card";

function EventsPage() {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center">
        <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
          Welcome back to{" "}
          <span className="animate-pulse bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Bookify!
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          You&apos;re all set! Your dashboard is ready for you to manage your
          appointments, set your availability, and connect with clients.
        </p>

        {/* Create New Event Button */}
        <div className="mb-12">
          <Button
            asChild
            size="lg"
            className="gradient-button cursor-pointer rounded-full px-8 py-3 font-semibold text-white shadow-lg lg:py-6 lg:text-xl"
          >
            <Link href="/events/new">
              <span className="smooth-transition hover:scale-105">
                ✨ Create New Event
              </span>
            </Link>
          </Button>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <Link href="/schedule" className="block">
            <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                📅 Manage Calendar
              </h3>
              <p className="text-gray-600">
                Set your availability and let others book time with you
              </p>
            </div>
          </Link>

          <CopyLinkCard />

          <Link href="/analytics" className="block">
            <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                📊 View Analytics
              </h3>
              <p className="text-gray-600">
                Track your meetings and optimize your schedule
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default EventsPage;
