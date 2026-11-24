import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { getSessionFromCookies, toSafeUser } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  const user = await findUserById(session.userId);
  if (!user) {
    redirect("/login");
  }

  return <DashboardShell user={toSafeUser(user)}>{children}</DashboardShell>;
}
