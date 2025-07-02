import PublicNavbar from "@/components/navbar/public-navbar";
import PrivateNavbar from "@/components/navbar/private-navbar";
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
      {/* {user ? <PrivateNavbar /> : <PublicNavbar />} */}
      <PublicNavbar />
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-[7.5rem]">
        {children}
      </section>
    </main>
  );
}
