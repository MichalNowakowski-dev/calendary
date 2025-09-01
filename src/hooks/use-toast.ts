import { showToast } from "@/lib/toast";

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    const message = title && description ? `${title}: ${description}` : title || description || "";
    
    if (variant === "destructive") {
      showToast.error(message);
    } else {
      showToast.success(message);
    }
  };

  return { toast };
}