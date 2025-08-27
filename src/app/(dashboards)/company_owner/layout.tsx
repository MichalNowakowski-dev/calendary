import DashboardClient from "./DashboardClient";

// Force dynamic rendering since we use cookies for authentication
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardClient>{children}</DashboardClient>;
}
