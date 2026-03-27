import { Navbar } from "@/components/Navbar";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) redirect("/login");

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">{children}</main>
    </>
  );
}
