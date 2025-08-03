import { redirect } from "next/navigation";
import { serverAuth } from "@/lib/auth/server";
import { getCustomerAppointments } from "@/lib/actions/appointments";
import { CustomerPanelContent } from "./CustomerPanelContent";
import type { CustomerAppointment } from "@/lib/types/customer";

export default async function CustomerPage() {
  const user = await serverAuth.getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  let appointments: CustomerAppointment[] = [];

  try {
    appointments = await getCustomerAppointments(user.email);
  } catch (error) {
    console.error("Error loading customer appointments:", error);
    // Continue with empty appointments array
  }

  return <CustomerPanelContent appointments={appointments} />;
}
