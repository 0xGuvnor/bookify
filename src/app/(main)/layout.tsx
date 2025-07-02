import Navbar from "@/components/navbar";
import { currentUser } from "@clerk/nextjs/server";
import { ReactNode } from "react";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const clerkUser = await currentUser();

  // Extract only serializable properties needed for the navbar
  const user = clerkUser
    ? {
        id: clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      }
    : null;

  return (
    <main>
      <Navbar user={user} />
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-40">
        {children}
      </section>
    </main>
  );
}
