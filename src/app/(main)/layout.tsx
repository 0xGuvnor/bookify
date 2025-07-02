import Navbar from "@/components/navbar";
import { currentUser } from "@clerk/nextjs/server";
import { ReactNode } from "react";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();

  return (
    <main>
      <Navbar />
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </section>
    </main>
  );
}
