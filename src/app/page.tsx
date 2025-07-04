import LandingPage from "@/components/landing-page";
import Navbar from "@/components/navbar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect("/events");
  }

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-32 sm:pt-36 md:pt-40 lg:pt-44 xl:pt-48">
        <LandingPage />
      </section>
    </>
  );
}
