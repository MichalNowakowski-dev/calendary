import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      slots.push(
        `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      );
    }
  }
  return slots;
};

export const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

export const getMaxDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  return maxDate.toISOString().split("T")[0];
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(
    price
  );
