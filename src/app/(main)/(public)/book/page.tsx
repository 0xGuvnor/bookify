import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function BookPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  // If user is authenticated, redirect to their specific booking page
  redirect(`/book/${userId}`);
}

export default BookPage;
