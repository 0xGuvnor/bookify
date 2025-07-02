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
      <LandingPage />
    </>
  );
}
