function EventsPage() {
  return (
    <div className="min-h-screenx h-[150vh] bg-gradient-to-br from-blue-50 to-indigo-100 pt-14">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            Welcome back to{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Bookify!
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            You're all set! Your dashboard is ready for you to manage your
            appointments, set your availability, and connect with clients.
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                📅 Manage Calendar
              </h3>
              <p className="text-gray-600">
                Set your availability and let others book time with you
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                🔗 Share Your Link
              </h3>
              <p className="text-gray-600">
                Get your personal booking link to share with clients
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                📊 View Analytics
              </h3>
              <p className="text-gray-600">
                Track your meetings and optimize your schedule
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EventsPage;
