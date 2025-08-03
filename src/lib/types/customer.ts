export interface CustomerAppointment {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: "pending" | "paid" | "refunded" | "cancelled";
  payment_method: "on_site" | "online" | "deposit";
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
  created_at: string;
  service: {
    name: string;
    price: number;
    duration_minutes: number;
  };
  employee?: {
    name: string;
  };
  company: {
    name: string;
    address_street: string | null;
    address_city: string | null;
  };
}
